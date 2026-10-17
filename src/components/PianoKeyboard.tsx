import React, { useMemo } from 'react';
import { getDurationText, isBlackKey, midiToNoteInfo } from '../types/music';

interface PianoKeyboardProps {
  activeMidiNotes: Set<number>;
  targetMidi: number | null;
  targetMidiNotes?: number[]; // For chord practice: multiple illuminated keys
  targetDuration?: number; // duration in quarter notes (e.g. 1, 2, 0.5, 4)
  beatProgress?: number; // 0.0 to 1.0 rhythm countdown
  wrongMidi: number | null;
  onKeyPlay: (midi: number) => void;
  onKeyRelease: (midi: number) => void;
  showLabels: 'pitch' | 'solfege' | 'shortcuts' | 'none';
  startOctave: number; // e.g. 2 for C2
  onChangeStartOctave?: (octave: number) => void;
  octaveCount?: number; // default 4 octaves
  chordInfo?: {
    symbol: string;
    name: string;
    notesDescription?: string;
  } | null;
}

const KEYBOARD_SHORTCUTS: Record<string, number> = {
  // Octave 3 (Z-M row)
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

  // Octave 4 (Q-U row)
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

  // Octave 5 (I-[ row)
  i: 72, // C5
  '9': 73, // C#5
  o: 74, // D5
  '0': 75, // D#5
  p: 76, // E5
  '[': 77, // F5
};

