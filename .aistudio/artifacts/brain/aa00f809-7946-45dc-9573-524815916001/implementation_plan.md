# 琴韵练琴伴侣 (Piano Maestro) - MIDI 实时读谱分析与纠错系统

面向接驳电钢琴的练习者，打造集 Web MIDI 实时捕获、交互式高低音五线谱、双核心训练模式（五线谱速记识别 + 经典曲目跟弹）、智能位置纠正与多维演奏评分于一体的高保真练习平台。

### User Review & Critical Decisions

> [!IMPORTANT]
> 结合你在需求交互中的选择，以下核心架构与交互逻辑已确认并融入本方案：

- **核心练习双模式**：提供「五线谱速记识别」（针对单音、双音、和弦视奏的专项闪卡练习）与「曲目实战跟弹」（涵盖初学到进阶精选练习曲与经典名曲）无缝切换。
- **双轨纠错机制**：
  - *等待引导模式（Wait-For-Note）*：弹错或未弹时暂停乐谱前进，键盘与谱面上即时高亮正确琴键位置与唱名/音名，弹对后自动推进一步；
  - *节拍流转模式（Tempo Flow）*：伴随内置节拍器按原速持续行进，实时捕捉每个音符的音高偏差与时值提前/滞后（Early/Late），提供节奏热区与完曲评分。
- **音频引擎与辅助**：内置低延迟 Web Audio API 物理泛音钢琴合成器与可调节拍器（支持 40~208 BPM、多种拍号），支持一键开启或静音（方便电钢琴自带音源发声）。
- **无门槛硬件适配**：优先调用浏览器原生 Web MIDI API 自动识别已连接的键盘设备；如未接 MIDI 亦支持屏幕键盘点击与电脑键盘按键辅助测试。

---

### 1. Overview & Core Concept

- **What It Does**: 自动监听与解析连接至电脑的电钢琴 MIDI 信号（Note On/Off、Pitch、Velocity），并在直观的交互式大谱表（Grand Staff，高音谱号 + 低音谱号）与 88/61 键钢琴键盘上实时可视化。针对乐谱音符与实际弹奏音进行对比，秒级纠错、指引键位并生成个性化演奏分析与练习建议。
- **Target Audience / Persona**: 拥有电钢琴/MIDI 键盘、希望脱离死记硬背、提升五线谱视奏速度、改善节奏准确性与指法位置记忆的业余爱好者与琴童。
- **Key Value**: 告别单机死板的练习。每一次按键都有立竿见影的视觉/听觉反馈；错音即时得到键位指引纠正；练后即获量化评分（音准率、节奏稳定性、易错音符统计）与有针对性的提升策略。

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **连接与设备就绪**：用户打开页面，应用自动请求 Web MIDI 权限并检测插入的电钢琴（如 Yamaha, Roland, Casio 等）。顶部清晰显示当前设备连接状态与当前音区；
2. **模式与曲库选择**：
   - *视奏速记识别模式*：选择音域范围（中央C周边、高音谱号初阶、低音谱号、带升降号挑战），系统出题，弹奏电钢琴即时核对；
   - *曲目实战跟弹模式*：从内置曲目库（如《小星星变奏》、《拜厄练习曲》、《欢乐颂》、《月光奏鸣曲片断》、《卡农》）挑选乐曲，设置速度与练习模式（等待纠错 vs 节拍流转）；
3. **实时演奏与纠错交互**：
   - 乐谱视窗：五线谱平滑滚动或分页展示音符，目标音高带有指示游标；
   - 键盘视窗：电钢琴按下琴键时，屏幕键盘对应按键同步下沉并呈现动效；
   - 错音反馈：弹错时，屏幕键盘将错按的琴键以柔和珊瑚红（Coral Red）标出，并将正确的琴键以翠绿/天蓝脉冲光环引导；
4. **练习结算与个性化诊断**：一轮演奏结束即时呈现成绩单，展示：准度得分（Accuracy）、节奏评价（Timing Breakdown: Perfect / Early / Late）、易错音符热点分布（如 F4 与 G4 混淆率），并附带专属教练建议。

#### Visual Identity & Theme
- **Aesthetic Direction**: 典雅专业的现代琴房工作台风格（Modern Studio Clean），兼顾乐谱的黑白纯粹与科技辅助的轻快色彩。
- **Color Palette & Mood (60-30-10 比例)**:
  - *60% 主画布背景*：深邃宁静的高级深灰黑底色（`#090D16` 到 `#0F172A`），降低长时间盯谱的眼部疲劳；
  - *30% 乐谱与结构板面*：柔和象牙白乐谱羊皮纸卡片（`#F8FAFC` 与 `#0F172A` 边框结合），高反差清晰五线谱线与音符符头；
  - *10% 语义与动作高光*：
    - 正确命中 / 目标提示：青碧翡翠绿（`#10B981`）与明澈天青蓝（`#0EA5E9`）；
    - 错音与偏差点：柔和珊瑚红（`#F43F5E`）；
    - 节奏提早 / 延迟标示：琥珀暖黄（`#F59E0B`）。
