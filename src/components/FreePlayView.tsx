import React, { useState, useMemo } from 'react';
import { midiToNoteInfo, SheetNote } from '../types/music';
import { StaffNotation } from './StaffNotation';
import { PianoKeyboard } from './PianoKeyboard';
import { audioEngine } from '../services/audioEngine';
import { midiService } from '../services/midiService';

interface FreePlayViewProps {
  activeMidiNotes: Set<number>;
  lastMidiEvent: { midi: number; velocity: number; timestamp: number } | null;
  onVirtualPlay: (midi: number) => void;
  onVirtualRelease: (midi: number) => void;
}

// Chord identification algorithm based on pitch classes
function identifyChord(notes: number[]): string | null {
  if (notes.length < 2) return null;

  const pitchClasses = Array.from(new Set(notes.map((n) => n % 12))).sort((a, b) => a - b);
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let root = 0; root < 12; root++) {
    const rootName = NOTE_NAMES[root];
    const intervals = pitchClasses.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
    const pattern = intervals.join(',');

    // Major Triad: root, major 3rd (4), perfect 5th (7)
    if (pattern === '0,4,7') return `${rootName} 大三和弦 (${rootName} Major Triad)`;
    // Minor Triad: root, minor 3rd (3), perfect 5th (7)
    if (pattern === '0,3,7') return `${rootName}m 小三和弦 (${rootName} Minor Triad)`;
    // Dominant 7th: 0, 4, 7, 10
    if (pattern === '0,4,7,10') return `${rootName}7 属七和弦 (${rootName} Dominant 7th)`;
    // Major 7th: 0, 4, 7, 11
    if (pattern === '0,4,7,11') return `${rootName}maj7 大七和弦 (${rootName} Major 7th)`;
    // Minor 7th: 0, 3, 7, 10
    if (pattern === '0,3,7,10') return `${rootName}m7 小七和弦 (${rootName} Minor 7th)`;
    // Diminished: 0, 3, 6
    if (pattern === '0,3,6') return `${rootName}dim 减三和弦 (${rootName} Diminished)`;
    // Augmented: 0, 4, 8
    if (pattern === '0,4,8') return `${rootName}aug 增三和弦 (${rootName} Augmented)`;
    // Sus4: 0, 5, 7
    if (pattern === '0,5,7') return `${rootName}sus4 挂四和弦 (${rootName} Sus4)`;
  }

  return `${notes.length} 音复音复合和弦`;
}

// Convert MIDI velocity to musical dynamics term
function getVelocityDynamic(velocity: number): { label: string; term: string; color: string } {
  if (velocity <= 25) return { label: '极弱', term: 'ppp (Pianississimo)', color: 'text-indigo-400' };
  if (velocity <= 45) return { label: '很弱', term: 'pp (Pianissimo)', color: 'text-sky-400' };
  if (velocity <= 65) return { label: '弱', term: 'p (Piano)', color: 'text-emerald-400' };
  if (velocity <= 80) return { label: '中弱', term: 'mp (Mezzo-piano)', color: 'text-teal-400' };
  if (velocity <= 95) return { label: '中强', term: 'mf (Mezzo-forte)', color: 'text-amber-400' };
  if (velocity <= 110) return { label: '强', term: 'f (Forte)', color: 'text-orange-400' };
  if (velocity <= 122) return { label: '很强', term: 'ff (Fortissimo)', color: 'text-rose-400' };
  return { label: '极强', term: 'fff (Fortississimo)', color: 'text-red-500' };
}

