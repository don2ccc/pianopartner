/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FeedbackMode,
  HitEvaluation,
  MidiInputDevice,
  midiToNoteInfo,
  PracticeMode,
  SessionStats,
  SheetNote,
} from './types/music';
import { SIGHT_READING_LEVELS, SONG_LIBRARY, SightReadingLevel } from './data/songLibrary';
import { midiService } from './services/midiService';
import { audioEngine } from './services/audioEngine';
import { StaffNotation } from './components/StaffNotation';
import { PianoKeyboard } from './components/PianoKeyboard';
import { SettingsDrawer } from './components/SettingsDrawer';
import { PracticeAnalyticsModal } from './components/PracticeAnalyticsModal';
import { HowToPlayModal } from './components/HowToPlayModal';

// Computer keyboard mappings for physical keyboard input fallback
const KEY_TO_MIDI_MAP: Record<string, number> = {
  // Octave 3 (z to m)
  z: 48, // C3
  s: 49, // C#3
  x: 50, // D3
  d: 51, // D#3
  c: 52, // E3
  v: 53, // F3
  g: 54, // F#3
  b: 55, // G3
  h: 56, // G#3
  n: 57, // A3
  j: 58, // A#3
  m: 59, // B3

  // Octave 4 (q to u)
  q: 60, // C4
  '2': 61, // C#4
  w: 62, // D4
  '3': 63, // D#4
  e: 64, // E4
  r: 65, // F4
  '5': 66, // F#4
  t: 67, // G4
  '6': 68, // G#4
  y: 69, // A4
  '7': 70, // A#4
  u: 71, // B4

  // Octave 5 (i to p)
  i: 72, // C5
  '9': 73, // C#5
  o: 74, // D5
  '0': 75, // D#5
  p: 76, // E5
  '[': 77, // F5
};

