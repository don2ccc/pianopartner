import React from 'react';
import { ClefType, getDurationText, midiToNoteInfo, SheetNote } from '../types/music';
import { ChordItem } from '../data/chordLibrary';

interface StaffNotationProps {
  currentNote: SheetNote | null;
  upcomingNotes: SheetNote[];
  lastPlayedMidi: number | null;
  lastEvaluation: {
    isCorrect: boolean;
    timingGrade?: string;
    timeDeltaMs?: number;
  } | null;
  showNoteHints: boolean;
  clefMode: 'both' | 'treble' | 'bass';
  beatProgress?: number; // 0.0 to 1.0 (countdown until next beat hit)
  currentBeat?: number; // 1 to 4
  bpm?: number;
  countInBeatsRemaining?: number | null;
  toleranceMs?: number;
  feedbackMode?: 'wait' | 'flow';
  onOpenHowToPlay?: () => void;
  // Chord practice extras
  currentChord?: ChordItem | null;
  chordPlayStyle?: 'block' | 'broken';
  pressedChordMidis?: Set<number>;
  onChangeChordPlayStyle?: (style: 'block' | 'broken') => void;
}

const TREBLE_BOTTOM_Y = 100; // Line 1 (E4, diatonic 30)
const BASS_BOTTOM_Y = 204; // Line 1 (G2, diatonic 18)
const LINE_SPACING = 12;
const STEP_HEIGHT = LINE_SPACING / 2; // 6px per diatonic step

function getNoteY(diatonicStep: number, clef: ClefType): number {
  if (clef === 'treble') {
    return TREBLE_BOTTOM_Y - (diatonicStep - 30) * STEP_HEIGHT;
  } else {
    return BASS_BOTTOM_Y - (diatonicStep - 18) * STEP_HEIGHT;
  }
}

function getLedgerLines(diatonicStep: number, clef: ClefType): number[] {
  const lines: number[] = [];
  if (clef === 'treble') {
    if (diatonicStep <= 29) {
      for (let s = 28; s >= diatonicStep - (diatonicStep % 2 !== 0 ? 1 : 0); s -= 2) {
        lines.push(TREBLE_BOTTOM_Y - (s - 30) * STEP_HEIGHT);
      }
    }
    if (diatonicStep >= 39) {
      for (let s = 40; s <= diatonicStep + (diatonicStep % 2 !== 0 ? 1 : 0); s -= 2) {
        lines.push(TREBLE_BOTTOM_Y - (s - 30) * STEP_HEIGHT);
      }
    }
  } else {
    if (diatonicStep >= 27) {
      for (let s = 28; s <= diatonicStep + (diatonicStep % 2 !== 0 ? 1 : 0); s -= 2) {
        lines.push(BASS_BOTTOM_Y - (s - 18) * STEP_HEIGHT);
      }
    }
    if (diatonicStep <= 17) {
      for (let s = 16; s >= diatonicStep - (diatonicStep % 2 !== 0 ? 1 : 0); s -= 2) {
        lines.push(BASS_BOTTOM_Y - (s - 18) * STEP_HEIGHT);
      }
    }
  }
  return lines;
}