- **Typography & Hierarchy**:
  - 标题与品牌：`Plus Jakarta Sans` 与 `Outfit`；
  - 乐谱唱名与音名：`IBM Plex Mono` 等宽数字与清晰八度标记（如 `C4`, `G3`, `F#5`）；
  - 避免任何代码式 `//` 伪技术前缀或无意义药丸标签堆叠，遵照 Zero-Pill 与人类自然语言原则。

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: 原生 Web MIDI API + 模拟降级方案**
  - *Chosen Approach*: 采用 W3C 原生 `navigator.requestMIDIAccess()` 协议，监听全部 MIDI 输入设备的 Note On (0x90) 与 Note Off (0x80) 事件。同时内置完备的屏幕鼠标点击与电脑键盘键位映射（如 A~K 对应白键、W/E/T/Y/U 对应黑键）。
  - *Why*: 保证电钢琴零中间驱动即插即用，同时即便在无物理键盘连接时也能完整体验练习与演示流程。
- **Decision 2: 矢量化 SVG 自研高保真大谱表 (Interactive Grand Staff)**
  - *Chosen Approach*: 采用定制响应式 SVG 渲染五线谱（高音谱表 G clef、低音谱表 F clef、谱表括号与小节线、加线 Ledger Lines、符头、符干与升降记号），而不是依赖体积臃肿且定制困难的外部笨重解析库。
  - *Why*: 渲染性能极高（达到 60fps+ 动画帧率），位置判定与动态高亮、游标吸附逻辑完全受控且零延迟。
- **Decision 3: 双轨纠错逻辑（等待模式 vs 流转模式）**
  - *Chosen Approach*: 初学阶段，用户最需要建立“谱面音符 - 琴键物理位置”的肌肉记忆，等待模式能防止受挫；进阶阶段，流转模式培养节奏律动感。两种模式均实时捕获毫秒级击键误差。

---

### 4. Technical Architecture & Data Strategy

#### System & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            PIANO MAESTRO SYSTEM                              │
└───────┬──────────────────────────────────────────────────────────────┬───────┘
        │                                                              │
   [Input Layer]                                                 [Audio Engine]
┌───────┴────────────────────────┐                             ┌───────┴───────────────┐
│ • Web MIDI API (Hardware Piano)│                             │ • Web Audio Synth     │
│ • Virtual On-Screen Keys Click │                             │ • Metronome Generator │
│ • Computer Keyboard Fallback   │                             │ • Volume / Mute Mode  │
└───────┬────────────────────────┘                             └───────▲───────────────┘
        │                                                              │
        ▼                                                              │
┌──────────────────────────────────────────────────────────────────────┴───────┐
│                           CENTRAL PRACTICE ENGINE                            │
│  - Active Mode: Sight-Reading Speed Training / Song Practice                 │
│  - Playback Mode: Wait-for-Note (Correction) vs Flow (Tempo Scoring)         │
│  - Matcher: Real-time Pitch & Octave Compare (MIDI # vs Target Note)         │
│  - Latency & Timing Window: Perfect (±50ms), Good (±120ms), Miss / Wrong Note│
└───────┬───────────────────────────────┬──────────────────────────────┬───────┘
        │                               │                              │
        ▼                               ▼                              ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
│  Interactive Staff    │   │  Virtual 88/61 Piano  │   │ Analytics & Summary  │
│  - Treble & Bass Clefs│   │  - Real-time Pressed  │   │  - Accuracy Score    │
│  - Ledger Lines Math  │   │  - Correct Key Glow   │   │  - Timing Heatmap    │
│  - Note Cursor & State│   │  - Error Key Warning  │   │  - Mistake Diagnosis │
└───────────────────────┘   └───────────────────────┘   └──────────────────────┘
```

#### Core Data Entities & Types
- `MidiNoteEvent`: `{ midi: number, noteName: string, octave: number, velocity: number, timestamp: number, type: 'on' | 'off' }`
- `ExerciseNote`: `{ id: string, midi: number, name: string, octave: number, duration: number, clef: 'treble' | 'bass', isAccidental?: boolean, measure: number }`
- `PracticeSessionRecord`: `{ totalNotes: number, hits: number, misses: number, timingStats: { perfect: number, early: number, late: number }, mistakeNotes: Record<string, number>, streak: number }`

#### Interactive Component Mapping
- **MidiDeviceBar**: 显示当前连接的 MIDI 端口名称、状态指示与手动重新扫描按钮；
- **StaffViewport**: 动态展示高低音双谱表、音符符头状态（待弹灰色、正中青绿、错误标红、指引动画）；
- **PianoRollKeyboard**: 88/61 键高质感钢琴键盘，支持缩放与八度快速定位，实时响应电钢琴的物理按下深度与释放；
- **ControlDeck**: 练习模式切换（视奏闯关 / 曲目演奏）、练习辅助（节拍器、速度 BPM、等待/流转开关、声音开关）；
- **FeedbackModal & DiagnosticCard**: 演奏后的多维雷达与弱项音符分析面板，提供针对性的下一次练习指引。
