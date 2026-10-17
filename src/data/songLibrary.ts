import { SheetNote, SongPiece } from '../types/music';

export interface SightReadingLevel {
  id: string;
  name: string;
  description: string;
  clef: 'treble' | 'bass' | 'both';
  difficulty: '入门' | '进阶' | '提高';
  allowedMidis: number[];
  includeAccidentals: boolean;
  allowedDurations?: number[];
}

export const SIGHT_READING_LEVELS: SightReadingLevel[] = [
  {
    id: 'rhythm-quarter-pulse',
    name: '节奏专项 · 四分音符恒定拍 (1拍)',
    description: '培养内心节拍时钟，每个音符准时 1 拍落键，结合倒计时光环建立肌肉记忆',
    clef: 'treble',
    difficulty: '入门',
    allowedMidis: [60, 62, 64, 65, 67], // C4-G4
    includeAccidentals: false,
    allowedDurations: [1],
  },
  {
    id: 'rhythm-multi-duration',
    name: '节奏专项 · 长短时值保持 (2拍/4拍/半拍)',
    description: '训练音符时值控制：二分音符需按住2拍、全音符按住4拍、八分音符灵动起键',
    clef: 'treble',
    difficulty: '进阶',
    allowedMidis: [60, 62, 64, 65, 67],
    includeAccidentals: false,
    allowedDurations: [2, 1, 0.5, 4],
  },
  {
    id: 'treble-c-position',
    name: '高音谱表 · 中央C五指群',
    description: '识记高音谱表下加一线至第二线 (C4, D4, E4, F4, G4)，建立右手基础手型',
    clef: 'treble',
    difficulty: '入门',
    allowedMidis: [60, 62, 64, 65, 67], // C4, D4, E4, F4, G4
    includeAccidentals: false,
  },
  {
    id: 'bass-c-position',
    name: '低音谱表 · 基础五音群',
    description: '识记低音谱表第二间至第四间 (C3, D3, E3, F3, G3)，建立左手低音敏感度',
    clef: 'bass',
    difficulty: '入门',
    allowedMidis: [48, 50, 52, 53, 55], // C3, D3, E3, F3, G3
    includeAccidentals: false,
  },
  {
    id: 'grand-staff-core',
    name: '大谱表 · 双手跨八度核心音',
    description: '融合高低音谱表，覆盖中央C上下各一个八度 (C3 到 C5 全白键)',
    clef: 'both',
    difficulty: '进阶',
    allowedMidis: [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72], // C3 to C5
    includeAccidentals: false,
  },
  {
    id: 'ledger-lines-master',
    name: '大谱表 · 常用上下加线攻坚',
    description: '专攻容易眼花混淆的加线音符 (高音加线 A5/C6，低音加线 E2/F2/A2)',
    clef: 'both',
    difficulty: '进阶',
    allowedMidis: [40, 41, 43, 45, 48, 60, 72, 74, 76, 77, 79, 81, 84],
    includeAccidentals: false,
  },
  {
    id: 'accidentals-challenge',
    name: '黑键与变化音 · 升降号敏锐度',
    description: '含 ♯F, ♯C, ♭B, ♭E 等常见黑键变音，提高对临时变音记号的即时反应',
    clef: 'both',
    difficulty: '提高',
    allowedMidis: [49, 51, 54, 56, 58, 61, 63, 66, 68, 70, 73, 75], // Black keys across octaves 3-5
    includeAccidentals: true,
  },
];

