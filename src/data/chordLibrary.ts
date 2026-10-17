import { ClefType, SheetNote } from '../types/music';

export type ChordCategory = 'triad-major' | 'triad-minor' | 'seventh' | 'progression';

export interface ChordItem {
  id: string;
  name: string; // e.g. "C 大三和弦"
  symbol: string; // e.g. "C"
  category: ChordCategory;
  categoryName: string; // e.g. "基础大三和弦"
  formula: string; // e.g. "1 - 3 - 5 (大三度 + 小三度)"
  root: string; // "C"
  notesDescription: string; // "C4 · E4 · G4"
  midis: number[]; // e.g. [60, 64, 67]
  clef: ClefType;
  fingerHints?: string; // e.g. "右手 1-3-5 指 / 左手 5-3-1 指"
  description: string;
  inversions?: { name: string; midis: number[] }[];
  brokenDuration?: number; // duration for each note in arpeggio mode
}

export const CHORD_CATEGORIES: { id: ChordCategory | 'all'; name: string }[] = [
  { id: 'all', name: '全部和弦' },
  { id: 'triad-major', name: '基础大三和弦' },
  { id: 'triad-minor', name: '常用小三和弦' },
  { id: 'seventh', name: '核心七和弦' },
  { id: 'progression', name: '流行经典和弦进行' },
];

