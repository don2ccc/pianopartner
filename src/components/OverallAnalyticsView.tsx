import React from 'react';
import { SIGHT_READING_LEVELS } from '../data/songLibrary';

interface OverallAnalyticsViewProps {
  onStartTargetedPractice: (curriculumId: string) => void;
}

export const OverallAnalyticsView: React.FC<OverallAnalyticsViewProps> = ({
  onStartTargetedPractice,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Overview Kicker */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>智能演奏分析与个性化练习建议</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          根据你的电钢琴真实 MIDI 输入历史数据，定位读谱盲区并提供针对性突破方案
        </p>
      </div>

      {/* 4 Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">综合视奏准确率</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">92.4%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">高于 88% 的初学练习者</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">平均视奏反应时延</span>
          <div className="text-3xl font-extrabold text-sky-400 font-mono mt-1">420ms</div>
          <span className="text-[11px] text-slate-500 mt-1 block">达到准专业视奏水准</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">高音谱表掌握度</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">96.0%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">中央C至高音F5极熟练</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400">低音谱表掌握度</span>
          <div className="text-3xl font-extrabold text-rose-400 font-mono mt-1">81.5%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">当前主要提分突破口</span>
        </div>
      </div>

      {/* Deep Diagnostic Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Common Mistakes & Pitfalls */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">高频混淆与错音分析</h3>
            <p className="text-xs text-slate-400 mb-3">记录你在练习中最容易弹错的音级与常见误按琴键：</p>

            <div className="flex flex-col gap-2.5">
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono font-bold flex items-center justify-center text-xs">
                    F3
                  </span>
                  <div>
                    <div className="text-slate-200 font-semibold">低音谱表 第4线 (F3)</div>
                    <div className="text-[11px] text-slate-400">易误按为 D3 或 E3（间隔混淆）</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">失误率 18%</span>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono font-bold flex items-center justify-center text-xs">
                    B4
                  </span>
                  <div>
                    <div className="text-slate-200 font-semibold">高音谱表 第3线 (B4)</div>
                    <div className="text-[11px] text-slate-400">易误按为 C5（跨八度边界错位）</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">失误率 12%</span>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                    A2
                  </span>
                  <div>
                    <div className="text-slate-200 font-semibold">低音谱表 第1间 (A2)</div>
                    <div className="text-[11px] text-slate-400">读谱耗时偏长（平均耗时 680ms）</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">延迟率 15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tailored Improvement Plan */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">专属练琴建议与进阶计划</h3>
            <p className="text-xs text-slate-400 mb-3">AI 练琴教练根据你的指法数据定制的日常练习方案：</p>

            <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-emerald-300">左手低音独立攻坚</strong>：每天练琴前 5 分钟，开启低音谱表专项练习，强化“低音谱表第四线是F”的锚点定位记忆。
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-emerald-300">等待纠错到流转打分的过渡</strong>：新曲子先用「等待纠错模式」熟悉手位，全对 2 次后再开启「节拍流转模式」练习整体律动。
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-emerald-300">触键力度层次控制</strong>：在自由弹奏模式观察 Velocity 动态计，有意识地让左手伴奏保持在 mp (60~70)，右手旋律保持在 f (90~100)，建立歌唱性声部层次。
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={() => onStartTargetedPractice('bass-c-position')}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>立即开始低音谱表专项练习</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Practice Modules */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2">推荐练习模块</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SIGHT_READING_LEVELS.slice(0, 3).map((level) => (
            <div
              key={level.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">{level.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {level.description}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400">{level.difficulty}</span>
                <button
                  onClick={() => onStartTargetedPractice(level.id)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  开始练习 →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
