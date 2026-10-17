import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ClefType,
  FeedbackMode,
  HitEvaluation,
  midiToNoteInfo,
  SessionStats,
  SheetNote,
} from '../types/music';
import { SIGHT_READING_LEVELS, SightReadingLevel } from '../data/songLibrary';
import { StaffNotation } from './StaffNotation';
import { PianoKeyboard } from './PianoKeyboard';
import { PracticeControlDeck } from './PracticeControlDeck';
import { PracticeAnalyticsModal } from './PracticeAnalyticsModal';
import { audioEngine } from '../services/audioEngine';
import { midiService } from '../services/midiService';

interface SightReadingViewProps {
  activeMidiNotes: Set<number>;
  lastMidiEvent: { midi: number; velocity: number; timestamp: number } | null;
  onVirtualPlay: (midi: number) => void;
  onVirtualRelease: (midi: number) => void;
  initialCurriculumId?: string;
}

export const SightReadingView: React.FC<SightReadingViewProps> = ({
  activeMidiNotes,
  lastMidiEvent,
  onVirtualPlay,
  onVirtualRelease,
  initialCurriculumId,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<string>(
    initialCurriculumId || 'treble-c-position'
  );
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('wait');
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(76);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showNoteHints, setShowNoteHints] = useState<boolean>(true);
  const [keyboardLabels, setKeyboardLabels] = useState<'pitch' | 'solfege' | 'shortcuts' | 'none'>('pitch');
  const [showReport, setShowReport] = useState<boolean>(false);

  // Drill State
  const currentLevel = SIGHT_READING_LEVELS.find((l) => l.id === selectedLevelId) || SIGHT_READING_LEVELS[0];
  const [targetNote, setTargetNote] = useState<SheetNote | null>(null);
  const [upcomingNotes, setUpcomingNotes] = useState<SheetNote[]>([]);
  const [wrongMidi, setWrongMidi] = useState<number | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<HitEvaluation | null>(null);

  // Statistics
  const [stats, setStats] = useState<SessionStats>({
    totalTargetNotes: 20,
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
  const targetNoteStartTimeRef = useRef<number>(Date.now());

  // Generate a randomized note from the allowed pool
  const generateRandomNote = useCallback((level: SightReadingLevel, index: number): SheetNote => {
    const midis = level.allowedMidis;
    const randomIndex = Math.floor(Math.random() * midis.length);
    const midi = midis[randomIndex];
    const info = midiToNoteInfo(midi);
    
    // Choose clef based on level setting or note pitch
    let clef: ClefType = info.clef;
    if (level.clef === 'treble') clef = 'treble';
    else if (level.clef === 'bass') clef = 'bass';

    return {
      id: `sr-${Date.now()}-${index}`,
      midi,
      name: info.name,
      octave: info.octave,
      clef,
      duration: 1,
      measure: Math.floor(index / 4) + 1,
      beat: (index % 4) + 1,
      accidental: info.accidental,
    };
  }, []);

  // Initialize or restart drill sequence
  const initDrill = useCallback((level: SightReadingLevel) => {
    const first = generateRandomNote(level, 0);
    const nextList: SheetNote[] = [];
    for (let i = 1; i <= 5; i++) {
      nextList.push(generateRandomNote(level, i));
    }
    setTargetNote(first);
    setUpcomingNotes(nextList);
    setWrongMidi(null);
    setLastEvaluation(null);
    targetNoteStartTimeRef.current = performance.now();
    setStats({
      totalTargetNotes: 20,
      playedNotes: 0,
      correctNotes: 0,
      wrongNotes: 0,
      currentStreak: 0,
      maxStreak: 0,
      timingStats: { perfect: 0, good: 0, early: 0, late: 0 },
      mistakeFrequency: {},
      startTime: Date.now(),
    });
  }, [generateRandomNote]);

  useEffect(() => {
    initDrill(currentLevel);
  }, [selectedLevelId, initDrill, currentLevel]);

  // Handle incoming MIDI input and evaluate match
  useEffect(() => {
    if (!lastMidiEvent || !targetNote) return;
    if (lastMidiEvent.timestamp <= lastProcessedTimestampRef.current) return;
    lastProcessedTimestampRef.current = lastMidiEvent.timestamp;

    const playedMidi = lastMidiEvent.midi;
    const isCorrect = playedMidi === targetNote.midi;
    const timeDeltaMs = performance.now() - targetNoteStartTimeRef.current;

    let timingGrade: 'perfect' | 'good' | 'early' | 'late' | 'wrong' = 'good';
    if (!isCorrect) {
      timingGrade = 'wrong';
    } else if (timeDeltaMs < 1200) {
      timingGrade = 'perfect';
    }

    const evaluation: HitEvaluation = {
      expectedMidi: targetNote.midi,
      playedMidi,
      isCorrect,
      timeDeltaMs,
      timingGrade,
      timestamp: lastMidiEvent.timestamp,
    };
    setLastEvaluation(evaluation);

    if (isCorrect) {
      // Correct hit!
      setWrongMidi(null);
      audioEngine.playSuccessTone();

      setStats((prev) => {
        const nextStreak = prev.currentStreak + 1;
        const newTimingStats = { ...prev.timingStats };
        if (timingGrade === 'perfect') newTimingStats.perfect++;
        else newTimingStats.good++;

        const newPlayed = prev.playedNotes + 1;
        const newCorrect = prev.correctNotes + 1;

        // Check if finished round (e.g. 20 notes)
        if (newCorrect >= prev.totalTargetNotes) {
          setTimeout(() => setShowReport(true), 400);
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

      // Shift to next note
      setTimeout(() => {
        if (upcomingNotes.length > 0) {
          const next = upcomingNotes[0];
          const rest = upcomingNotes.slice(1);
          rest.push(generateRandomNote(currentLevel, stats.playedNotes + 6));
          setTargetNote(next);
          setUpcomingNotes(rest);
          targetNoteStartTimeRef.current = performance.now();
        }
      }, 150);
    } else {
      // Wrong note hit!
      setWrongMidi(playedMidi);
      const playedInfo = midiToNoteInfo(playedMidi);

      setStats((prev) => {
        const mistakeRecord = { ...prev.mistakeFrequency };
        const key = targetNote.name;
        if (!mistakeRecord[key]) {
          mistakeRecord[key] = {
            count: 1,
            noteName: targetNote.name,
            clef: targetNote.clef,
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

      // If in flow mode, also advance anyway after recording mistake
      if (feedbackMode === 'flow') {
        setTimeout(() => {
          if (upcomingNotes.length > 0) {
            const next = upcomingNotes[0];
            const rest = upcomingNotes.slice(1);
            rest.push(generateRandomNote(currentLevel, stats.playedNotes + 6));
            setTargetNote(next);
            setUpcomingNotes(rest);
            setWrongMidi(null);
            targetNoteStartTimeRef.current = performance.now();
          }
        }, 350);
      }
    }
  }, [lastMidiEvent, targetNote, upcomingNotes, feedbackMode, currentLevel, generateRandomNote, stats.playedNotes]);

  // Metronome loop
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
      {/* Level Selection Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>五线谱速记识谱闯关</span>
            <span className="text-xs font-normal text-slate-400">· 目标 20 音速记通关</span>
          </h2>
          <span className="text-xs text-slate-400">
            难度: <strong className="text-emerald-400">{currentLevel.difficulty}</strong>
          </span>
        </div>

        {/* Level Buttons (Functional segmented buttons) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SIGHT_READING_LEVELS.map((level) => {
            const isSelected = level.id === selectedLevelId;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setSelectedLevelId(level.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white truncate">{level.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {level.description}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-400 font-medium">
                  {level.difficulty} · {level.allowedMidis.length} 个核心音
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage: Grand Staff */}
      <StaffNotation
        currentNote={targetNote}
        upcomingNotes={upcomingNotes}
        lastPlayedMidi={lastMidiEvent?.midi || null}
        lastEvaluation={lastEvaluation}
        showNoteHints={showNoteHints}
        clefMode={currentLevel.clef}
      />

      {/* Practice Control Deck */}
      <PracticeControlDeck
        feedbackMode={feedbackMode}
        onChangeFeedbackMode={setFeedbackMode}
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
        currentProgress={{ current: stats.correctNotes, total: stats.totalTargetNotes }}
        onRestart={() => initDrill(currentLevel)}
      />

      {/* Visual Interactive Piano Keyboard */}
      <PianoKeyboard
        activeMidiNotes={activeMidiNotes}
        targetMidi={targetNote?.midi || null}
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

      {/* Analytics Modal on Round Finish */}
      {showReport && (
        <PracticeAnalyticsModal
          stats={stats}
          sessionTitle={currentLevel.name}
          onClose={() => setShowReport(false)}
          onRetry={() => {
            initDrill(currentLevel);
            setShowReport(false);
          }}
          onSwitchCurriculum={(id) => {
            setSelectedLevelId(id);
            setShowReport(false);
          }}
        />
      )}
    </div>
  );
};