export const CHORD_LIBRARY: ChordItem[] = [
  // ================= 基础大三和弦 (Major Triads) =================
  {
    id: 'chord-c-major',
    name: 'C 大三和弦',
    symbol: 'C',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '1 - 3 - 5 (大三度 + 小三度)',
    root: 'C',
    notesDescription: 'C4 · E4 · G4 (哆 · 咪 · 嗦)',
    midis: [60, 64, 67],
    clef: 'treble',
    fingerHints: '右手: 1指 (大拇指) - 3指 (中指) - 5指 (小指)',
    description: '最经典的自然大调主和弦，纯净明亮，是几乎所有钢琴初学者的第一个和弦。',
    inversions: [
      { name: '原位', midis: [60, 64, 67] },
      { name: '第一转位 (六和弦)', midis: [64, 67, 72] },
      { name: '第二转位 (四六和弦)', midis: [67, 72, 76] },
    ],
  },
  {
    id: 'chord-g-major',
    name: 'G 大三和弦',
    symbol: 'G',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '5 - 7 - 2 (大三度 + 小三度)',
    root: 'G',
    notesDescription: 'G3 · B3 · D4 或 G4 · B4 · D5',
    midis: [55, 59, 62],
    clef: 'treble',
    fingerHints: '右手: 1-3-5 指 | 属和弦，极具倾向与回家的张力',
    description: 'C大调的属和弦 (V级)，声响雄壮且富有向前推进的解决动力。',
    inversions: [
      { name: '原位', midis: [55, 59, 62] },
      { name: '高八度原位', midis: [67, 71, 74] },
    ],
  },
  {
    id: 'chord-f-major',
    name: 'F 大三和弦',
    symbol: 'F',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '4 - 6 - 1 (大三度 + 小三度)',
    root: 'F',
    notesDescription: 'F3 · A3 · C4 或 F4 · A4 · C5',
    midis: [53, 57, 60],
    clef: 'treble',
    fingerHints: '右手: 1-3-5 指 | 下属和弦，温暖辽阔',
    description: 'C大调的下属和弦 (IV级)，音色温暖宽广，抒情慢歌的灵魂支柱。',
    inversions: [
      { name: '原位', midis: [53, 57, 60] },
      { name: '高八度原位', midis: [65, 69, 72] },
    ],
  },
  {
    id: 'chord-d-major',
    name: 'D 大三和弦',
    symbol: 'D',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '2 - #4 - 6 (含黑键 F#4)',
    root: 'D',
    notesDescription: 'D4 · F#4 · A4',
    midis: [62, 66, 69],
    clef: 'treble',
    fingerHints: '右手: 1指白键 - 2/3指黑键 F# - 5指白键 A',
    description: '中间音为黑键 F#4，训练手指在黑白键交替时的弹奏手型与触键感。',
  },
  {
    id: 'chord-a-major',
    name: 'A 大三和弦',
    symbol: 'A',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '6 - #1 - 3 (含黑键 C#4)',
    root: 'A',
    notesDescription: 'A3 · C#4 · E4',
    midis: [57, 61, 64],
    clef: 'treble',
    fingerHints: '右手: 1指 A3 - 2指黑键 C#4 - 4/5指 E4',
    description: '三音为黑键 C#4，声调清亮辉煌，常用于A大调与流行转调中。',
  },
  {
    id: 'chord-e-major',
    name: 'E 大三和弦',
    symbol: 'E',
    category: 'triad-major',
    categoryName: '基础大三和弦',
    formula: '3 - #5 - 7 (含黑键 G#3)',
    root: 'E',
    notesDescription: 'E3 · G#3 · B3 或 E4 · G#4 · B4',
    midis: [52, 56, 59],
    clef: 'treble',
    fingerHints: '右手: 1指白键 - 3指黑键 G# - 5指白键 B',
    description: '明快热烈的吉他常用和弦，在钢琴上三音踩在黑键 G# 上。',
  },

  // ================= 常用小三和弦 (Minor Triads) =================
  {
    id: 'chord-am-minor',
    name: 'Am 小三和弦',
    symbol: 'Am',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '6 - 1 - 3 (小三度 + 大三度)',
    root: 'A',
    notesDescription: 'A3 · C4 · E4 (啦 · 哆 · 咪)',
    midis: [57, 60, 64],
    clef: 'treble',
    fingerHints: '右手: 1-3-5 指 (全白键)',
    description: 'C大调的关系小调主和弦 (vi级)，略带忧郁柔情，流行歌悲伤副歌标配。',
  },
  {
    id: 'chord-dm-minor',
    name: 'Dm 小三和弦',
    symbol: 'Dm',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '2 - 4 - 6 (小三度 + 大三度)',
    root: 'D',
    notesDescription: 'D4 · F4 · A4 (来 · 发 · 啦)',
    midis: [62, 65, 69],
    clef: 'treble',
    fingerHints: '右手: 1-3-5 指 (全白键)',
    description: 'C大调的 ii 级和弦，在流行与爵士中是通向属和弦 (G) 最顺畅的桥梁。',
  },
  {
    id: 'chord-em-minor',
    name: 'Em 小三和弦',
    symbol: 'Em',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '3 - 5 - 7 (小三度 + 大三度)',
    root: 'E',
    notesDescription: 'E3 · G3 · B3 或 E4 · G4 · B4',
    midis: [52, 55, 59],
    clef: 'treble',
    fingerHints: '右手: 1-3-5 指 (全白键)',
    description: 'C大调的 iii 级和弦，低沉内敛，常用于抒情段落的起承转合。',
  },
  {
    id: 'chord-cm-minor',
    name: 'Cm 小三和弦',
    symbol: 'Cm',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '1 - b3 - 5 (含黑键降咪 Eb4)',
    root: 'C',
    notesDescription: 'C4 · Eb4 · G4',
    midis: [60, 63, 67],
    clef: 'treble',
    fingerHints: '右手: 1指白键 C4 - 3指黑键 Eb4 - 5指白键 G4',
    description: '深邃沉郁的C小调主和弦，三音降小三度，对比 C 大调感受明暗变幻。',
  },
  {
    id: 'chord-gm-minor',
    name: 'Gm 小三和弦',
    symbol: 'Gm',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '5 - b7 - 2 (含黑键降西 Bb3)',
    root: 'G',
    notesDescription: 'G3 · Bb3 · D4',
    midis: [55, 58, 62],
    clef: 'treble',
    fingerHints: '右手: 1指 G - 2/3指黑键 Bb - 5指 D',
    description: '三音为黑键降B (Bb)，古典交响乐与流行慢板中极富戏剧张力。',
  },
  {
    id: 'chord-fm-minor',
    name: 'Fm 小三和弦',
    symbol: 'Fm',
    category: 'triad-minor',
    categoryName: '常用小三和弦',
    formula: '4 - b6 - 1 (含黑键降啦 Ab3)',
    root: 'F',
    notesDescription: 'F3 · Ab3 · C4',
    midis: [53, 56, 60],
    clef: 'treble',
    fingerHints: '右手: 1指 F - 3指黑键 Ab - 5指 C',
    description: '在流行编曲中常借用作为 IVm 特殊色彩和弦 (如从 F 走向 Fm 再解决到 C)。',
  },

  // ================= 核心七和弦 (Seventh Chords) =================
  {
    id: 'chord-g7-dominant',
    name: 'G7 大小七和弦 (属七)',
    symbol: 'G7',
    category: 'seventh',
    categoryName: '核心七和弦',
    formula: '5 - 7 - 2 - 4 (属和弦 + 小七度)',
    root: 'G',
    notesDescription: 'G3 · B3 · D4 · F4',
    midis: [55, 59, 62, 65],
    clef: 'treble',
    fingerHints: '右手: 1指 G - 2指 B - 3指 D - 5指 F',
    description: '钢琴最常用的四音和弦！强烈的解决意愿直奔 C 和弦，必学典范。',
  },
  {
    id: 'chord-cmaj7-major7',
    name: 'Cmaj7 大大七和弦',
    symbol: 'Cmaj7',
    category: 'seventh',
    categoryName: '核心七和弦',
    formula: '1 - 3 - 5 - 7 (大三和弦 + 大七度 B4)',
    root: 'C',
    notesDescription: 'C4 · E4 · G4 · B4',
    midis: [60, 64, 67, 71],
    clef: 'treble',
    fingerHints: '右手: 1指 C - 2指 E - 3指 G - 5指 B',
    description: '充满都市感、朦胧爵士风情与浪漫氛围的七和弦，听感梦幻优雅。',
  },
  {
    id: 'chord-fmaj7-major7',
    name: 'Fmaj7 大大七和弦',
    symbol: 'Fmaj7',
    category: 'seventh',
    categoryName: '核心七和弦',
    formula: '4 - 6 - 1 - 3 (大三和弦 + 大七度 E4)',
    root: 'F',
    notesDescription: 'F3 · A3 · C4 · E4',
    midis: [53, 57, 60, 64],
    clef: 'treble',
    fingerHints: '右手: 1-2-3-5 指 (全白键)',
    description: 'City Pop 与现代流行弹唱中最受喜爱的色彩和弦，极其空灵轻盈。',
  },
  {
    id: 'chord-dm7-minor7',
    name: 'Dm7 小七和弦',
    symbol: 'Dm7',
    category: 'seventh',
    categoryName: '核心七和弦',
    formula: '2 - 4 - 6 - 1 (小三和弦 + 小七度 C5)',
    root: 'D',
    notesDescription: 'D4 · F4 · A4 · C5',
    midis: [62, 65, 69, 72],
    clef: 'treble',
    fingerHints: '右手: 1-2-3-5 指',
    description: '爵士经典 2-5-1 和弦走向的起点，音色柔顺丝滑。',
  },
  {
    id: 'chord-am7-minor7',
    name: 'Am7 小七和弦',
    symbol: 'Am7',
    category: 'seventh',
    categoryName: '核心七和弦',
    formula: '6 - 1 - 3 - 5 (小三和弦 + 小七度 G4)',
    root: 'A',
    notesDescription: 'A3 · C4 · E4 · G4',
    midis: [57, 60, 64, 67],
    clef: 'treble',
    fingerHints: '右手: 1-2-3-5 指',
    description: '现代流行弹唱神和弦，比普通 Am 更加丰富、柔和与治愈。',
  },

  // ================= 流行经典和弦进行 (Popular Chord Progressions) =================
  {
    id: 'progression-1645',
    name: '流行万能套路 · 1-6-4-5 进行',
    symbol: 'C - Am - F - G',
    category: 'progression',
    categoryName: '流行经典和弦进行',
    formula: 'I - vi - IV - V (神级循环)',
    root: 'C',
    notesDescription: '依次弹奏: C 和弦 -> Am 和弦 -> F 和弦 -> G 和弦',
    midis: [60, 64, 67], // Starts with C, advances across progression
    clef: 'treble',
    description: '华语与欧美流行金曲（如《红豆》《Stand by Me》）的根基套路，必练基本功！',
  },
  {
    id: 'progression-canon',
    name: '经典卡农和弦进行 (Canon)',
    symbol: 'C - G - Am - Em - F - C - F - G',
    category: 'progression',
    categoryName: '流行经典和弦进行',
    formula: '1-5-6-3-4-1-4-5 黄金下行',
    root: 'C',
    notesDescription: '依次弹奏: C -> G -> Am -> Em -> F -> C -> F -> G',
    midis: [60, 64, 67],
    clef: 'treble',
    description: '人类音乐史上流传度最广的和声线条，无数经典情歌的共同骨架。',
  },
  {
    id: 'progression-4536',
    name: '王道抒情进行 · 4-5-3-6 进行',
    symbol: 'F - G - Em - Am',
    category: 'progression',
    categoryName: '流行经典和弦进行',
    formula: 'IV - V - iii - vi (日漫与古风神曲标配)',
    root: 'F',
    notesDescription: '依次弹奏: F 和弦 -> G 和弦 -> Em 和弦 -> Am 和弦',
    midis: [53, 57, 60],
    clef: 'treble',
    description: '自带催泪情绪的王道抒情和弦套路，旋律感极强。',
  },
  {
    id: 'progression-251',
    name: '爵士流行必练 · 2-5-1 进行',
    symbol: 'Dm7 - G7 - Cmaj7',
    category: 'progression',
    categoryName: '流行经典和弦进行',
    formula: 'ii7 - V7 - Imaj7 (经典爵士解决)',
    root: 'D',
    notesDescription: '依次弹奏: Dm7 -> G7 -> Cmaj7',
    midis: [62, 65, 69, 72],
    clef: 'treble',
    description: '爵士、R&B 及高级流行乐中最具辨识度和声动线，由紧张奔向彻底释放。',
  },
];

/**
 * Converts a chord into a series of SheetNotes for broken arpeggio practice
 */
export function chordToBrokenNotes(chord: ChordItem, repeatTimes: number = 2): SheetNote[] {
  const notes: SheetNote[] = [];
  let noteIndex = 0;

  for (let r = 0; r < repeatTimes; r++) {
    chord.midis.forEach((midi, idx) => {
      noteIndex++;
      notes.push({
        id: `${chord.id}-note-${r}-${idx}`,
        midi,
        name: `${chord.symbol}音${idx + 1}`,
        octave: Math.floor(midi / 12) - 1,
        clef: chord.clef,
        duration: 1, // 1 beat
        measure: Math.floor((noteIndex - 1) / 4) + 1,
        beat: ((noteIndex - 1) % 4) + 1,
        hand: 'right',
        finger: idx === 0 ? 1 : idx === 1 ? (chord.midis.length >= 4 ? 2 : 3) : idx === 2 ? (chord.midis.length >= 4 ? 3 : 5) : 5,
        lyricOrHint: idx === 0 ? `${chord.symbol} 根音` : `${chord.symbol} 组成音`,
      });
    });
  }

  return notes;
}
