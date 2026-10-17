export type ClefType = 'treble' | 'bass';

export type PracticeMode = 'sight-reading' | 'chord-practice' | 'song-play' | 'free-play';

export type FeedbackMode = 'wait' | 'flow';

export interface NoteInfo {
  midi: number;
  name: string; // e.g. "C4", "F#4", "Bb3"
  pitchClass: string; // "C", "D", "E" etc.
  accidental?: 'sharp' | 'flat' | 'natural';
  octave: number;
  solfege: string; // "Do", "Re", "Mi" etc.
  solfegeZh: string; // "哆", "来", "咪" etc.
  clef: ClefType;
  diatonicStep: number; // 0 for C0, 28 for C4, etc.
}

export interface SheetNote {
  id: string;
  midi: number;
  name: string;
  octave: number;
  accidental?: 'sharp' | 'flat' | 'natural';
  clef: ClefType;
  duration: number; // in quarter notes (e.g. 1 = quarter, 0.5 = eighth, 2 = half, 4 = whole)
  measure: number;
  beat: number;
  hand?: 'right' | 'left';
  finger?: number; // 1 to 5
  lyricOrHint?: string;
  rhythmName?: string; // "四分音符 (1拍)", "二分音符 (2拍)", "八分音符 (半拍)"
}

export interface SongPiece {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  difficulty: '入门' | '进阶' | '挑战';
  defaultBpm: number;
  timeSignature: [number, number]; // e.g. [4, 4] or [3, 4]
  keySignature: string; // e.g. "C", "G", "F"
  tags: string[];
  description: string;
  notes: SheetNote[];
}

export interface MidiInputDevice {
  id: string;
  name: string;
  manufacturer?: string;
  state: string;
}

export interface HitEvaluation {
  expectedMidi: number;
  playedMidi: number;
  isCorrect: boolean;
  timeDeltaMs: number; // positive = late, negative = early
  timingGrade: 'perfect' | 'good' | 'early' | 'late' | 'wrong';
  timestamp: number;
}

export interface SessionStats {
  totalTargetNotes: number;
  playedNotes: number;
  correctNotes: number;
  wrongNotes: number;
  currentStreak: number;
  maxStreak: number;
  timingStats: {
    perfect: number;
    good: number;
    early: number;
    late: number;
  };
  mistakeFrequency: Record<string, { count: number; noteName: string; clef: ClefType; mistakenFor: string[] }>;
  startTime: number;
  endTime?: number;
}

export const PITCH_CLASS_TO_DIATONIC: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

export const SOLFEGE_MAP: Record<string, { en: string; zh: string; num: string }> = {
  C: { en: 'Do', zh: '哆', num: '1' },
  'C#': { en: 'Di', zh: '升哆', num: '♯1' },
  Db: { en: 'Ra', zh: '降来', num: '♭2' },
  D: { en: 'Re', zh: '来', num: '2' },
  'D#': { en: 'Ri', zh: '升来', num: '♯2' },
  Eb: { en: 'Me', zh: '降咪', num: '♭3' },
  E: { en: 'Mi', zh: '咪', num: '3' },
  F: { en: 'Fa', zh: '发', num: '4' },
  'F#': { en: 'Fi', zh: '升发', num: '♯4' },
  Gb: { en: 'Se', zh: '降嗦', num: '♭5' },
  G: { en: 'Sol', zh: '嗦', num: '5' },
  'G#': { en: 'Si', zh: '升嗦', num: '♯5' },
  Ab: { en: 'Le', zh: '降啦', num: '♭6' },
  A: { en: 'La', zh: '啦', num: '6' },
  'A#': { en: 'Li', zh: '升啦', num: '♯6' },
  Bb: { en: 'Te', zh: '降西', num: '♭7' },
  B: { en: 'Ti', zh: '西', num: '7' },
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteInfo(midi: number): NoteInfo {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const rawName = NOTE_NAMES[noteIndex];
  const isSharp = rawName.includes('#');
  const pitchClass = isSharp ? rawName[0] : rawName;
  
  const diatonicBase = PITCH_CLASS_TO_DIATONIC[pitchClass];
  const diatonicStep = octave * 7 + diatonicBase;
  const clef: ClefType = midi >= 60 ? 'treble' : 'bass';
  const solfegeObj = SOLFEGE_MAP[rawName] || { en: pitchClass, zh: pitchClass, num: pitchClass };

  return {
    midi,
    name: `${rawName}${octave}`,
    pitchClass,
    accidental: isSharp ? 'sharp' : undefined,
    octave,
    solfege: solfegeObj.en,
    solfegeZh: solfegeObj.zh,
    clef,
    diatonicStep,
  };
}

export function isBlackKey(midi: number): boolean {
  const noteIndex = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
}

export function getDurationText(duration: number): { label: string; symbol: string; holdBeats: number } {
  if (duration === 4) return { label: '全音符 · 按住4拍', symbol: '𝅝', holdBeats: 4 };
  if (duration === 3) return { label: '附点二分音符 · 按住3拍', symbol: '𝅗𝅥.', holdBeats: 3 };
  if (duration === 2) return { label: '二分音符 · 按住2拍', symbol: '𝅗𝅥', holdBeats: 2 };
  if (duration === 1.5) return { label: '附点四分音符 · 按住1.5拍', symbol: '♩.', holdBeats: 1.5 };
  if (duration === 1) return { label: '四分音符 · 1拍', symbol: '♩', holdBeats: 1 };
  if (duration === 0.5) return { label: '八分音符 · 半拍(快起)', symbol: '♪', holdBeats: 0.5 };
  return { label: `${duration} 拍`, symbol: '♩', holdBeats: duration };
}
