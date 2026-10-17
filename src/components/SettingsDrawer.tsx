import React from 'react';
import { FeedbackMode, MidiInputDevice, PracticeMode } from '../types/music';
import { SIGHT_READING_LEVELS, SONG_LIBRARY } from '../data/songLibrary';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Mode & Selection
  practiceMode: PracticeMode;
  onChangePracticeMode: (mode: PracticeMode) => void;
  selectedLevelId: string;
  onSelectLevelId: (id: string) => void;
  selectedSongId: string;
  onSelectSongId: (id: string) => void;
  // Correction & Tempo
  feedbackMode: FeedbackMode;
  onChangeFeedbackMode: (mode: FeedbackMode) => void;
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  toleranceMs: number;
  onChangeToleranceMs: (tolerance: number) => void;
  latencyOffsetMs: number;
  onChangeLatencyOffsetMs: (offset: number) => void;
  onOpenHowToPlay: () => void;
  // Audio & Visuals
  isMuted: boolean;
  onToggleMute: () => void;
  enableCountIn: boolean;
  onToggleEnableCountIn: () => void;
  showNoteHints: boolean;
  onToggleNoteHints: () => void;
  keyboardLabels: 'pitch' | 'solfege' | 'shortcuts' | 'none';
  onChangeKeyboardLabels: (labels: 'pitch' | 'solfege' | 'shortcuts' | 'none') => void;
  startOctave: number;
  onChangeStartOctave: (octave: number) => void;
  // MIDI & Reports
  midiDevices: MidiInputDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  onRefreshMidi: () => void;
  onOpenAnalytics: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  practiceMode,
  onChangePracticeMode,
  selectedLevelId,
  onSelectLevelId,
  selectedSongId,
  onSelectSongId,
  feedbackMode,
  onChangeFeedbackMode,
  bpm,
  onChangeBpm,
  isMetronomePlaying,
  onToggleMetronome,
  toleranceMs,
  onChangeToleranceMs,
  latencyOffsetMs,
  onChangeLatencyOffsetMs,
  onOpenHowToPlay,
  isMuted,
  onToggleMute,
  enableCountIn,
  onToggleEnableCountIn,
  showNoteHints,
  onToggleNoteHints,
  keyboardLabels,
  onChangeKeyboardLabels,
  startOctave,
  onChangeStartOctave,
  midiDevices,
  selectedDeviceId,
  onSelectDevice,
  onRefreshMidi,
  onOpenAnalytics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden text-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-base font-bold text-white tracking-tight">练习设置与曲目管理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Quick Help & How-To-Play Guide Trigger */}
          <button
            type="button"
            onClick={() => {
              onOpenHowToPlay();
              onClose();
            }}
            className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-600/50 hover:border-emerald-500 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold shrink-0">
                ♪
              </span>
              <div>
                <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                  <span>新手练琴指南与节拍卡点秘诀</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.2 rounded-md">必看</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  解答圆圈光环、节拍判定、4拍预备与延迟校准疑问
                </div>
              </div>
            </div>
            <svg className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Section 1: Practice Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">练习核心模式</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onChangePracticeMode('sight-reading')}
                className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  practiceMode === 'sight-reading'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                五线谱速记
              </button>
              <button
                type="button"
                onClick={() => onChangePracticeMode('song-play')}
                className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  practiceMode === 'song-play'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                经典曲目跟弹
              </button>
              <button
                type="button"
                onClick={() => onChangePracticeMode('free-play')}
                className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  practiceMode === 'free-play'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                自由弹奏
              </button>
            </div>
          </div>

          {/* Section 2: Repertoire / Curriculum Selection */}
          {practiceMode === 'sight-reading' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">五线谱训练关卡</label>
              <div className="flex flex-col gap-2">
                {SIGHT_READING_LEVELS.map((level) => {
                  const isSelected = level.id === selectedLevelId;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => onSelectLevelId(level.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="text-xs font-bold">{level.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{level.description}</div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
                        {level.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {practiceMode === 'song-play' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">跟弹曲目库</label>
              <div className="flex flex-col gap-2">
                {SONG_LIBRARY.map((song) => {
                  const isSelected = song.id === selectedSongId;
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => onSelectSongId(song.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{song.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{song.composer} · {song.difficulty}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {song.defaultBpm} BPM
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Feedback & Tempo Controls */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">纠错交互机制</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeFeedbackMode('wait')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                    feedbackMode === 'wait'
                      ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">等待纠错模式</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">弹对才走，高亮正确键位</div>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFeedbackMode('flow')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                    feedbackMode === 'flow'
                      ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">节拍流转打分</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">伴随节拍不停顿打分</div>
                </button>
              </div>
            </div>

            {/* Metronome & BPM */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">节拍器速度 (BPM)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{bpm} BPM</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleMetronome}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    isMetronomePlaying
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isMetronomePlaying ? '节拍器: 响声中' : '节拍器: 已静音'}
                </button>
                <input
                  type="range"
                  min="40"
                  max="208"
                  step="4"
                  value={bpm}
                  onChange={(e) => onChangeBpm(Number(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Timing Tolerance Grade */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400">节奏完美判定容差 (Tolerance)</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">±{toleranceMs}ms</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeToleranceMs(120)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-center ${
                    toleranceMs === 120
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div>宽松初学 (±120ms)</div>
                  <div className="text-[10px] font-normal opacity-85">推荐新手</div>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeToleranceMs(80)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-center ${
                    toleranceMs === 80
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div>标准练习 (±80ms)</div>
                  <div className="text-[10px] font-normal opacity-85">平稳卡点</div>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeToleranceMs(45)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-center ${
                    toleranceMs === 45
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div>大师严苛 (±45ms)</div>
                  <div className="text-[10px] font-normal opacity-85">专业演奏级</div>
                </button>
              </div>
            </div>

            {/* Hardware Latency Compensation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400">电钢琴硬件延迟补偿 (Latency Offset)</span>
                <span className="text-xs font-mono text-sky-400 font-semibold">{latencyOffsetMs > 0 ? `+${latencyOffsetMs}` : latencyOffsetMs}ms</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">补偿声卡/USB驱动延迟</span>
                <div className="flex items-center gap-1.5">
                  {[-30, 0, 30, 60].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onChangeLatencyOffsetMs(val)}
                      className={`px-2 py-0.5 text-xs font-mono rounded-md border cursor-pointer ${
                        latencyOffsetMs === val
                          ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Audio & Keyboard Visual Options */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-400">音频与视觉辅助</span>

            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">内置 WebAudio 钢琴合成发声</span>
                <span className="text-[10px] text-slate-500">电钢琴自带音箱发声时可关闭</span>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  !isMuted
                    ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {!isMuted ? '发声中' : '已静音'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">预备拍倒计时 (4拍 Count-in)</span>
                <span className="text-[10px] text-slate-500">练琴开始前敲4下预备拍，建立律动与手位</span>
              </div>
              <button
                type="button"
                onClick={onToggleEnableCountIn}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  enableCountIn
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {enableCountIn ? '已开启 (推荐)' : '已关闭'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">五线谱音符提示 (唱名/音名)</span>
                <span className="text-[10px] text-slate-500">初学者辅助，进阶可关闭盲识</span>
              </div>
              <button
                type="button"
                onClick={onToggleNoteHints}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  showNoteHints
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showNoteHints ? '显示' : '隐藏'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">模拟琴键字符标签</span>
                <span className="text-[10px] text-slate-500">琴键上显示的提示文本</span>
              </div>
              <select
                value={keyboardLabels}
                onChange={(e) => onChangeKeyboardLabels(e.target.value as any)}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="pitch">音名 (C4, D4)</option>
                <option value="solfege">唱名 (哆, 来)</option>
                <option value="shortcuts">键盘键位 (Q-U)</option>
                <option value="none">无标签</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">模拟键盘音域起点</span>
                <span className="text-[10px] text-slate-500">屏幕琴键覆盖的起始八度</span>
              </div>
              <select
                value={startOctave}
                onChange={(e) => onChangeStartOctave(Number(e.target.value))}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value={1}>C1 起 (超低音区)</option>
                <option value={2}>C2 起 (标准中低音, 推荐)</option>
                <option value={3}>C3 起 (中央核心四八度)</option>
              </select>
            </div>
          </div>

          {/* Section 5: MIDI Hardware & Analytics Access */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-400">电钢琴硬件连接</span>
            {midiDevices.length > 0 ? (
              <div className="flex flex-col gap-2">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => onSelectDevice(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">所有 MIDI 输入设备 (自动监听)</option>
                  {midiDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.manufacturer || '已连接'})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-emerald-400">
                  <span>✓ Web MIDI 通讯正常</span>
                  <button onClick={onRefreshMidi} className="text-slate-400 hover:text-slate-200 underline cursor-pointer">
                    重新扫描
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl flex items-center justify-between">
                <span className="text-xs text-amber-300">未检测到 MIDI 设备</span>
                <button
                  onClick={onRefreshMidi}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
                >
                  检测电钢琴
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onOpenAnalytics();
                onClose();
              }}
              className="mt-2 w-full py-2.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>查看历史演奏诊断与薄弱项分析</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            完成并返回练琴
          </button>
        </div>
      </div>
    </div>
  );
};