export const StaffNotation: React.FC<StaffNotationProps> = ({
  currentNote,
  upcomingNotes,
  lastPlayedMidi,
  lastEvaluation,
  showNoteHints,
  clefMode,
  beatProgress = 0,
  currentBeat = 1,
  bpm = 80,
  countInBeatsRemaining = null,
  toleranceMs = 120,
  feedbackMode = 'wait',
  onOpenHowToPlay,
  currentChord,
  chordPlayStyle = 'block',
  pressedChordMidis,
  onChangeChordPlayStyle,
}) => {
  const currentNoteInfo = currentNote ? midiToNoteInfo(currentNote.midi) : null;
  const lastPlayedInfo = lastPlayedMidi ? midiToNoteInfo(lastPlayedMidi) : null;
  const currentDurationInfo = currentNote ? getDurationText(currentNote.duration) : null;

  // Render a note glyph (notehead + stem + ledger lines + accidentals)
  const renderNoteGlyph = (
    note: SheetNote,
    x: number,
    state: 'active' | 'upcoming' | 'correct' | 'wrong',
    index: number
  ) => {
    const info = midiToNoteInfo(note.midi);
    const clef = note.clef || info.clef;
    const y = getNoteY(info.diatonicStep, clef);
    const ledgerYList = getLedgerLines(info.diatonicStep, clef);
    const duration = note.duration || 1;

    const middleStep = clef === 'treble' ? 34 : 22;
    const stemDown = info.diatonicStep >= middleStep;
    const stemLength = 34;

    const isCurrent = state === 'active';
    const isHollow = duration >= 2; // Half and whole notes have open/hollow noteheads
    const hasStem = duration < 4; // Whole notes do not have stems

    let strokeColor = '#0F172A';
    let fillColor = isHollow ? '#FFFDF0' : '#0F172A';
    let haloColor = '';

    if (isCurrent) {
      if (lastEvaluation?.isCorrect) {
        strokeColor = '#059669';
        fillColor = isHollow ? '#ECFDF5' : '#059669';
        haloColor = 'rgba(16, 185, 129, 0.28)';
      } else if (lastEvaluation?.isCorrect === false) {
        strokeColor = '#E11D48';
        fillColor = isHollow ? '#FFF1F2' : '#E11D48';
        haloColor = 'rgba(225, 29, 72, 0.28)';
      } else {
        strokeColor = '#0284C7';
        fillColor = isHollow ? '#F0F9FF' : '#0284C7';
        haloColor = 'rgba(2, 132, 199, 0.22)';
      }
    } else {
      strokeColor = '#64748B';
      fillColor = isHollow ? '#FFFDF0' : '#64748B';
    }

    // Shrinking rhythm countdown ring: radius starts large (e.g. 32px) and shrinks to 11px on the beat
    const countdownRadius = 32 - beatProgress * 19;

    return (
      <g key={note.id || `note-${index}`} className="transition-all duration-100">
        {/* Active Rhythm Countdown Ring (收缩节拍环) */}
        {isCurrent && (
          <>
            {/* Ambient target halo */}
            <circle cx={x} cy={y} r="22" fill={haloColor} />

            {/* Beat Synchronization Countdown Ring: contracts toward notehead */}
            <circle
              cx={x}
              cy={y}
              r={Math.max(10, countdownRadius)}
              fill="none"
              stroke={strokeColor}
              strokeWidth={countdownRadius < 14 ? '3' : '1.8'}
              strokeDasharray={countdownRadius < 14 ? 'none' : '4 2'}
              opacity={0.4 + beatProgress * 0.6}
            />

            {/* Center target landing dot */}
            <circle cx={x} cy={y} r="2.5" fill={strokeColor} opacity="0.6" />
          </>
        )}

        {/* Ledger lines (加线) */}
        {ledgerYList.map((ly, lIdx) => (
          <line
            key={`ledger-${lIdx}`}
            x1={x - 15}
            y1={ly}
            x2={x + 15}
            y2={ly}
            stroke="#334155"
            strokeWidth="2"
          />
        ))}

        {/* Accidental (# or b) */}
        {(note.accidental === 'sharp' || info.accidental === 'sharp') && (
          <text
            x={x - 18}
            y={y + 5}
            fontSize="20"
            fontWeight="bold"
            fill={strokeColor}
            className="select-none font-mono"
          >
            ♯
          </text>
        )}
        {note.accidental === 'flat' && (
          <text
            x={x - 18}
            y={y + 4}
            fontSize="20"
            fontWeight="bold"
            fill={strokeColor}
            className="select-none font-mono"
          >
            ♭
          </text>
        )}

        {/* Notehead (hollow for half/whole, solid for quarter/eighth) */}
        <ellipse
          cx={x}
          cy={y}
          rx="7"
          ry="5"
          transform={`rotate(-28 ${x} ${y})`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isHollow ? '2.4' : '0.5'}
        />

        {/* Note Stem (whole notes have no stem) */}
        {hasStem && (
          <>
            <line
              x1={stemDown ? x - 6 : x + 6}
              y1={y}
              x2={stemDown ? x - 6 : x + 6}
              y2={stemDown ? y + stemLength : y - stemLength}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Eighth note flag tail */}
            {duration === 0.5 && (
              <path
                d={
                  stemDown
                    ? `M ${x - 6} ${y + stemLength} C ${x + 2} ${y + stemLength - 10} ${x + 4} ${y + stemLength - 20} ${x + 8} ${y + stemLength - 22}`
                    : `M ${x + 6} ${y - stemLength} C ${x + 14} ${y - stemLength + 10} ${x + 16} ${y - stemLength + 20} ${x + 20} ${y - stemLength + 22}`
                }
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </>
        )}

        {/* Note Hint Label (Pitch & Solfege) */}
        {showNoteHints && (
          <g transform={`translate(${x}, ${y + (stemDown ? stemLength + 14 : -stemLength - 8)})`}>
            <text
              textAnchor="middle"
              className="text-[12px] font-mono font-bold tracking-tight select-none fill-slate-800"
            >
              {info.name}
            </text>
            <text
              y="12"
              textAnchor="middle"
              className="text-[10px] font-sans font-semibold select-none fill-slate-500"
            >
              {info.solfegeZh}
            </text>
          </g>
        )}

        {/* Active Note Rhythm Duration Badge & Finger Hint */}
        {isCurrent && (
          <g transform={`translate(${x}, ${clef === 'treble' ? 24 : 248})`}>
            {/* Rhythmic duration pill */}
            <rect
              x="-42"
              y="-12"
              width="84"
              height="18"
              rx="9"
              fill="#0F172A"
              opacity="0.85"
            />
            <text
              y="1"
              textAnchor="middle"
              className="text-[10px] font-bold fill-emerald-300 select-none"
            >
              {currentDurationInfo?.symbol} {currentDurationInfo?.label}
            </text>
          </g>
        )}
      </g>
    );
  // Render a stacked chord (柱式和弦) glyph
  const renderBlockChordGlyph = (chord: ChordItem, x: number) => {
    const chordNotes = chord.midis.map((m, idx) => {
      const info = midiToNoteInfo(m);
      const clef = chord.clef || info.clef;
      const y = getNoteY(info.diatonicStep, clef);
      const ledgerYList = getLedgerLines(info.diatonicStep, clef);
      const isPressed = pressedChordMidis?.has(m);
      const role = idx === 0 ? '根音' : idx === 1 ? '三音' : idx === 2 ? '五音' : '七音';
      return { midi: m, info, clef, y, ledgerYList, isPressed, role };
    });

    const ys = chordNotes.map((n) => n.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const allPressed = chord.midis.every((m) => pressedChordMidis?.has(m));

    return (
      <g key={`chord-glyph-${chord.id}`} className="transition-all duration-100">
        {/* Floating Chord Name Pill above staff */}
        <g transform={`translate(${x - 42}, 14)`}>
          <rect
            width="84"
            height="26"
            rx="6"
            fill="#0F172A"
            stroke={allPressed ? '#10B981' : '#0284C7'}
            strokeWidth="1.8"
            className="shadow-sm"
          />
          <text
            x="42"
            y="17"
            textAnchor="middle"
            fill={allPressed ? '#34D399' : '#38BDF8'}
            fontSize="12"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {chord.symbol} {allPressed ? '✓' : ''}
          </text>
        </g>

        {/* Vertical Shared Stem */}
        <line
          x1={x + 6}
          y1={minY - 30}
          x2={x + 6}
          y2={maxY}
          stroke={allPressed ? '#059669' : '#0F172A'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Individual chord tone noteheads */}
        {chordNotes.map(({ midi, info, y, ledgerYList, isPressed, role }) => {
          const strokeColor = isPressed ? '#059669' : '#0284C7';
          const fillColor = isPressed ? '#059669' : '#F0F9FF';

          return (
            <g key={`chord-note-${midi}`}>
              {/* Ledger lines */}
              {ledgerYList.map((ly, lIdx) => (
                <line
                  key={`chord-ledger-${midi}-${lIdx}`}
                  x1={x - 14}
                  y1={ly}
                  x2={x + 14}
                  y2={ly}
                  stroke="#334155"
                  strokeWidth="2"
                />
              ))}

              {/* Accidental */}
              {info.accidental === 'sharp' && (
                <text
                  x={x - 18}
                  y={y + 5}
                  fontSize="19"
                  fontWeight="bold"
                  fill={strokeColor}
                  className="select-none font-mono"
                >
                  ♯
                </text>
              )}
              {info.accidental === 'flat' && (
                <text
                  x={x - 18}
                  y={y + 4}
                  fontSize="19"
                  fontWeight="bold"
                  fill={strokeColor}
                  className="select-none font-mono"
                >
                  ♭
                </text>
              )}

              {/* Hit Halo */}
              {isPressed && (
                <circle cx={x} cy={y} r="14" fill="rgba(16, 185, 129, 0.25)" />
              )}

              {/* Notehead */}
              <ellipse
                cx={x}
                cy={y}
                rx="7"
                ry="5"
                transform={`rotate(-28 ${x} ${y})`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2.2"
              />

              {/* Label on right showing note name, solfege & role */}
              <text
                x={x + 18}
                y={y + 4}
                fontSize="11"
                fontWeight="bold"
                fill={isPressed ? '#059669' : '#0369A1'}
                className="select-none font-mono"
              >
                {info.name} ({role}) {isPressed ? '✓' : ''}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between relative bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 md:p-6 shadow-md select-none overflow-hidden backdrop-blur-xs min-h-[220px]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-amber-100/40 pointer-events-none" />

      {/* Top Rhythm & Metronome Pulse Indicator Strip */}
      <div className="flex items-center justify-between mb-1 text-xs text-slate-600 font-medium z-10">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800">五线谱大谱表</span>
          <span aria-hidden="true" className="text-slate-300">·</span>

          {currentChord ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                {currentChord.symbol}
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {currentChord.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                ({currentChord.notesDescription})
              </span>
              {onChangeChordPlayStyle && (
                <div className="flex items-center gap-1 ml-2 bg-slate-900/10 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onChangeChordPlayStyle('block')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      chordPlayStyle === 'block'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    柱式同时弹
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeChordPlayStyle('broken')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      chordPlayStyle === 'broken'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    分解琶音
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Metronome Beat Lamps (1 2 3 4) */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/10 rounded-lg">
                <span className="text-[10px] text-slate-500 font-mono">拍点:</span>
                {[1, 2, 3, 4].map((beatNum) => {
                  const isActive = currentBeat === beatNum;
                  const isDownbeat = beatNum === 1;
                  return (
                    <div
                      key={beatNum}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono transition-all duration-75 ${
                        isActive
                          ? isDownbeat
                            ? 'bg-emerald-600 text-white scale-110 shadow-xs'
                            : 'bg-amber-500 text-slate-950 scale-105'
                          : 'bg-slate-300/80 text-slate-600'
                      }`}
                    >
                      {beatNum}
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {bpm} BPM
              </span>
            </>
          )}
        </div>

        {/* Real-time Rhythm Timing Offset Runway Gauge (毫秒级早晚偏差可视化判定标尺) */}
        <div className="flex items-center gap-2">
          {lastEvaluation && lastEvaluation.timingGrade !== 'wrong' ? (
            <div className="flex items-center gap-2 bg-slate-900/90 py-1 px-2.5 rounded-xl border border-slate-700/70 shadow-xs">
              {feedbackMode === 'flow' && <span className="text-[10px] text-amber-400 font-mono">抢拍</span>}
              {/* The 400ms Runway Bar (-200ms to +200ms) */}
              <div className="relative w-28 sm:w-36 md:w-44 h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden flex items-center">
                {/* Center Green Target Zone based on toleranceMs */}
                {(() => {
                  const leftPct = Math.max(0, ((200 - toleranceMs) / 400) * 100);
                  const widthPct = Math.min(100, ((toleranceMs * 2) / 400) * 100);
                  return (
                    <div
                      className="absolute h-full bg-emerald-500/25 border-x border-emerald-400/60"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`完美拍区域 (±${toleranceMs}ms)`}
                    />
                  );
                })()}
                {/* Center 0ms line */}
                <div className="absolute left-1/2 w-0.5 h-full bg-slate-600 -translate-x-1/2" />
                {/* Hit Landing Needle */}
                {(() => {
                  const delta = Math.max(-200, Math.min(200, lastEvaluation.timeDeltaMs || 0));
                  const pct = ((delta + 200) / 400) * 100;
                  const isPerfect = Math.abs(delta) <= toleranceMs;
                  const needleColor = isPerfect
                    ? 'bg-emerald-400 ring-2 ring-emerald-300'
                    : delta < -toleranceMs
                    ? 'bg-amber-400 ring-2 ring-amber-300'
                    : 'bg-orange-400 ring-2 ring-orange-300';
                  return (
                    <div
                      className={`absolute w-2 h-4 rounded-xs -translate-x-1/2 transition-all duration-150 shadow-md ${needleColor}`}
                      style={{ left: `${pct}%` }}
                    />
                  );
                })()}
              </div>
              {feedbackMode === 'flow' && <span className="text-[10px] text-orange-400 font-mono">拖拍</span>}

              {/* Timing Text Feedback */}
              {feedbackMode === 'wait' ? (
                <span className="text-emerald-400 font-bold text-[11px] font-mono flex items-center gap-1">
                  <span>★ 音高正确！</span>
                  <span className="text-[10px] text-emerald-300/80 font-sans hidden sm:inline">(等待模式)</span>
                </span>
              ) : (
                <>
                  {lastEvaluation.timingGrade === 'perfect' && (
                    <span className="text-emerald-400 font-bold text-[11px] font-mono flex items-center gap-1">
                      <span>★ PERFECT!</span>
                      <span className="text-[10px] text-emerald-300/80">
                        ({lastEvaluation.timeDeltaMs && lastEvaluation.timeDeltaMs > 0 ? `+${Math.round(lastEvaluation.timeDeltaMs)}` : Math.round(lastEvaluation.timeDeltaMs || 0)}ms)
                      </span>
                    </span>
                  )}
                  {lastEvaluation.timingGrade === 'early' && (
                    <span className="text-amber-300 font-bold text-[11px] font-mono">
                      抢拍 ({Math.round(lastEvaluation.timeDeltaMs || 0)}ms)
                    </span>
                  )}
                  {lastEvaluation.timingGrade === 'late' && (
                    <span className="text-orange-300 font-bold text-[11px] font-mono">
                      拖拍 (+{Math.round(lastEvaluation.timeDeltaMs || 0)}ms)
                    </span>
                  )}
                </>
              )}
            </div>
          ) : lastEvaluation?.timingGrade === 'wrong' ? (
            <div className="flex items-center gap-1.5 py-1 px-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-[11px] font-semibold">
              <span>✕ 错音: 弹成了 {lastPlayedInfo?.name} (目标为 {currentNoteInfo?.name})</span>
            </div>
          ) : null}

          {/* Quick Help Guide Button */}
          {onOpenHowToPlay && (
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
              title="查看节奏光圈含义、节拍判定原理与如何弹准"
            >
              <span>❓ 怎么弹准节拍？</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff Canvas */}
      <div className="w-full flex justify-center items-center overflow-x-auto py-1 relative">
        {/* Count-in Visual Overlay (预备拍倒计时遮罩) */}
        {countInBeatsRemaining !== null && countInBeatsRemaining !== undefined && (
          <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center animate-fadeIn select-none p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>预备拍 COUNT-IN · 建立律动与手位</span>
            </div>

            <div className="text-8xl md:text-9xl font-black font-mono text-emerald-400 my-2 drop-shadow-2xl scale-105 transition-transform duration-100">
              {countInBeatsRemaining}
            </div>

            <div className="text-xs md:text-sm font-semibold text-slate-200 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-700/80 shadow-md">
              {countInBeatsRemaining === 4 && "第 4 拍 · 倾听节拍器节奏，平稳呼吸"}
              {countInBeatsRemaining === 3 && "第 3 拍 · 双手放置在电钢琴起始键位"}
              {countInBeatsRemaining === 2 && `第 2 拍 · 眼睛注视目标起始音 (${currentNoteInfo?.name || 'C4'})`}
              {countInBeatsRemaining === 1 && "第 1 拍 · 预备... 起!"}
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 840 260"
          className="w-full max-w-[920px] h-full min-h-[190px] max-h-[280px] drop-shadow-xs"
        >
          {/* Left Grand Staff Bracket & Vertical Bar Line */}
          <path
            d="M 44,52 C 34,52 30,128 20,133 C 30,138 34,214 44,214"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <line x1="44" y1="52" x2="44" y2="214" stroke="#1E293B" strokeWidth="2.8" />
          <line x1="49" y1="52" x2="49" y2="214" stroke="#64748B" strokeWidth="1.2" />

          {/* ================= TREBLE STAFF ================= */}
          {(clefMode === 'both' || clefMode === 'treble') && (
            <g className="treble-clef-group">
              {[52, 64, 76, 88, 100].map((y, idx) => (
                <line
                  key={`treble-line-${idx}`}
                  x1="49"
                  y1={y}
                  x2="815"
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1.3"
                />
              ))}

              <g transform="translate(56, 44) scale(0.68)">
                <path
                  d="M28,88 C26,88 23,86 23,81 C23,72 32,67 36,60 C40,53 40,43 35,35 C30,28 24,20 24,10 C24,4 27,0 30,0 C32,0 35,3 35,9 C35,21 21,38 21,58 C21,68 28,73 34,73 C42,73 48,67 48,58 C48,46 36,39 26,45 C23,47 21,49 20,49 C19,49 19,47 20,46 C23,39 31,34 39,35 C49,36 56,46 56,58 C56,72 45,82 33,82 C31,82 28,81 28,88 Z"
                  fill="#0F172A"
                />
                <circle cx="28" cy="85" r="3.5" fill="#0F172A" />
              </g>
              <text x="56" y="44" className="text-[10px] font-sans fill-slate-400 font-semibold select-none">
                高音谱表 (G)
              </text>
            </g>
          )}

          {/* Middle C Separation Line Marker */}
          <line
            x1="80"
            y1="133"
            x2="800"
            y2="133"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text
            x="86"
            y="136"
            className="text-[9px] font-mono fill-slate-400 font-medium select-none"
          >
            中央 C (C4)
          </text>

          {/* ================= BASS STAFF ================= */}
          {(clefMode === 'both' || clefMode === 'bass') && (
            <g className="bass-clef-group">
              {[156, 168, 180, 192, 204].map((y, idx) => (
                <line
                  key={`bass-line-${idx}`}
                  x1="49"
                  y1={y}
                  x2="815"
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1.3"
                />
              ))}

              <g transform="translate(56, 153) scale(0.64)">
                <path
                  d="M12,24 C12,14 20,6 30,6 C40,6 48,14 48,24 C48,34 38,46 22,58 L18,54 C30,44 38,34 38,24 C38,18 34,13 28,13 C22,13 18,17 18,22 C18,24 19,25 21,26 C22,27 23,28 23,29 C23,31 21,33 19,33 C15,33 12,29 12,24 Z"
                  fill="#0F172A"
                />
                <circle cx="21" cy="22" r="5" fill="#0F172A" />
                <circle cx="48" cy="18" r="3.2" fill="#0F172A" />
                <circle cx="48" cy="30" r="3.2" fill="#0F172A" />
              </g>
              <text x="56" y="224" className="text-[10px] font-sans fill-slate-400 font-semibold select-none">
                低音谱表 (F)
              </text>
            </g>
          )}

          {/* End Bar Lines */}
          <line x1="810" y1="52" x2="810" y2="204" stroke="#64748B" strokeWidth="1" />
          <line x1="816" y1="52" x2="816" y2="204" stroke="#1E293B" strokeWidth="3" />

          {/* Target Note / Chord at X=240 */}
          {currentChord && chordPlayStyle === 'block' ? (
            renderBlockChordGlyph(currentChord, 240)
          ) : (
            currentNote && renderNoteGlyph(currentNote, 240, 'active', 0)
          )}

          {/* Upcoming Notes stream */}
          {(!currentChord || chordPlayStyle === 'broken') &&
            upcomingNotes.map((note, idx) => {
              const x = 240 + (idx + 1) * 92;
              if (x > 780) return null;
              return renderNoteGlyph(note, x, 'upcoming', idx + 1);
            })}
        </svg>
      </div>

      {/* Chord Guidance Hint (When in block chord mode) */}
      {currentChord && chordPlayStyle === 'block' && (
        <div className="mt-1 py-1.5 px-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">和弦指法与构成:</span>
            <span>
              {currentChord.name} ({currentChord.symbol}) 包含音: <strong className="font-mono text-emerald-700">{currentChord.notesDescription}</strong>
              <span className="text-slate-500 ml-1.5 hidden sm:inline">({currentChord.fingerHints || currentChord.formula})</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-[11px] font-bold text-emerald-800">
              已按下:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
              {currentChord.midis.filter((m) => pressedChordMidis?.has(m)).length} / {currentChord.midis.length} 音
            </span>
          </div>
        </div>
      )}

      {/* Position Correction Hint (only shows when user presses wrong key in single-note mode) */}
      {(!currentChord || chordPlayStyle === 'broken') && lastEvaluation && !lastEvaluation.isCorrect && currentNote && (
        <div className="mt-1 py-1.5 px-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-700">琴键位置纠正:</span>
            <span>
              你按下了 <strong className="font-mono text-rose-600">{lastPlayedInfo?.name}</strong>，
              应该弹奏 <strong className="font-mono text-emerald-700">{currentNoteInfo?.name}</strong>
              （{currentNoteInfo?.solfegeZh}，已在下方键盘高亮绿色指引）
            </span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium shrink-0 ml-2">弹对后乐谱继续推进</span>
        </div>
      )}
    </div>
  );
};
