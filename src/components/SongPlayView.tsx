import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FeedbackMode,
  HitEvaluation,
  midiToNoteInfo,
  SessionStats,
  SheetNote,
  SongPiece,
} from '../types/music';
import { SONG_LIBRARY } from '../data/songLibrary';
import { StaffNotation } from './StaffNotation';
import { PianoKeyboard } from './PianoKeyboard';
import { PracticeControlDeck } from './PracticeControlDeck';
import { PracticeAnalyticsModal } from './PracticeAnalyticsModal';
import { audioEngine } from '../services/audioEngine';
import { midiService } from '../services/midiService';

interface SongPlayViewProps {
  activeMidiNotes: Set<number>;
  lastMidiEvent: { midi: number; velocity: number; timestamp: number } | null;
  onVirtualPlay: (midi: number) => void;
  onVirtualRelease: (midi: number) => void;
}

export const SongPlayView: React.FC<SongPlayViewProps> = ({
  activeMidiNotes,
  lastMidiEvent,
  onVirtualPlay,
  onVirtualRelease,
}) => {
  const [selectedSongId, setSelectedSongId] = useState<string>(SONG_LIBRARY[0].id);
  const currentSong = SONG_LIBRARY.find((s) => s.id === selectedSongId) || SONG_LIBRARY[0];

  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [isPlayingFlow, setIsPlayingFlow] = useState<boolean>(false);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('wait');
  const [bpm, setBpm] = useState<number>(currentSong.defaultBpm);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showNoteHints, setShowNoteHints] = useState<boolean>(true);
  const [keyboardLabels, setKeyboardLabels] = useState<'pitch' | 'solfege' | 'shortcuts' | 'none'>('pitch');
  const [showReport, setShowReport] = useState<boolean>(false);

  const [wrongMidi, setWrongMidi] = useState<number | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<HitEvaluation | null>(null);

  // Statistics
  const [stats, setStats] = useState<SessionStats>({
    totalTargetNotes: currentSong.notes.length,
    playedNotes: 0,
    correctNotes: 0,
    wrongNotes: 0,
    currentStreak: 0,
    maxStreak: 0,
    timingStats: { perfect: 0, good: 0, early: 0, late: 0 },
    mistakeFrequency: {},
    startTime: Date.now(),
  });

  const lastProcessedTimestampRef = useRef<number>(0);
  const noteExpectedTimeRef = useRef<number>(performance.now());
  const currentNote = currentSong.notes[currentNoteIndex] || null;
  const upcomingNotes = currentSong.notes.slice(currentNoteIndex + 1, currentNoteIndex + 6);

  // Reset song state when changing songs
  const resetSong = useCallback((song: SongPiece) => {
    setCurrentNoteIndex(0);
    setIsPlayingFlow(false);
    setBpm(song.defaultBpm);
    setWrongMidi(null);
    setLastEvaluation(null);
    noteExpectedTimeRef.current = performance.now();
    setStats({
      totalTargetNotes: song.notes.length,
      playedNotes: 0,
      correctNotes: 0,
      wrongNotes: 0,
      currentStreak: 0,
      maxStreak: 0,
      timingStats: { perfect: 0, good: 0, early: 0, late: 0 },
      mistakeFrequency: {},
      startTime: Date.now(),
    });
  }, []);

  useEffect(() => {
    resetSong(currentSong);
  }, [selectedSongId, resetSong, currentSong]);

  // Handle incoming MIDI keystroke
  useEffect(() => {
    if (!lastMidiEvent || !currentNote) return;
    if (lastMidiEvent.timestamp <= lastProcessedTimestampRef.current) return;
    lastProcessedTimestampRef.current = lastMidiEvent.timestamp;

    const playedMidi = lastMidiEvent.midi;
    const isCorrect = playedMidi === currentNote.midi;
    const timeDeltaMs = performance.now() - noteExpectedTimeRef.current;

    let timingGrade: 'perfect' | 'good' | 'early' | 'late' | 'wrong' = 'good';
    if (!isCorrect) {
      timingGrade = 'wrong';
    } else {
      if (Math.abs(timeDeltaMs) <= 65) timingGrade = 'perfect';
      else if (timeDeltaMs < -65) timingGrade = 'early';
      else timingGrade = 'late';
    }

    const evaluation: HitEvaluation = {
      expectedMidi: currentNote.midi,
      playedMidi,
      isCorrect,
      timeDeltaMs,
      timingGrade,
      timestamp: lastMidiEvent.timestamp,
    };
    setLastEvaluation(evaluation);

    if (isCorrect) {
      setWrongMidi(null);
      audioEngine.playSuccessTone();

      setStats((prev) => {
        const nextStreak = prev.currentStreak + 1;
        const newTimingStats = { ...prev.timingStats };
        if (timingGrade === 'perfect') newTimingStats.perfect++;
        else if (timingGrade === 'early') newTimingStats.early++;
        else if (timingGrade === 'late') newTimingStats.late++;
        else newTimingStats.good++;

        const newPlayed = prev.playedNotes + 1;
        const newCorrect = prev.correctNotes + 1;

        // Check completion
        if (currentNoteIndex + 1 >= currentSong.notes.length) {
          setTimeout(() => setShowReport(true), 500);
        }

        return {
          ...prev,
          playedNotes: newPlayed,
          correctNotes: newCorrect,
          currentStreak: nextStreak,
          maxStreak: Math.max(prev.maxStreak, nextStreak),
          timingStats: newTimingStats,
        };
      });

      // Move to next note
      if (currentNoteIndex + 1 < currentSong.notes.length) {
        setCurrentNoteIndex((prev) => prev + 1);
        noteExpectedTimeRef.current = performance.now();
      }
    } else {
      // Wrong note
      setWrongMidi(playedMidi);
      const playedInfo = midiToNoteInfo(playedMidi);

      setStats((prev) => {
        const mistakeRecord = { ...prev.mistakeFrequency };
        const key = currentNote.name;
        if (!mistakeRecord[key]) {
          mistakeRecord[key] = {
            count: 1,
            noteName: currentNote.name,
            clef: currentNote.clef,
            mistakenFor: [playedInfo.name],
          };
        } else {
          mistakeRecord[key].count++;
          if (!mistakeRecord[key].mistakenFor.includes(playedInfo.name)) {
            mistakeRecord[key].mistakenFor.push(playedInfo.name);
          }
        }

        return {
          ...prev,
          playedNotes: prev.playedNotes + 1,
          wrongNotes: prev.wrongNotes + 1,
          currentStreak: 0,
          mistakeFrequency: mistakeRecord,
        };
      });

      // In Flow Mode, keep marching even if missed or wrong
      if (feedbackMode === 'flow' && isPlayingFlow) {
        setTimeout(() => {
          if (currentNoteIndex + 1 < currentSong.notes.length) {
            setCurrentNoteIndex((prev) => prev + 1);
            setWrongMidi(null);
            noteExpectedTimeRef.current = performance.now();
          } else {
            setShowReport(true);
          }
        }, 300);
      }
    }
  }, [lastMidiEvent, currentNote, currentNoteIndex, currentSong.notes.length, feedbackMode, isPlayingFlow]);

  // Flow Mode Beat Timer: automatically march to the beat when isPlayingFlow is active
  useEffect(() => {
    if (!isPlayingFlow || feedbackMode !== 'flow') return;
    const beatMs = (60 / bpm) * 1000 * (currentNote?.duration || 1);
    const timer = setTimeout(() => {
      // Advance to next note
      if (currentNoteIndex + 1 < currentSong.notes.length) {
        setCurrentNoteIndex((prev) => prev + 1);
        noteExpectedTimeRef.current = performance.now();
      } else {
        setIsPlayingFlow(false);
        setShowReport(true);
      }
    }, beatMs);
    return () => clearTimeout(timer);
  }, [isPlayingFlow, feedbackMode, bpm, currentNoteIndex, currentSong.notes.length, currentNote?.duration]);

  // Metronome Sound
  useEffect(() => {
    if (!isMetronomePlaying) return;
    const intervalMs = (60 / bpm) * 1000;
    let count = 0;
    const timer = setInterval(() => {
      audioEngine.playMetronomeTick(count % 4 === 0);
      count++;
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isMetronomePlaying, bpm]);

  const accuracy = stats.playedNotes > 0
    ? Math.round((stats.correctNotes / stats.playedNotes) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Song Selection Carousel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>经典名作与练习曲跟弹</span>
            <span className="text-xs font-normal text-slate-400">· 实时旋律指引与打分</span>
          </h2>
          <span className="text-xs text-slate-400">
            共 {SONG_LIBRARY.length} 首精选曲目
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SONG_LIBRARY.map((song) => {
            const isSelected = song.id === selectedSongId;
            return (
              <button
                key={song.id}
                type="button"
                onClick={() => setSelectedSongId(song.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{song.title}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-800/40">
                      {song.difficulty}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{song.composer}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {song.description}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{song.notes.length} 音符</span>
                  <span>{song.defaultBpm} BPM</span>
                  <span>{song.keySignature} 大调</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Song Context Kicker */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">{currentSong.title}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{currentSong.subtitle}</span>
          {currentNote && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono">
                第 {currentNote.measure} 小节 · 第 {currentNote.beat} 拍
              </span>
            </>
          )}
        </div>

        {/* In Flow Mode: Play/Pause button */}
        {feedbackMode === 'flow' && (
          <button
            type="button"
            onClick={() => setIsPlayingFlow(!isPlayingFlow)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              isPlayingFlow
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isPlayingFlow ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>暂停流转</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>开始跟弹流转</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Grand Staff Viewport */}
      <StaffNotation
        currentNote={currentNote}
        upcomingNotes={upcomingNotes}
        lastPlayedMidi={lastMidiEvent?.midi || null}
        lastEvaluation={lastEvaluation}
        showNoteHints={showNoteHints}
        clefMode="both"
      />

      {/* Practice Control Deck */}
      <PracticeControlDeck
        feedbackMode={feedbackMode}
        onChangeFeedbackMode={(mode) => {
          setFeedbackMode(mode);
          if (mode === 'wait') setIsPlayingFlow(false);
        }}
        isMetronomePlaying={isMetronomePlaying}
        onToggleMetronome={() => setIsMetronomePlaying(!isMetronomePlaying)}
        bpm={bpm}
        onChangeBpm={setBpm}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          audioEngine.setMuted(next);
        }}
        showNoteHints={showNoteHints}
        onToggleNoteHints={() => setShowNoteHints(!showNoteHints)}
        keyboardLabels={keyboardLabels}
        onChangeKeyboardLabels={setKeyboardLabels}
        accuracy={accuracy}
        streak={stats.currentStreak}
        currentProgress={{ current: currentNoteIndex + 1, total: currentSong.notes.length }}
        onRestart={() => resetSong(currentSong)}
      />

      {/* Visual Interactive Piano Keyboard */}
      <PianoKeyboard
        activeMidiNotes={activeMidiNotes}
        targetMidi={currentNote?.midi || null}
        wrongMidi={wrongMidi}
        onKeyPlay={(midi) => {
          onVirtualPlay(midi);
          midiService.triggerVirtualNoteOn(midi);
        }}
        onKeyRelease={(midi) => {
          onVirtualRelease(midi);
          midiService.triggerVirtualNoteOff(midi);
        }}
        showLabels={keyboardLabels}
        startOctave={2}
        octaveCount={4}
      />

      {/* Performance Analytics Modal */}
      {showReport && (
        <PracticeAnalyticsModal
          stats={stats}
          sessionTitle={currentSong.title}
          onClose={() => setShowReport(false)}
          onRetry={() => {
            resetSong(currentSong);
            setShowReport(false);
          }}
        />
      )}
    </div>
  );
};
