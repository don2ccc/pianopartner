import { MidiInputDevice } from '../types/music';

type NoteOnCallback = (midi: number, velocity: number, timestamp: number) => void;
type NoteOffCallback = (midi: number) => void;
type DeviceChangeCallback = (devices: MidiInputDevice[]) => void;

class MidiService {
  private midiAccess: MIDIAccess | null = null;
  private selectedDeviceId: string = 'all';
  private noteOnCallbacks: Set<NoteOnCallback> = new Set();
  private noteOffCallbacks: Set<NoteOffCallback> = new Set();
  private deviceChangeCallbacks: Set<DeviceChangeCallback> = new Set();
  private isInitialized: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public async requestAccess(): Promise<{ success: boolean; error?: string; devices: MidiInputDevice[] }> {
    if (!this.isSupported) {
      return {
        success: false,
        error: '当前浏览器不支持 Web MIDI API，推荐使用 Chrome, Edge 或 Opera 浏览器。',
        devices: [],
      };
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.isInitialized = true;

      // Handle hot plugging of MIDI devices (e.g. plugging piano in while app is open)
      this.midiAccess.onstatechange = () => {
        this.bindInputs();
        this.notifyDeviceChanges();
      };

      this.bindInputs();
      const devices = this.getConnectedDevices();
      this.notifyDeviceChanges();

      return {
        success: true,
        devices,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法获取 MIDI 设备访问权限';
      return {
        success: false,
        error: message,
        devices: [],
      };
    }
  }

  private bindInputs(): void {
    if (!this.midiAccess) return;

    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = (event: MIDIMessageEvent) => {
        // If a specific device is selected and this isn't it, skip
        if (this.selectedDeviceId !== 'all' && input.id !== this.selectedDeviceId) {
          return;
        }

        const data = event.data;
        if (!data || data.length < 2) return;

        const status = data[0] & 0xf0;
        const note = data[1];
        const velocity = data.length > 2 ? data[2] : 64;
        const timestamp = event.timeStamp || performance.now();

        // 0x90 = Note On, 0x80 = Note Off
        if (status === 0x90) {
          if (velocity > 0) {
            this.noteOnCallbacks.forEach((cb) => cb(note, velocity, timestamp));
          } else {
            // Note On with 0 velocity is equivalent to Note Off
            this.noteOffCallbacks.forEach((cb) => cb(note));
          }
        } else if (status === 0x80) {
          this.noteOffCallbacks.forEach((cb) => cb(note));
        }
      };
    }
  }

  public getConnectedDevices(): MidiInputDevice[] {
    if (!this.midiAccess) return [];
    const devices: MidiInputDevice[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      devices.push({
        id: input.id,
        name: input.name || `MIDI 键盘 (${input.id})`,
        manufacturer: input.manufacturer || '未知厂商',
        state: input.state || 'connected',
      });
    }
    return devices;
  }

  public selectDevice(deviceId: string): void {
    this.selectedDeviceId = deviceId;
  }

  public getSelectedDevice(): string {
    return this.selectedDeviceId;
  }

  public onNoteOn(cb: NoteOnCallback): () => void {
    this.noteOnCallbacks.add(cb);
    return () => this.noteOnCallbacks.delete(cb);
  }

  public onNoteOff(cb: NoteOffCallback): () => void {
    this.noteOffCallbacks.add(cb);
    return () => this.noteOffCallbacks.delete(cb);
  }

  public onDeviceChange(cb: DeviceChangeCallback): () => void {
    this.deviceChangeCallbacks.add(cb);
    return () => this.deviceChangeCallbacks.delete(cb);
  }

  private notifyDeviceChanges(): void {
    const devices = this.getConnectedDevices();
    this.deviceChangeCallbacks.forEach((cb) => cb(devices));
  }

  /**
   * Simulate a note on event (for on-screen keyboard or virtual tests)
   */
  public triggerVirtualNoteOn(midi: number, velocity: number = 80): void {
    const timestamp = performance.now();
    this.noteOnCallbacks.forEach((cb) => cb(midi, velocity, timestamp));
  }

  /**
   * Simulate a note off event
   */
  public triggerVirtualNoteOff(midi: number): void {
    this.noteOffCallbacks.forEach((cb) => cb(midi));
  }
}

export const midiService = new MidiService();