export const FreePlayView: React.FC<FreePlayViewProps> = ({
  activeMidiNotes,
  lastMidiEvent,
  onVirtualPlay,
  onVirtualRelease,
}) => {
  const [keyboardLabels, setKeyboardLabels] = useState<'pitch' | 'solfege' | 'shortcuts' | 'none'>('pitch');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [recordedNotes, setRecordedNotes] = useState<SheetNote[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Active notes array
  const activeNotesArray = useMemo(() => Array.from(activeMidiNotes), [activeMidiNotes]);

  // Detected chord
  const detectedChord = useMemo(() => identifyChord(activeNotesArray), [activeNotesArray]);

  // Latest played note info for display on staff
  const currentStaffNote: SheetNote | null = useMemo(() => {
    if (!lastMidiEvent) return null;
    const info = midiToNoteInfo(lastMidiEvent.midi);
    return {
      id: `live-${lastMidiEvent.timestamp}`,
      midi: lastMidiEvent.midi,
      name: info.name,
      octave: info.octave,
      clef: info.clef,
      duration: 1,
      measure: 1,
      beat: 1,
      accidental: info.accidental,
    };
  }, [lastMidiEvent]);

  // Handle note recording
  React.useEffect(() => {
    if (!isRecording || !lastMidiEvent) return;
    const info = midiToNoteInfo(lastMidiEvent.midi);
    const newNote: SheetNote = {
      id: `rec-${Date.now()}`,
      midi: lastMidiEvent.midi,
      name: info.name,
      octave: info.octave,
      clef: info.clef,
      duration: 1,
      measure: Math.floor(recordedNotes.length / 4) + 1,
      beat: (recordedNotes.length % 4) + 1,
      accidental: info.accidental,
    };
    setRecordedNotes((prev) => [...prev, newNote]);
  }, [isRecording, lastMidiEvent]);

  const velocityDynamic = lastMidiEvent
    ? getVelocityDynamic(lastMidiEvent.velocity)
    : { label: '无', term: '静止', color: 'text-slate-500' };

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Real-time MIDI Dynamics & Chord Analysis Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Pitch & Note Information */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">当前弹奏音高与唱名</div>
          <div className="flex items-baseline gap-3 my-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {lastMidiEvent ? midiToNoteInfo(lastMidiEvent.midi).name : '等待弹奏...'}
            </span>
            {lastMidiEvent && (
              <span className="text-sm font-semibold text-slate-300">
                ({midiToNoteInfo(lastMidiEvent.midi).solfegeZh} / {midiToNoteInfo(lastMidiEvent.midi).solfege})
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {lastMidiEvent
              ? `频率: ${Math.round(audioEngine.midiToFrequency(lastMidiEvent.midi))} Hz · MIDI #${lastMidiEvent.midi}`
              : '接驳电钢琴或在屏幕键盘按下任意键'}
          </div>
        </div>

        {/* Card 2: Chord Recognition */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">多指和弦实时识别</div>
          <div className="text-lg font-bold text-sky-400 my-1 truncate">
            {detectedChord || '单音 / 暂未构成和弦'}
          </div>
          <div className="text-[11px] text-slate-500">
            {activeNotesArray.length > 0
              ? `同时按下 ${activeNotesArray.length} 个音: ${activeNotesArray.map((m) => midiToNoteInfo(m).name).join(', ')}`
              : '同时按下 3 个以上音符即可识别和弦性质'}
          </div>
        </div>

        {/* Card 3: Touch Velocity & Dynamics (力度表现力分析) */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>触键力度控制 (Touch Velocity)</span>
            <span className={`font-bold font-mono ${velocityDynamic.color}`}>
              {lastMidiEvent?.velocity || 0} / 127
            </span>
          </div>
          <div className="my-1.5">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-100"
                style={{ width: `${((lastMidiEvent?.velocity || 0) / 127) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>层级: <strong className={velocityDynamic.color}>{velocityDynamic.term}</strong></span>
            <span>{velocityDynamic.label}</span>
          </div>
        </div>
      </div>

      {/* Main Grand Staff Viewport */}
      <StaffNotation
        currentNote={currentStaffNote}
        upcomingNotes={[]}
        lastPlayedMidi={lastMidiEvent?.midi || null}
        lastEvaluation={null}
        showNoteHints={true}
        clefMode="both"
      />

      {/* Auxiliary Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isRecording) {
                setIsRecording(false);
              } else {
                setRecordedNotes([]);
                setIsRecording(true);
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-500'}`} />
            <span>{isRecording ? '录音中 (点击停止)' : '录制弹奏片段'}</span>
          </button>

          {recordedNotes.length > 0 && (
            <span className="text-slate-400">
              已录制 {recordedNotes.length} 个音符
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={keyboardLabels}
            onChange={(e) => setKeyboardLabels(e.target.value as any)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="pitch">琴键标签: 音名 (C4, D4)</option>
            <option value="solfege">琴键标签: 唱名 (哆, 来)</option>
            <option value="shortcuts">琴键标签: 键盘键位 (Q-U)</option>
            <option value="none">琴键标签: 无</option>
          </select>

          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              audioEngine.setMuted(next);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-sky-950/60 text-sky-300 border-sky-700/60'
            }`}
          >
            {isMuted ? '网页静音 (仅用电琴声音)' : '网页声音: 开启'}
          </button>
        </div>
      </div>

      {/* Visual Interactive Piano Keyboard */}
      <PianoKeyboard
        activeMidiNotes={activeMidiNotes}
        targetMidi={null}
        wrongMidi={null}
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
    </div>
  );
};
