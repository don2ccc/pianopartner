import React from 'react';
import { MidiInputDevice, PracticeMode } from '../types/music';

interface TopBarProps {
  currentTab: PracticeMode | 'analytics';
  onSelectTab: (tab: PracticeMode | 'analytics') => void;
  midiDevices: MidiInputDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  onRefreshMidi: () => void;
  isMidiConnected: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  midiDevices,
  selectedDeviceId,
  onSelectDevice,
  onRefreshMidi,
  isMidiConnected,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('sight-reading');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <span>琴韵 Maestro</span>
        </a>
      </div>

      {/* Zone 2: 4 Clean Single-Line Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onSelectTab('sight-reading')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
            currentTab === 'sight-reading'
              ? 'text-emerald-400 border-emerald-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          五线谱速记识别
        </button>
        <button
          onClick={() => onSelectTab('song-play')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
            currentTab === 'song-play'
              ? 'text-emerald-400 border-emerald-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          经典曲目跟弹
        </button>
        <button
          onClick={() => onSelectTab('free-play')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
            currentTab === 'free-play'
              ? 'text-emerald-400 border-emerald-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          自由弹奏与录制
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
            currentTab === 'analytics'
              ? 'text-emerald-400 border-emerald-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          练习诊断报告
        </button>
      </nav>

      {/* Zone 3: Primary Action / MIDI Device Integration */}
      <div className="flex items-center gap-3 shrink-0">
        {midiDevices.length > 0 ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">所有 MIDI 设备 (自动合并)</option>
              {midiDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-xs text-emerald-300 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MIDI 已就绪</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onRefreshMidi}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>检测电钢琴 MIDI</span>
          </button>
        )}
      </div>
    </header>
  );
};