const MIDI_TO_KEYBOARD_KEY: Record<number, string> = Object.entries(KEYBOARD_SHORTCUTS).reduce(
  (acc, [key, midi]) => {
    acc[midi] = key.toUpperCase();
    return acc;
  },
  {} as Record<number, string>
);

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeMidiNotes,
  targetMidi,
  targetMidiNotes,
  targetDuration = 1,
  beatProgress = 0,
  wrongMidi,
  onKeyPlay,
  onKeyRelease,
  showLabels,
  startOctave,
  onChangeStartOctave,
  octaveCount = 4,
  chordInfo,
}) => {
  const minMidi = startOctave * 12 + 12; // e.g. 2 * 12 + 12 = 36 (C2)
  const maxMidi = minMidi + octaveCount * 12; // e.g. 36 + 48 = 84 (C6)

  const { whiteKeys, blackKeys } = useMemo(() => {
    const whites: { midi: number; whiteIndex: number }[] = [];
    const blacks: { midi: number; whiteIndexBefore: number }[] = [];

    let currentWhiteIndex = 0;
    for (let midi = minMidi; midi <= maxMidi; midi++) {
      if (isBlackKey(midi)) {
        blacks.push({
          midi,
          whiteIndexBefore: currentWhiteIndex - 1,
        });
      } else {
        whites.push({
          midi,
          whiteIndex: currentWhiteIndex,
        });
        currentWhiteIndex++;
      }
    }
    return { whiteKeys: whites, blackKeys: blacks };
  }, [minMidi, maxMidi]);

  const totalWhites = whiteKeys.length;
  const whiteKeyWidthPercent = 100 / totalWhites;
  const blackKeyWidthPercent = whiteKeyWidthPercent * 0.65;
  const durationInfo = getDurationText(targetDuration);

  // Countdown scale for target key ring (starts at scale 1.8, closes to 1.0 on beat)
  const ringScale = Math.max(1.0, 1.8 - beatProgress * 0.8);

  // For chord mode: count how many target notes are pressed
  const chordPressedCount = targetMidiNotes
    ? targetMidiNotes.filter((m) => activeMidiNotes.has(m)).length
    : 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 md:p-4 shadow-xl select-none flex flex-col justify-between">
      {/* Sleek Header with Octave Shift & Rhythm Guide */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {onChangeStartOctave && (
              <button
                type="button"
                onClick={() => onChangeStartOctave(Math.max(1, startOctave - 1))}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                title="向低音区移动一个八度"
              >
                ◀ 降八度
              </button>
            )}
            <span className="font-semibold text-slate-200">
              C{startOctave} ~ C{startOctave + octaveCount}
            </span>
            {onChangeStartOctave && (
              <button
                type="button"
                onClick={() => onChangeStartOctave(Math.min(3, startOctave + 1))}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                title="向高音区移动一个八度"
              >
                升八度 ▶
              </button>
            )}
          </div>

          <span aria-hidden="true" className="text-slate-700">·</span>

          {chordInfo ? (
            <div className="flex items-center gap-2 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {chordInfo.symbol} ({chordInfo.name})
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {chordInfo.notesDescription}
              </span>
              {targetMidiNotes && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  chordPressedCount === targetMidiNotes.length
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-emerald-400 border border-emerald-600/50'
                }`}>
                  已按下 {chordPressedCount} / {targetMidiNotes.length} 音
                </span>
              )}
            </div>
          ) : (
            <>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                </span>
                <span>节拍倒计光环 (闭合时击键)</span>
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-slate-300 font-mono">
                当前时值: <strong className="text-emerald-300">{durationInfo.label}</strong>
              </span>
            </>
          )}

          {wrongMidi && (
            <>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-rose-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                红色为误按位置
              </span>
            </>
          )}
        </div>

        <div className="text-slate-400 text-[11px] hidden sm:block">
          电脑键盘 Q-U / 鼠标触控 / 电钢琴 MIDI 实时弹奏
        </div>
      </div>

      {/* Piano Keys Stage */}
      <div className="relative w-full h-44 md:h-52 lg:h-60 bg-slate-950 rounded-xl p-1 overflow-x-auto overflow-y-hidden shadow-inner border border-slate-950">
        <div className="relative w-full h-full min-w-[700px]">
          {/* 1. White Keys */}
          {whiteKeys.map(({ midi, whiteIndex }) => {
            const isPressed = activeMidiNotes.has(midi);
            const isChordTarget = targetMidiNotes ? targetMidiNotes.includes(midi) : false;
            const isTarget = targetMidi === midi || isChordTarget;
            const chordToneIndex = targetMidiNotes ? targetMidiNotes.indexOf(midi) : -1;
            const chordRole = chordToneIndex === 0 ? '根音' : chordToneIndex === 1 ? '三音' : chordToneIndex === 2 ? '五音' : chordToneIndex === 3 ? '七音' : '';
            const isWrong = wrongMidi === midi;
            const isMiddleC = midi === 60;
            const noteInfo = midiToNoteInfo(midi);
            const shortcutKey = MIDI_TO_KEYBOARD_KEY[midi];

            let bgClass = 'bg-linear-to-b from-white via-slate-50 to-slate-200 text-slate-700';
            if (isWrong) {
              bgClass = 'bg-linear-to-b from-rose-400 to-rose-600 text-white shadow-rose-500/50';
            } else if (isTarget && isPressed) {
              bgClass = 'bg-linear-to-b from-emerald-300 via-emerald-400 to-emerald-500 text-emerald-950 ring-2 ring-emerald-500 shadow-emerald-500/40';
            } else if (isTarget) {
              bgClass = 'bg-linear-to-b from-emerald-100 via-emerald-200 to-emerald-400 text-emerald-950 ring-2 ring-emerald-500 ring-inset';
            } else if (isPressed) {
              bgClass = 'bg-linear-to-b from-sky-200 to-sky-400 text-sky-950';
            }

            return (
              <button
                key={`white-${midi}`}
                type="button"
                onMouseDown={() => onKeyPlay(midi)}
                onMouseUp={() => onKeyRelease(midi)}
                onMouseLeave={() => isPressed && onKeyRelease(midi)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onKeyPlay(midi);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onKeyRelease(midi);
                }}
                style={{
                  left: `${whiteIndex * whiteKeyWidthPercent}%`,
                  width: `${whiteKeyWidthPercent}%`,
                }}
                className={`absolute top-0 bottom-0 border-r border-slate-300 rounded-b-lg transition-all duration-75 flex flex-col justify-end items-center pb-2 cursor-pointer shadow-sm active:translate-y-0.5 ${bgClass}`}
              >
                {/* Middle C Marker Indicator */}
                {isMiddleC && (
                  <div className="absolute top-2 w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" title="中央 C (C4)" />
                )}

                {/* Target Chord Tone Indicator Badge */}
                {isChordTarget && (
                  <div className="absolute bottom-11 flex flex-col items-center pointer-events-none">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ${
                      isPressed
                        ? 'bg-emerald-900 text-emerald-100 ring-1 ring-emerald-300'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isPressed ? `✓ ${chordRole}` : chordRole}
                    </span>
                  </div>
                )}

                {/* Target Synchronized Rhythm Countdown Ring (Single target mode) */}
                {!isChordTarget && isTarget && (
                  <div className="absolute bottom-12 flex flex-col items-center pointer-events-none">
                    <div
                      className="w-7 h-7 rounded-full border-2 border-emerald-600 bg-emerald-500/30 transition-transform duration-75 flex items-center justify-center shadow-xs"
                      style={{
                        transform: `scale(${ringScale})`,
                        opacity: 0.5 + beatProgress * 0.5,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-700" />
                    </div>

                    <span className="text-[9px] font-bold text-emerald-900 bg-emerald-300/80 px-1 rounded-xs mt-1 shadow-xs">
                      {durationInfo.label}
                    </span>
                  </div>
                )}

                {/* Key Label */}
                <div className="flex flex-col items-center leading-tight pointer-events-none">
                  {showLabels === 'pitch' && (
                    <span className={`text-[11px] font-mono font-bold ${isTarget ? 'text-emerald-950' : 'text-slate-700'}`}>
                      {noteInfo.name}
                    </span>
                  )}
                  {showLabels === 'solfege' && (
                    <span className="text-[11px] font-medium text-slate-700">
                      {noteInfo.solfegeZh}
                    </span>
                  )}
                  {showLabels === 'shortcuts' && shortcutKey && (
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-200/90 px-1 rounded-xs">
                      {shortcutKey}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* 2. Black Keys */}
          {blackKeys.map(({ midi, whiteIndexBefore }) => {
            const isPressed = activeMidiNotes.has(midi);
            const isChordTarget = targetMidiNotes ? targetMidiNotes.includes(midi) : false;
            const isTarget = targetMidi === midi || isChordTarget;
            const chordToneIndex = targetMidiNotes ? targetMidiNotes.indexOf(midi) : -1;
            const chordRole = chordToneIndex === 0 ? '根音' : chordToneIndex === 1 ? '三音' : chordToneIndex === 2 ? '五音' : chordToneIndex === 3 ? '七音' : '';
            const isWrong = wrongMidi === midi;
            const noteInfo = midiToNoteInfo(midi);
            const shortcutKey = MIDI_TO_KEYBOARD_KEY[midi];

            const leftPercent = (whiteIndexBefore + 1) * whiteKeyWidthPercent - blackKeyWidthPercent / 2;

            let bgClass = 'bg-linear-to-b from-slate-800 via-slate-900 to-black text-slate-300 border-slate-950';
            if (isWrong) {
              bgClass = 'bg-linear-to-b from-rose-600 to-rose-900 text-white border-rose-500 shadow-lg shadow-rose-900/60';
            } else if (isTarget && isPressed) {
              bgClass = 'bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-emerald-950 border-emerald-300 ring-2 ring-emerald-300 shadow-emerald-500/50';
            } else if (isTarget) {
              bgClass = 'bg-linear-to-b from-emerald-600 to-emerald-900 text-emerald-100 border-emerald-400 ring-2 ring-emerald-400';
            } else if (isPressed) {
              bgClass = 'bg-linear-to-b from-sky-600 to-sky-900 text-white border-sky-400';
            }

            return (
              <button
                key={`black-${midi}`}
                type="button"
                onMouseDown={() => onKeyPlay(midi)}
                onMouseUp={() => onKeyRelease(midi)}
                onMouseLeave={() => isPressed && onKeyRelease(midi)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onKeyPlay(midi);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onKeyRelease(midi);
                }}
                style={{
                  left: `${leftPercent}%`,
                  width: `${blackKeyWidthPercent}%`,
                }}
                className={`absolute top-0 h-[62%] z-10 border rounded-b-md shadow-md transition-all duration-75 flex flex-col justify-end items-center pb-2 cursor-pointer active:translate-y-0.5 ${bgClass}`}
              >
                {/* Chord Target on Black Key */}
                {isChordTarget && (
                  <div className="absolute bottom-7 flex flex-col items-center pointer-events-none">
                    <span className={`text-[9px] font-bold px-1 rounded-sm shadow-xs ${
                      isPressed ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {isPressed ? `✓ ${chordRole}` : chordRole}
                    </span>
                  </div>
                )}

                {/* Target Synchronized Rhythm Countdown on Black Key (Single target mode) */}
                {!isChordTarget && isTarget && (
                  <div className="absolute bottom-8 flex flex-col items-center pointer-events-none">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-emerald-300 bg-emerald-400/40 transition-transform duration-75 flex items-center justify-center shadow-xs"
                      style={{
                        transform: `scale(${ringScale})`,
                        opacity: 0.5 + beatProgress * 0.5,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center leading-tight pointer-events-none">
                  {showLabels === 'pitch' && (
                    <span className="text-[10px] font-mono font-bold">
                      {noteInfo.name}
                    </span>
                  )}
                  {showLabels === 'solfege' && (
                    <span className="text-[10px] font-medium">
                      {noteInfo.solfegeZh}
                    </span>
                  )}
                  {showLabels === 'shortcuts' && shortcutKey && (
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      {shortcutKey}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