export const SONG_LIBRARY: SongPiece[] = [
  {
    id: 'twinkle-little-star',
    title: '小星星 (Twinkle, Twinkle, Little Star)',
    subtitle: '经典旋律 · C大调音级跳进与同音反复练习',
    composer: '莫扎特变奏曲主题 / 传统童谣',
    difficulty: '入门',
    defaultBpm: 80,
    timeSignature: [4, 4],
    keySignature: 'C',
    tags: ['初学必练', '右手主旋律', '四分音符稳定拍'],
    description: '适合刚接上电钢琴的新手，重点训练中央C手型、5度跳进与稳定运指。',
    notes: [
      // Measure 1: 1 1 5 5 (C4 C4 G4 G4)
      { id: 't1', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 1, finger: 1, hand: 'right', lyricOrHint: '一' },
      { id: 't2', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 2, finger: 1, hand: 'right', lyricOrHint: '闪' },
      { id: 't3', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 3, finger: 5, hand: 'right', lyricOrHint: '一' },
      { id: 't4', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 4, finger: 5, hand: 'right', lyricOrHint: '闪' },
      // Measure 2: 6 6 5 - (A4 A4 G4 -)
      { id: 't5', midi: 69, name: 'A4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 1, finger: 5, hand: 'right', lyricOrHint: '亮' },
      { id: 't6', midi: 69, name: 'A4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 2, finger: 5, hand: 'right', lyricOrHint: '晶' },
      { id: 't7', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 2, measure: 2, beat: 3, finger: 4, hand: 'right', lyricOrHint: '晶' },
      // Measure 3: 4 4 3 3 (F4 F4 E4 E4)
      { id: 't8', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 1, finger: 4, hand: 'right', lyricOrHint: '满' },
      { id: 't9', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 2, finger: 4, hand: 'right', lyricOrHint: '天' },
      { id: 't10', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 3, finger: 3, hand: 'right', lyricOrHint: '都' },
      { id: 't11', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 4, finger: 3, hand: 'right', lyricOrHint: '是' },
      // Measure 4: 2 2 1 - (D4 D4 C4 -)
      { id: 't12', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 4, beat: 1, finger: 2, hand: 'right', lyricOrHint: '小' },
      { id: 't13', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 4, beat: 2, finger: 2, hand: 'right', lyricOrHint: '星' },
      { id: 't14', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 2, measure: 4, beat: 3, finger: 1, hand: 'right', lyricOrHint: '星' },
      // Measure 5: 5 5 4 4 (G4 G4 F4 F4)
      { id: 't15', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 1, finger: 5, hand: 'right' },
      { id: 't16', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 2, finger: 5, hand: 'right' },
      { id: 't17', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 3, finger: 4, hand: 'right' },
      { id: 't18', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 4, finger: 4, hand: 'right' },
      // Measure 6: 3 3 2 - (E4 E4 D4 -)
      { id: 't19', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 1, finger: 3, hand: 'right' },
      { id: 't20', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 2, finger: 3, hand: 'right' },
      { id: 't21', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 2, measure: 6, beat: 3, finger: 2, hand: 'right' },
      // Measure 7: 1 1 5 5 (C4 C4 G4 G4)
      { id: 't22', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 1, finger: 1, hand: 'right' },
      { id: 't23', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 2, finger: 1, hand: 'right' },
      { id: 't24', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 3, finger: 5, hand: 'right' },
      { id: 't25', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 4, finger: 5, hand: 'right' },
      // Measure 8: 6 6 5 - (A4 A4 G4 -)
      { id: 't26', midi: 69, name: 'A4', octave: 4, clef: 'treble', duration: 1, measure: 8, beat: 1, finger: 5, hand: 'right' },
      { id: 't27', midi: 69, name: 'A4', octave: 4, clef: 'treble', duration: 1, measure: 8, beat: 2, finger: 5, hand: 'right' },
      { id: 't28', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 2, measure: 8, beat: 3, finger: 4, hand: 'right' },
      // Measure 9: 4 4 3 3 (F4 F4 E4 E4)
      { id: 't29', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 9, beat: 1, finger: 4, hand: 'right' },
      { id: 't30', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 9, beat: 2, finger: 4, hand: 'right' },
      { id: 't31', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 9, beat: 3, finger: 3, hand: 'right' },
      { id: 't32', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 9, beat: 4, finger: 3, hand: 'right' },
      // Measure 10: 2 2 1 - (D4 D4 C4 -)
      { id: 't33', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 10, beat: 1, finger: 2, hand: 'right' },
      { id: 't34', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 10, beat: 2, finger: 2, hand: 'right' },
      { id: 't35', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 2, measure: 10, beat: 3, finger: 1, hand: 'right' },
    ],
  },
  {
    id: 'ode-to-joy',
    title: '欢乐颂 (Ode to Joy)',
    subtitle: '贝多芬第九交响曲终曲乐章主题',
    composer: 'L. v. Beethoven (路德维希·凡·贝多芬)',
    difficulty: '入门',
    defaultBpm: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    tags: ['双手协作', '高低音谱表', '经典名作'],
    description: '训练左右手交替读谱与连奏音色掌控。右手游走在三线与四间，左手提供醇厚和弦根音支撑。',
    notes: [
      // Measure 1: 3 3 4 5 | LH: C3 (root)
      { id: 'o1', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 1, beat: 1, finger: 5, hand: 'left', lyricOrHint: '欢' },
      { id: 'o2', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 1, finger: 3, hand: 'right' },
      { id: 'o3', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 2, finger: 3, hand: 'right' },
      { id: 'o4', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 3, finger: 4, hand: 'right' },
      { id: 'o5', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 4, finger: 5, hand: 'right' },
      // Measure 2: 5 4 3 2 | LH: G2
      { id: 'o6', midi: 43, name: 'G2', octave: 2, clef: 'bass', duration: 2, measure: 2, beat: 1, finger: 5, hand: 'left' },
      { id: 'o7', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 1, finger: 5, hand: 'right' },
      { id: 'o8', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 2, finger: 4, hand: 'right' },
      { id: 'o9', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 3, finger: 3, hand: 'right' },
      { id: 'o10', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 4, finger: 2, hand: 'right' },
      // Measure 3: 1 1 2 3 | LH: C3
      { id: 'o11', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 3, beat: 1, finger: 5, hand: 'left' },
      { id: 'o12', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 1, finger: 1, hand: 'right' },
      { id: 'o13', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 2, finger: 1, hand: 'right' },
      { id: 'o14', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 3, finger: 2, hand: 'right' },
      { id: 'o15', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 4, finger: 3, hand: 'right' },
      // Measure 4: 3. 2 2 - | LH: G2
      { id: 'o16', midi: 43, name: 'G2', octave: 2, clef: 'bass', duration: 2, measure: 4, beat: 1, finger: 5, hand: 'left' },
      { id: 'o17', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1.5, measure: 4, beat: 1, finger: 3, hand: 'right' },
      { id: 'o18', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 0.5, measure: 4, beat: 2.5, finger: 2, hand: 'right' },
      { id: 'o19', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 2, measure: 4, beat: 3, finger: 2, hand: 'right' },
      // Measure 5: 3 3 4 5 | LH: C3
      { id: 'o20', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 5, beat: 1, finger: 5, hand: 'left' },
      { id: 'o21', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 1, finger: 3, hand: 'right' },
      { id: 'o22', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 2, finger: 3, hand: 'right' },
      { id: 'o23', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 3, finger: 4, hand: 'right' },
      { id: 'o24', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 4, finger: 5, hand: 'right' },
      // Measure 6: 5 4 3 2 | LH: G2
      { id: 'o25', midi: 43, name: 'G2', octave: 2, clef: 'bass', duration: 2, measure: 6, beat: 1, finger: 5, hand: 'left' },
      { id: 'o26', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 1, finger: 5, hand: 'right' },
      { id: 'o27', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 2, finger: 4, hand: 'right' },
      { id: 'o28', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 3, finger: 3, hand: 'right' },
      { id: 'o29', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 4, finger: 2, hand: 'right' },
      // Measure 7: 1 1 2 3 | LH: C3
      { id: 'o30', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 7, beat: 1, finger: 5, hand: 'left' },
      { id: 'o31', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 1, finger: 1, hand: 'right' },
      { id: 'o32', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 2, finger: 1, hand: 'right' },
      { id: 'o33', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 3, finger: 2, hand: 'right' },
      { id: 'o34', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 7, beat: 4, finger: 3, hand: 'right' },
      // Measure 8: 2. 1 1 - | LH: C3
      { id: 'o35', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 8, beat: 1, finger: 5, hand: 'left' },
      { id: 'o36', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1.5, measure: 8, beat: 1, finger: 2, hand: 'right' },
      { id: 'o37', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 0.5, measure: 8, beat: 2.5, finger: 1, hand: 'right' },
      { id: 'o38', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 2, measure: 8, beat: 3, finger: 1, hand: 'right' },
    ],
  },
  {
    id: 'canon-in-d-simplified',
    title: '卡农 (Pachelbel Canon in C)',
    subtitle: '巴洛克复调之美 · 分解和弦与低音下行线条',
    composer: 'Johann Pachelbel (约翰·帕赫贝尔)',
    difficulty: '进阶',
    defaultBpm: 68,
    timeSignature: [4, 4],
    keySignature: 'C',
    tags: ['和弦进行', '流动旋律', '双手配合'],
    description: '采用最亲切的C大调编配。左手承担经典的下行低音骨架 (C-G-A-E-F-C-F-G)，右手展开优雅的阶梯式下行与琶音。',
    notes: [
      // Measure 1: Bass C3, Treble E4 G4 C5 G4
      { id: 'c1', midi: 48, name: 'C3', octave: 3, clef: 'bass', duration: 2, measure: 1, beat: 1, finger: 5, hand: 'left' },
      { id: 'c2', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 1, finger: 1, hand: 'right' },
      { id: 'c3', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 2, finger: 2, hand: 'right' },
      { id: 'c4', midi: 72, name: 'C5', octave: 5, clef: 'treble', duration: 1, measure: 1, beat: 3, finger: 5, hand: 'right' },
      { id: 'c5', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 4, finger: 2, hand: 'right' },
      // Measure 2: Bass B2, Treble D4 G4 B4 G4
      { id: 'c6', midi: 47, name: 'B2', octave: 2, clef: 'bass', duration: 2, measure: 2, beat: 1, finger: 4, hand: 'left' },
      { id: 'c7', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 1, finger: 1, hand: 'right' },
      { id: 'c8', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 2, finger: 3, hand: 'right' },
      { id: 'c9', midi: 71, name: 'B4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 3, finger: 5, hand: 'right' },
      { id: 'c10', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 4, finger: 3, hand: 'right' },
      // Measure 3: Bass A2, Treble C4 E4 A4 E4
      { id: 'c11', midi: 45, name: 'A2', octave: 2, clef: 'bass', duration: 2, measure: 3, beat: 1, finger: 5, hand: 'left' },
      { id: 'c12', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 1, finger: 1, hand: 'right' },
      { id: 'c13', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 2, finger: 2, hand: 'right' },
      { id: 'c14', midi: 69, name: 'A4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 3, finger: 5, hand: 'right' },
      { id: 'c15', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 4, finger: 2, hand: 'right' },
      // Measure 4: Bass E2, Treble B3 E4 G4 E4
      { id: 'c16', midi: 40, name: 'E2', octave: 2, clef: 'bass', duration: 2, measure: 4, beat: 1, finger: 5, hand: 'left' },
      { id: 'c17', midi: 59, name: 'B3', octave: 3, clef: 'treble', duration: 1, measure: 4, beat: 1, finger: 1, hand: 'right' },
      { id: 'c18', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 4, beat: 2, finger: 2, hand: 'right' },
      { id: 'c19', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 4, beat: 3, finger: 4, hand: 'right' },
      { id: 'c20', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 4, beat: 4, finger: 2, hand: 'right' },
      // Measure 5: Bass F2, Treble A3 C4 F4 C4
      { id: 'c21', midi: 41, name: 'F2', octave: 2, clef: 'bass', duration: 2, measure: 5, beat: 1, finger: 4, hand: 'left' },
      { id: 'c22', midi: 57, name: 'A3', octave: 3, clef: 'treble', duration: 1, measure: 5, beat: 1, finger: 1, hand: 'right' },
      { id: 'c23', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 2, finger: 2, hand: 'right' },
      { id: 'c24', midi: 65, name: 'F4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 3, finger: 4, hand: 'right' },
      { id: 'c25', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 1, measure: 5, beat: 4, finger: 2, hand: 'right' },
      // Measure 6: Bass G2, Treble B3 D4 G4 D4
      { id: 'c26', midi: 43, name: 'G2', octave: 2, clef: 'bass', duration: 2, measure: 6, beat: 1, finger: 3, hand: 'left' },
      { id: 'c27', midi: 59, name: 'B3', octave: 3, clef: 'treble', duration: 1, measure: 6, beat: 1, finger: 1, hand: 'right' },
      { id: 'c28', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 2, finger: 2, hand: 'right' },
      { id: 'c29', midi: 67, name: 'G4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 3, finger: 4, hand: 'right' },
      { id: 'c30', midi: 62, name: 'D4', octave: 4, clef: 'treble', duration: 1, measure: 6, beat: 4, finger: 2, hand: 'right' },
      // Measure 7: Final C3 + C4 C5 Resolving
      { id: 'c31', midi: 36, name: 'C2', octave: 2, clef: 'bass', duration: 4, measure: 7, beat: 1, finger: 5, hand: 'left' },
      { id: 'c32', midi: 60, name: 'C4', octave: 4, clef: 'treble', duration: 2, measure: 7, beat: 1, finger: 1, hand: 'right' },
      { id: 'c33', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 2, measure: 7, beat: 2, finger: 2, hand: 'right' },
      { id: 'c34', midi: 72, name: 'C5', octave: 5, clef: 'treble', duration: 4, measure: 7, beat: 3, finger: 5, hand: 'right' },
    ],
  },
  {
    id: 'moonlight-sonata-intro',
    title: '月光奏鸣曲 · 第一乐章主题',
    subtitle: '贝多芬 Op.27 No.2 柔板沉思',
    composer: 'L. v. Beethoven',
    difficulty: '进阶',
    defaultBpm: 54,
    timeSignature: [4, 4],
    keySignature: 'C#m',
    tags: ['黑键琶音', '指尖触键控制', '三连音律动'],
    description: '训练柔和细腻的三连音触键。包含升记号黑键（G#3, C#4, E4）的精准位移，极富表现力。',
    notes: [
      // Measure 1: Bass C#3 (49), Treble G#3 C#4 E4 triplet repeated
      { id: 'm1', midi: 49, name: 'C#3', octave: 3, clef: 'bass', duration: 4, measure: 1, beat: 1, accidental: 'sharp', finger: 5, hand: 'left' },
      { id: 'm2', midi: 56, name: 'G#3', octave: 3, clef: 'treble', duration: 1, measure: 1, beat: 1, accidental: 'sharp', finger: 1, hand: 'right' },
      { id: 'm3', midi: 61, name: 'C#4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 2, accidental: 'sharp', finger: 2, hand: 'right' },
      { id: 'm4', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 1, beat: 3, finger: 3, hand: 'right' },
      { id: 'm5', midi: 56, name: 'G#3', octave: 3, clef: 'treble', duration: 1, measure: 1, beat: 4, accidental: 'sharp', finger: 1, hand: 'right' },
      // Measure 2: Bass B2 (47), Treble G#3 B3 E4
      { id: 'm6', midi: 47, name: 'B2', octave: 2, clef: 'bass', duration: 4, measure: 2, beat: 1, finger: 5, hand: 'left' },
      { id: 'm7', midi: 56, name: 'G#3', octave: 3, clef: 'treble', duration: 1, measure: 2, beat: 1, accidental: 'sharp', finger: 1, hand: 'right' },
      { id: 'm8', midi: 59, name: 'B3', octave: 3, clef: 'treble', duration: 1, measure: 2, beat: 2, finger: 2, hand: 'right' },
      { id: 'm9', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 2, beat: 3, finger: 3, hand: 'right' },
      { id: 'm10', midi: 56, name: 'G#3', octave: 3, clef: 'treble', duration: 1, measure: 2, beat: 4, accidental: 'sharp', finger: 1, hand: 'right' },
      // Measure 3: Bass A2 (45), Treble A3 C#4 E4
      { id: 'm11', midi: 45, name: 'A2', octave: 2, clef: 'bass', duration: 4, measure: 3, beat: 1, finger: 5, hand: 'left' },
      { id: 'm12', midi: 57, name: 'A3', octave: 3, clef: 'treble', duration: 1, measure: 3, beat: 1, finger: 1, hand: 'right' },
      { id: 'm13', midi: 61, name: 'C#4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 2, accidental: 'sharp', finger: 2, hand: 'right' },
      { id: 'm14', midi: 64, name: 'E4', octave: 4, clef: 'treble', duration: 1, measure: 3, beat: 3, finger: 3, hand: 'right' },
      { id: 'm15', midi: 68, name: 'G#4', octave: 4, clef: 'treble', duration: 2, measure: 3, beat: 4, accidental: 'sharp', finger: 5, hand: 'right' },
    ],
  },
];