export default function App() {
  // Navigation & Drawer
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Configuration State
  const [toleranceMs, setToleranceMs] = useState<number>(120); // 宽松初学 ±120ms (让初学与正常按键轻松拿完美)
  const [latencyOffsetMs, setLatencyOffsetMs] = useState<number>(0); // 硬件声卡/USB驱动延迟补偿 (ms)
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('sight-reading');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('rhythm-quarter-pulse');
  const [selectedSongId, setSelectedSongId] = useState<string>(SONG_LIBRARY[0].id);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('wait');
  const [bpm, setBpm] = useState<number>(76);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(true); // on by default to guide rhythm
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showNoteHints, setShowNoteHints] = useState<boolean>(true);
  const [keyboardLabels, setKeyboardLabels] = useState<'pitch' | 'solfege' | 'shortcuts' | 'none'>('pitch');
  const [startOctave, setStartOctave] = useState<number>(2); // C2

  // Rhythmic Beat Clock State
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [beatProgress, setBeatProgress] = useState<number>(0);
  const [countInBeatsRemaining, setCountInBeatsRemaining] = useState<number | null>(4);
  const [enableCountIn, setEnableCountIn] = useState<boolean>(true);

  // MIDI Hardware State
  const [midiDevices, setMidiDevices] = useState<MidiInputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set());
  const [lastMidiEvent, setLastMidiEvent] = useState<{
    midi: number;
    velocity: number;
    timestamp: number;
  } | null>(null);

  // Interactive Practice State
  const currentLevel = SIGHT_READING_LEVELS.find((l) => l.id === selectedLevelId) || SIGHT_READING_LEVELS[0];
  const currentSong = SONG_LIBRARY.find((s) => s.id === selectedSongId) || SONG_LIBRARY[0];

  const [currentNote, setCurrentNote] = useState<SheetNote | null>(null);
  const [upcomingNotes, setUpcomingNotes] = useState<SheetNote[]>([]);
  const [songNoteIndex, setSongNoteIndex] = useState<number>(0);
  const [isPlayingSongFlow, setIsPlayingSongFlow] = useState<boolean>(false);
  const [wrongMidi, setWrongMidi] = useState<number | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<HitEvaluation | null>(null);

  // Session Statistics
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
  const noteExpectedTimeRef = useRef<number>(performance.now());
  const lastBeatTimeRef = useRef<number>(performance.now());

  // Generate random sight-reading note with optional duration
  const generateRandomNote = useCallback((level: SightReadingLevel, index: number): SheetNote => {
    const midis = level.allowedMidis;
    const randomIndex = Math.floor(Math.random() * midis.length);
    const midi = midis[randomIndex];
    const info = midiToNoteInfo(midi);

    const durations = level.allowedDurations || [1];
    const duration = durations[Math.floor(Math.random() * durations.length)];

    let clef = info.clef;
    if (level.clef === 'treble') clef = 'treble';
    else if (level.clef === 'bass') clef = 'bass';

    return {
      id: `sr-${Date.now()}-${index}`,
      midi,
      name: info.name,
      octave: info.octave,
      clef,
      duration,
      measure: Math.floor(index / 4) + 1,
      beat: (index % 4) + 1,
      accidental: info.accidental,
    };
  }, []);

  // Initialize practice session
  const initPracticeSession = useCallback(() => {
    setWrongMidi(null);
    setLastEvaluation(null);
    noteExpectedTimeRef.current = performance.now();
    lastBeatTimeRef.current = performance.now();
    if (enableCountIn) {
      setCountInBeatsRemaining(4);
    } else {
      setCountInBeatsRemaining(null);
    }

    if (practiceMode === 'sight-reading') {
      const first = generateRandomNote(currentLevel, 0);
      const nextList: SheetNote[] = [];
      for (let i = 1; i <= 5; i++) {
        nextList.push(generateRandomNote(currentLevel, i));
      }
      setCurrentNote(first);
      setUpcomingNotes(nextList);
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
    } else if (practiceMode === 'song-play') {
      setSongNoteIndex(0);
      setIsPlayingSongFlow(false);
      setCurrentNote(currentSong.notes[0] || null);
      setUpcomingNotes(currentSong.notes.slice(1, 6));
      setBpm(currentSong.defaultBpm);
      setStats({
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
    } else {
      // Free play
      setCurrentNote(null);
      setUpcomingNotes([]);
    }
  }, [practiceMode, currentLevel, currentSong, generateRandomNote]);

  useEffect(() => {
    initPracticeSession();
  }, [practiceMode, selectedLevelId, selectedSongId, initPracticeSession]);

  // Connect Web MIDI on Mount
  const connectMidi = useCallback(async () => {
    const res = await midiService.requestAccess();
    if (res.success) {
      setMidiDevices(res.devices);
    }
  }, []);

  useEffect(() => {
    connectMidi();

    const unsubDevices = midiService.onDeviceChange((devices) => {
      setMidiDevices(devices);
    });

    const unsubNoteOn = midiService.onNoteOn((midi, velocity, timestamp) => {
      audioEngine.playNote(midi, velocity);
      setActiveMidiNotes((prev) => {
        const next = new Set(prev);
        next.add(midi);
        return next;
      });
      setLastMidiEvent({ midi, velocity, timestamp });
    });

    const unsubNoteOff = midiService.onNoteOff((midi) => {
      audioEngine.stopNote(midi);
      setActiveMidiNotes((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    });

    return () => {
      unsubDevices();
      unsubNoteOn();
      unsubNoteOff();
    };
  }, [connectMidi]);

  // Keyboard shortcut listener for physical keys and 'Escape' / 's' for settings
  useEffect(() => {
    const pressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'Escape') {
        setIsSettingsOpen((prev) => !prev);
        return;
      }

      const key = e.key.toLowerCase();
      const midi = KEY_TO_MIDI_MAP[key];
      if (midi && !pressed.has(key)) {
        pressed.add(key);
        midiService.triggerVirtualNoteOn(midi, 80);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const midi = KEY_TO_MIDI_MAP[key];
      if (midi) {
        pressed.delete(key);
        midiService.triggerVirtualNoteOff(midi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // High-Resolution Rhythmic Beat Clock & Countdown Progress Animation
  useEffect(() => {
    let animId: number;
    const beatDurationMs = (60 / bpm) * 1000;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - lastBeatTimeRef.current;

      if (elapsed >= beatDurationMs) {
        lastBeatTimeRef.current += beatDurationMs;
        if (now - lastBeatTimeRef.current > beatDurationMs * 2) {
          lastBeatTimeRef.current = now;
        }

        setCountInBeatsRemaining((prevCount) => {
          if (prevCount === null) return null;
          if (prevCount > 1) {
            if (isMetronomePlaying) audioEngine.playMetronomeTick(prevCount === 4);
            return prevCount - 1;
          } else {
            if (isMetronomePlaying) audioEngine.playMetronomeTick(true);
            noteExpectedTimeRef.current = lastBeatTimeRef.current + beatDurationMs;
            return null;
          }
        });

        setCurrentBeat((prev) => {
          const next = (prev % 4) + 1;
          if (isMetronomePlaying && countInBeatsRemaining === null) {
            audioEngine.playMetronomeTick(next === 1);
          }
          return next;
        });
        setBeatProgress(0);
      } else {
        setBeatProgress(Math.min(1.0, elapsed / beatDurationMs));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [bpm, isMetronomePlaying]);

  // Main Keystroke Evaluation Logic
  useEffect(() => {
    if (!lastMidiEvent) return;
    if (lastMidiEvent.timestamp <= lastProcessedTimestampRef.current) return;
    lastProcessedTimestampRef.current = lastMidiEvent.timestamp;

    const playedMidi = lastMidiEvent.midi;

    // In Free-Play mode: update live note on staff
    if (practiceMode === 'free-play') {
      const info = midiToNoteInfo(playedMidi);
      setCurrentNote({
        id: `free-${lastMidiEvent.timestamp}`,
        midi: playedMidi,
        name: info.name,
        octave: info.octave,
        clef: info.clef,
        duration: 1,
        measure: 1,
        beat: 1,
        accidental: info.accidental,
      });
      return;
    }

    if (!currentNote) return;

    if (countInBeatsRemaining !== null) {
      // During 4-beat count-in, user is feeling the pulse and positioning fingers, no penalties
      return;
    }

    const isCorrect = playedMidi === currentNote.midi;
    const now = performance.now();
    const effectiveNow = now - latencyOffsetMs;
    const beatDurationMs = (60 / bpm) * 1000;

    let timeDeltaMs = effectiveNow - noteExpectedTimeRef.current;
    // Align with nearest beat if user paused or hesitated (> 2 beats)
    if (Math.abs(timeDeltaMs) > beatDurationMs * 2) {
      const elapsedSinceBeat = effectiveNow - lastBeatTimeRef.current;
      const timeToNextBeat = beatDurationMs - elapsedSinceBeat;
      if (elapsedSinceBeat <= timeToNextBeat) {
        timeDeltaMs = elapsedSinceBeat;
        noteExpectedTimeRef.current = lastBeatTimeRef.current;
      } else {
        timeDeltaMs = -timeToNextBeat;
        noteExpectedTimeRef.current = lastBeatTimeRef.current + beatDurationMs;
      }
    }

    let timingGrade: 'perfect' | 'good' | 'early' | 'late' | 'wrong' = 'good';
    if (!isCorrect) {
      timingGrade = 'wrong';
    } else if (feedbackMode === 'wait') {
      // 在等待纠错模式下，重点是认准谱面与按对琴键，弹对即给予完美鼓励！
      timingGrade = 'perfect';
      timeDeltaMs = 0;
    } else {
      // 在节拍流转模式下，基于用户选择的容差评判（默认宽松初学 ±120ms）
      if (Math.abs(timeDeltaMs) <= toleranceMs) timingGrade = 'perfect';
      else if (Math.abs(timeDeltaMs) <= toleranceMs * 1.8) timingGrade = 'good';
      else if (timeDeltaMs < -toleranceMs * 1.8) timingGrade = 'early'; // 抢拍
      else timingGrade = 'late'; // 拖拍
    }

    const evaluation: HitEvaluation = {
      expectedMidi: currentNote.midi,
      playedMidi,
      isCorrect,
      timeDeltaMs: feedbackMode === 'wait' ? 0 : timeDeltaMs,
      timingGrade,
      timestamp: lastMidiEvent.timestamp,
    };
    setLastEvaluation(evaluation);

    if (isCorrect) {
      setWrongMidi(null);
      audioEngine.playSuccessTone();

      setStats((prev) => {
        const nextStreak = prev.currentStreak + 1;
        const newTiming = { ...prev.timingStats };
        if (timingGrade === 'perfect') newTiming.perfect++;
        else if (timingGrade === 'early') newTiming.early++;
        else if (timingGrade === 'late') newTiming.late++;
        else newTiming.good++;

        const newPlayed = prev.playedNotes + 1;
        const newCorrect = prev.correctNotes + 1;

        if (newCorrect >= prev.totalTargetNotes) {
          setTimeout(() => setIsAnalyticsOpen(true), 400);
        }

        return {
          ...prev,
          playedNotes: newPlayed,
          correctNotes: newCorrect,
          currentStreak: nextStreak,
          maxStreak: Math.max(prev.maxStreak, nextStreak),
          timingStats: newTiming,
        };
      });

      // Advance Note
      const nextExpectedTime = noteExpectedTimeRef.current + (currentNote.duration || 1) * beatDurationMs;
      if (practiceMode === 'sight-reading') {
        setTimeout(() => {
          if (upcomingNotes.length > 0) {
            const next = upcomingNotes[0];
            const rest = upcomingNotes.slice(1);
            rest.push(generateRandomNote(currentLevel, stats.playedNotes + 6));
            setCurrentNote(next);
            setUpcomingNotes(rest);
            noteExpectedTimeRef.current = nextExpectedTime;
          }
        }, feedbackMode === 'wait' ? 140 : 60);
      } else if (practiceMode === 'song-play') {
        const nextIndex = songNoteIndex + 1;
        if (nextIndex < currentSong.notes.length) {
          const nextNote = currentSong.notes[nextIndex];
          setTimeout(() => {
            setSongNoteIndex(nextIndex);
            setCurrentNote(nextNote);
            setUpcomingNotes(currentSong.notes.slice(nextIndex + 1, nextIndex + 6));
            noteExpectedTimeRef.current = nextExpectedTime;
          }, feedbackMode === 'wait' ? 140 : 60);
        } else {
          setTimeout(() => setIsAnalyticsOpen(true), 400);
        }
      }
    } else {
      // Wrong note pressed
      setWrongMidi(playedMidi);
      const playedInfo = midiToNoteInfo(playedMidi);

      setStats((prev) => {
        const mistakes = { ...prev.mistakeFrequency };
        const key = currentNote.name;
        if (!mistakes[key]) {
          mistakes[key] = {
            count: 1,
            noteName: currentNote.name,
            clef: currentNote.clef,
            mistakenFor: [playedInfo.name],
          };
        } else {
          mistakes[key].count++;
          if (!mistakes[key].mistakenFor.includes(playedInfo.name)) {
            mistakes[key].mistakenFor.push(playedInfo.name);
          }
        }

        return {
          ...prev,
          playedNotes: prev.playedNotes + 1,
          wrongNotes: prev.wrongNotes + 1,
          currentStreak: 0,
          mistakeFrequency: mistakes,
        };
      });

      // In Flow Mode: move forward after error
      if (feedbackMode === 'flow') {
        const nextExpectedTime = noteExpectedTimeRef.current + (currentNote.duration || 1) * beatDurationMs;
        setTimeout(() => {
          if (practiceMode === 'sight-reading') {
            if (upcomingNotes.length > 0) {
              const next = upcomingNotes[0];
              const rest = upcomingNotes.slice(1);
              rest.push(generateRandomNote(currentLevel, stats.playedNotes + 6));
              setCurrentNote(next);
              setUpcomingNotes(rest);
              setWrongMidi(null);
              noteExpectedTimeRef.current = nextExpectedTime;
            }
          } else if (practiceMode === 'song-play') {
            const nextIndex = songNoteIndex + 1;
            if (nextIndex < currentSong.notes.length) {
              setSongNoteIndex(nextIndex);
              setCurrentNote(currentSong.notes[nextIndex]);
              setUpcomingNotes(currentSong.notes.slice(nextIndex + 1, nextIndex + 6));
              setWrongMidi(null);
              noteExpectedTimeRef.current = nextExpectedTime;
            } else {
              setIsAnalyticsOpen(true);
            }
          }
        }, 220);
      }
    }
  }, [
    lastMidiEvent,
    currentNote,
    practiceMode,
    feedbackMode,
    upcomingNotes,
    currentLevel,
    currentSong,
    songNoteIndex,
    generateRandomNote,
    stats.playedNotes,
    toleranceMs,
    latencyOffsetMs,
    bpm,
  ]);

  // Flow mode auto beat marcher for song play
  useEffect(() => {
    if (practiceMode !== 'song-play' || feedbackMode !== 'flow' || !isPlayingSongFlow) return;
    const beatMs = (60 / bpm) * 1000 * (currentNote?.duration || 1);
    const timer = setTimeout(() => {
      const nextIndex = songNoteIndex + 1;
      if (nextIndex < currentSong.notes.length) {
        setSongNoteIndex(nextIndex);
        setCurrentNote(currentSong.notes[nextIndex]);
        setUpcomingNotes(currentSong.notes.slice(nextIndex + 1, nextIndex + 6));
        noteExpectedTimeRef.current = performance.now();
      } else {
        setIsPlayingSongFlow(false);
        setIsAnalyticsOpen(true);
      }
    }, beatMs);
    return () => clearTimeout(timer);
  }, [practiceMode, feedbackMode, isPlayingSongFlow, bpm, songNoteIndex, currentSong.notes, currentNote?.duration]);

  // Virtual key actions
  const handleVirtualPlay = (midi: number) => {
    audioEngine.playNote(midi, 80);
    setActiveMidiNotes((prev) => {
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
    setLastMidiEvent({ midi, velocity: 80, timestamp: performance.now() });
  };

  const handleVirtualRelease = (midi: number) => {
    audioEngine.stopNote(midi);
    setActiveMidiNotes((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  const accuracy = stats.playedNotes > 0
    ? Math.round((stats.correctNotes / stats.playedNotes) * 100)
    : 100;

  const currentTitle = practiceMode === 'sight-reading'
    ? currentLevel.name
    : practiceMode === 'song-play'
    ? currentSong.title
    : '自由弹奏与和弦识别';

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* 1. Ultra-Slim Header HUD Bar (<48px height) */}
      <header className="h-12 px-4 md:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 z-40 backdrop-blur-md">
        {/* Left: Brand & Current Active Item */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <span className="font-bold text-white tracking-tight text-sm hidden sm:inline">琴韵 Maestro</span>
          </div>

          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>

          {/* Quick Curriculum / Song Title Tag */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-200 transition-colors cursor-pointer border border-slate-700/60"
            title="点击切换曲目、关卡或节奏模式"
          >
            <span className="text-emerald-400 font-semibold truncate max-w-[160px] md:max-w-[240px]">
              {currentTitle}
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Center: Live Real-time Status (Accuracy, Streak, Target Note) */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          {currentNote && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>目标音:</span>
              <strong className="text-white font-mono text-sm bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {currentNote.name}
              </strong>
            </div>
          )}
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            准确率: <strong className="text-emerald-400 font-mono tabular-nums">{accuracy}%</strong>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <div>
            连击: <strong className="text-sky-400 font-mono tabular-nums">{stats.currentStreak}</strong>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-500">
            {feedbackMode === 'wait' ? '等待纠错模式' : '节拍流转模式'}
          </span>
        </div>

        {/* Right: Quick Controls & Settings Drawer Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick How-To-Play Guide Button */}
          <button
            type="button"
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            title="查看新手练琴指南：节奏圆圈含义、4拍倒计时与获得 PERFECT 秘诀"
          >
            <span className="text-emerald-400 font-bold">♪</span>
            <span className="hidden sm:inline">怎么弹准节拍？</span>
            <span className="sm:hidden">秘诀</span>
          </button>

          {/* Quick Count-in Countdown Button */}
          <button
            type="button"
            onClick={() => {
              setCountInBeatsRemaining(4);
              lastBeatTimeRef.current = performance.now();
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title="预备拍倒计时 4 拍，帮助跟准节拍"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>4拍预备</span>
          </button>

          {/* Quick Reset */}
          <button
            type="button"
            onClick={initPracticeSession}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="重置当前轮次"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Quick Metronome Toggle with Live Beat Lamp */}
          <button
            type="button"
            onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isMetronomePlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="节拍器开关 (跟随滴答声弹奏)"
          >
            <span className={`w-2 h-2 rounded-full ${isMetronomePlaying ? (currentBeat === 1 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400') : 'bg-slate-600'}`} />
            <span>{bpm}</span>
            <span className="text-[10px] font-sans font-normal">BPM</span>
          </button>

          {/* Quick Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              audioEngine.setMuted(next);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              !isMuted
                ? 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={isMuted ? '网页已静音 (仅用电钢琴自带音箱)' : '网页物理合成音效已开启'}
          >
            {!isMuted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Primary Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>设置与曲库</span>
          </button>
        </div>
      </header>

      {/* 2. Main Stage: 5-Line Staff & Simulated Piano Keyboard */}
      <main className="flex-1 flex flex-col justify-between gap-3 p-3 md:p-5 max-w-[1400px] w-full mx-auto overflow-hidden">
        {/* Main Stage Zone 1: Big Grand Staff (五线谱) with Rhythmic Countdown */}
        <div className="flex-1 flex flex-col min-h-0">
          <StaffNotation
            currentNote={currentNote}
            upcomingNotes={upcomingNotes}
            lastPlayedMidi={lastMidiEvent?.midi || null}
            lastEvaluation={lastEvaluation}
            showNoteHints={showNoteHints}
            clefMode={practiceMode === 'sight-reading' ? currentLevel.clef : 'both'}
            beatProgress={beatProgress}
            currentBeat={currentBeat}
            bpm={bpm}
            countInBeatsRemaining={countInBeatsRemaining}
            toleranceMs={toleranceMs}
            feedbackMode={feedbackMode}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          />
        </div>

        {/* Main Stage Zone 2: Simulated Piano Keyboard (模拟键盘) with Beat-Synchronized Ring */}
        <div className="shrink-0">
          <PianoKeyboard
            activeMidiNotes={activeMidiNotes}
            targetMidi={currentNote?.midi || null}
            targetDuration={currentNote?.duration || 1}
            beatProgress={beatProgress}
            wrongMidi={wrongMidi}
            onKeyPlay={(midi) => {
              handleVirtualPlay(midi);
              midiService.triggerVirtualNoteOn(midi);
            }}
            onKeyRelease={(midi) => {
              handleVirtualRelease(midi);
              midiService.triggerVirtualNoteOff(midi);
            }}
            showLabels={keyboardLabels}
            startOctave={startOctave}
            onChangeStartOctave={setStartOctave}
            octaveCount={4}
          />
        </div>
      </main>

      {/* 3. Settings & Repertoire Drawer (收纳所有配置与关卡) */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        practiceMode={practiceMode}
        onChangePracticeMode={(m) => {
          setPracticeMode(m);
          initPracticeSession();
        }}
        selectedLevelId={selectedLevelId}
        onSelectLevelId={(id) => {
          setSelectedLevelId(id);
          initPracticeSession();
        }}
        selectedSongId={selectedSongId}
        onSelectSongId={(id) => {
          setSelectedSongId(id);
          initPracticeSession();
        }}
        feedbackMode={feedbackMode}
        onChangeFeedbackMode={setFeedbackMode}
        bpm={bpm}
        onChangeBpm={setBpm}
        isMetronomePlaying={isMetronomePlaying}
        onToggleMetronome={() => setIsMetronomePlaying(!isMetronomePlaying)}
        toleranceMs={toleranceMs}
        onChangeToleranceMs={setToleranceMs}
        latencyOffsetMs={latencyOffsetMs}
        onChangeLatencyOffsetMs={setLatencyOffsetMs}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          audioEngine.setMuted(next);
        }}
        enableCountIn={enableCountIn}
        onToggleEnableCountIn={() => setEnableCountIn(!enableCountIn)}
        showNoteHints={showNoteHints}
        onToggleNoteHints={() => setShowNoteHints(!showNoteHints)}
        keyboardLabels={keyboardLabels}
        onChangeKeyboardLabels={setKeyboardLabels}
        startOctave={startOctave}
        onChangeStartOctave={setStartOctave}
        midiDevices={midiDevices}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={(id) => {
          setSelectedDeviceId(id);
          midiService.selectDevice(id);
        }}
        onRefreshMidi={connectMidi}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* 4. Detailed Performance Analytics Modal */}
      {isAnalyticsOpen && (
        <PracticeAnalyticsModal
          stats={stats}
          sessionTitle={currentTitle}
          onClose={() => setIsAnalyticsOpen(false)}
          onRetry={() => {
            initPracticeSession();
            setIsAnalyticsOpen(false);
          }}
          onSwitchCurriculum={(id) => {
            setSelectedLevelId(id);
            setPracticeMode('sight-reading');
            setIsAnalyticsOpen(false);
          }}
        />
      )}

      {/* 5. How-To-Play & Rhythm Mastery Guide Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStartCountIn={() => {
          setCountInBeatsRemaining(4);
          lastBeatTimeRef.current = performance.now();
        }}
        toleranceMs={toleranceMs}
        onChangeToleranceMs={setToleranceMs}
        latencyOffsetMs={latencyOffsetMs}
        onChangeLatencyOffsetMs={setLatencyOffsetMs}
      />
    </div>
  );
}
