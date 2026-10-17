import React from 'react';
import { FeedbackMode } from '../types/music';

interface PracticeControlDeckProps {
  feedbackMode: FeedbackMode;
  onChangeFeedbackMode: (mode: FeedbackMode) => void;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showNoteHints: boolean;
  onToggleNoteHints: () => void;
  keyboardLabels: 'pitch' | 'solfege' | 'shortcuts' | 'none';
  onChangeKeyboardLabels: (labels: 'pitch' | 'solfege' | 'shortcuts' | 'none') => void;
  accuracy: number;
  streak: number;
  currentProgress?: { current: number; total: number };
  onRestart: () => void;
}

export const PracticeControlDeck: React.FC<PracticeControlDeckProps> = ({
  feedbackMode,
  onChangeFeedbackMode,
  isMetronomePlaying,
  onToggleMetronome,
  bpm,
  onChangeBpm,
  isMuted,
  onToggleMute,
  showNoteHints,
  onToggleNoteHints,
  keyboardLabels,
  onChangeKeyboardLabels,
  accuracy,
  streak,
  currentProgress,
  onRestart,
}) => {
  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md backdrop-blur-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Feedback Mode Segmented Control (Functional buttons) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">纠错机制:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-950/70 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeFeedbackMode('wait')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                feedbackMode === 'wait'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              等待纠错 (初学推荐)
            </button>
            <button
              type="button"
              onClick={() => onChangeFeedbackMode('flow')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                feedbackMode === 'flow'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              节拍流转打分 (进阶实战)
            </button>
          </div>
        </div>

        {/* Middle: Metronome & Tempo Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMetronome}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              isMetronomePlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>节拍器: {isMetronomePlaying ? '运行中' : '已暂停'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeBpm(Math.max(40, bpm - 4))}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-slate-200 tabular-nums px-2">
              {bpm} BPM
            </span>
            <button
              type="button"
              onClick={() => onChangeBpm(Math.min(220, bpm + 4))}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Audio Synth Toggle, Display Options & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              isMuted
                ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-sky-950/60 text-sky-300 border-sky-700/60'
            }`}
            title="如果电钢琴已有音响发声，可将网页端静音"
          >
            {isMuted ? (
              <>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>网页静音</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>合成音效开</span>
              </>
            )}
          </button>

          {/* Note Hints Toggle */}
          <button
            type="button"
            onClick={onToggleNoteHints}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              showNoteHints
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            {showNoteHints ? '谱面提示: 开启' : '谱面提示: 关闭'}
          </button>

          {/* Keyboard Key Labels Selector */}
          <select
            value={keyboardLabels}
            onChange={(e) => onChangeKeyboardLabels(e.target.value as any)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="pitch">琴键标签: 音名 (C4, D4)</option>
            <option value="solfege">琴键标签: 唱名 (哆, 来)</option>
            <option value="shortcuts">琴键标签: 键盘键位 (Q-U)</option>
            <option value="none">琴键标签: 无</option>
          </select>

          {/* Restart / Reset Session Button */}
          <button
            type="button"
            onClick={onRestart}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重置练习</span>
          </button>
        </div>
      </div>

      {/* Live Clean Metrics Strip (Zero-Pill with typographic separators) */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>准确率: <strong className="text-white font-mono tabular-nums">{accuracy}%</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>连对连击: <strong className="text-emerald-400 font-mono tabular-nums">{streak} 连击</strong></span>
          {currentProgress && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>进度: <strong className="text-slate-200 font-mono tabular-nums">{currentProgress.current} / {currentProgress.total}</strong> 音</span>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          {feedbackMode === 'wait' ? '等待模式：错音将暂停并高亮指引正确琴键' : '流转模式：按既定BPM行进并记录节奏早晚误差'}
        </div>
      </div>
    </div>
  );
};
