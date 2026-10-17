import React from 'react';
import { SessionStats } from '../types/music';

interface PracticeAnalyticsModalProps {
  stats: SessionStats;
  sessionTitle: string;
  onClose: () => void;
  onRetry: () => void;
  onSwitchCurriculum?: (curriculumId: string) => void;
}

export const PracticeAnalyticsModal: React.FC<PracticeAnalyticsModalProps> = ({
  stats,
  sessionTitle,
  onClose,
  onRetry,
  onSwitchCurriculum,
}) => {
  const accuracy = stats.playedNotes > 0
    ? Math.round((stats.correctNotes / stats.playedNotes) * 100)
    : 0;

  const mistakesArray = Object.values(stats.mistakeFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Generate personalized pedagogical advice based on real session metrics
  const getPersonalizedAdvice = () => {
    const adviceList: string[] = [];

    // Accuracy assessment
    if (accuracy >= 95) {
      adviceList.push('🌟 音准辨识与琴键对应非常优秀！读谱几乎达到无意识条件反射。建议尝试「节拍流转模式」并提升 10~15 BPM，挑战更高演奏速度。');
    } else if (accuracy >= 80) {
      adviceList.push('👍 整体识谱准确度良好，多数常见音级已熟练掌握。目前偶有指法错位，建议在按键前先看准谱号（高音还是低音）再落指。');
    } else {
      adviceList.push('💡 建议多在「等待纠错模式」下练习，放慢速度。当看到谱面音符时，先默念音名（如 Sol / G4），再在下方键盘寻找对应琴键，巩固物理键位记忆。');
    }

    // Mistake cluster check (Treble vs Bass vs Ledger lines)
    const bassMistakes = mistakesArray.filter((m) => m.clef === 'bass').reduce((acc, m) => acc + m.count, 0);
    const trebleMistakes = mistakesArray.filter((m) => m.clef === 'treble').reduce((acc, m) => acc + m.count, 0);

    if (bassMistakes > trebleMistakes && bassMistakes >= 2) {
      adviceList.push('🎯 数据分析显示你当前主要失分集中在「低音谱表」。很多初学者习惯用高音谱表的眼光套用低音谱，建议开启「低音谱表 · 基础五音群」专项练习 5 分钟。');
    } else if (trebleMistakes > bassMistakes && trebleMistakes >= 3) {
      adviceList.push('🎯 高音谱表第三线以上（B4/C5/D5）有少数混淆。可利用“三线是B、四间是E”口诀进行快速定位。');
    }

    // Timing assessment
    const { early, late, perfect } = stats.timingStats;
    const totalTiming = early + late + perfect;
    if (totalTiming > 0) {
      if (early / totalTiming > 0.3) {
        adviceList.push('⏱ 节奏分析显示有较明显的“抢拍（Early）”倾向。在曲目跟弹时注意听节拍器的下击重音，等拍点落地后再起键与落键。');
      } else if (late / totalTiming > 0.35) {
        adviceList.push('⏱ 反应时值稍有滞后（Late），通常是因为读谱耗时导致手指来不及就位。建议熟读下小节音符，保持视线提前一个音。');
      }
    }

    return adviceList;
  };

  const adviceList = getPersonalizedAdvice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>演奏分析与练习诊断报告</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              曲目/项目: <span className="text-slate-200 font-medium">{sessionTitle}</span> · 实时 MIDI 数据深度分析
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Top 4 KPI Grid (Clean typography, no cards-within-cards clutter) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">音准准确率</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
              {accuracy}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              命中 {stats.correctNotes} / {stats.playedNotes} 音
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400">最高连击</span>
            <div className="text-3xl font-extrabold text-sky-400 font-mono tabular-nums mt-1">
              {stats.maxStreak}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">连对音符无中断</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400">完美拍 (Perfect)</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums mt-1">
              {stats.timingStats.perfect}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">误差 ≤ ±50ms</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400">错音扣分项</span>
            <div className="text-3xl font-extrabold text-rose-400 font-mono tabular-nums mt-1">
              {stats.wrongNotes}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">失误弹错按键</span>
          </div>
        </div>

        {/* Section 1: Most Mistaken Notes Analysis (易错音符热区) */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-slate-200">
            易错音符辨识分析 (Top Mistaken Notes)
          </h3>
          {mistakesArray.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {mistakesArray.map((m) => (
                <div
                  key={m.noteName}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono font-bold flex items-center justify-center text-sm">
                      {m.noteName}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-200">
                        {m.clef === 'treble' ? '高音谱表' : '低音谱表'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        曾误弹为: {m.mistakenFor.slice(0, 2).join(', ') || '临近琴键'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400 font-mono tabular-nums">
                      失误 {m.count} 次
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center text-xs text-emerald-400 font-medium">
              ✨ 零失误！本次练习中没有出现任何错音按键，手位与五线谱识别极其精准。
            </div>
          )}
        </div>

        {/* Section 2: Personalized Pedagogical Coaching (教练专属建议) */}
        <div className="p-4 bg-linear-to-br from-slate-950 to-slate-900 border border-emerald-900/40 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>专属练琴诊断与提升策略</span>
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-300 leading-relaxed">
            {adviceList.map((advice, idx) => (
              <p key={idx} className="flex items-start gap-1.5">
                <span>{advice}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            关闭报告
          </button>
          <div className="flex items-center gap-3">
            {onSwitchCurriculum && (
              <button
                onClick={() => {
                  onSwitchCurriculum('bass-c-position');
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                强化低音专项
              </button>
            )}
            <button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>再次弹奏此曲</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
