import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCountIn: () => void;
  toleranceMs: number;
  onChangeToleranceMs: (tolerance: number) => void;
  latencyOffsetMs: number;
  onChangeLatencyOffsetMs: (offset: number) => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onStartCountIn,
  toleranceMs,
  onChangeToleranceMs,
  latencyOffsetMs,
  onChangeLatencyOffsetMs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                ♪
              </span>
              <span>新手练琴指南：彻底掌握节奏与获得 PERFECT 秘诀</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              解答关于圆圈光环、节拍判定、4拍倒计时与硬件延迟的全部疑问
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 4 Core Q&A Cards */}
        <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
          {/* Card 1: What is the flashing circle? */}
          <div className="p-4 bg-slate-950/70 border border-emerald-900/40 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center justify-center text-xs">
                1
              </span>
              <span>键位和五线谱上的绿色圆圈是什么？是表示节奏吗？</span>
            </div>
            <p className="text-slate-300 text-xs">
              <strong className="text-emerald-300 font-semibold">是的，非常准确！那就是「节奏倒计时收缩环 (Rhythm Hit-Ring)」：</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-200">收缩过程：</strong> 当节拍器滴答前进时，圆环从外向内均匀收缩。
              </li>
              <li>
                <strong className="text-emerald-300">击键瞬间：</strong> <span className="text-white font-bold">当圆环正好收缩贴合到琴键中心（同时耳边听到节拍器的「滴」或「答」声）的那一瞬间按下琴键</span>，就是音准与节拍双满分的 PERFECT！
              </li>
              <li>
                如果光圈还没缩拢你就按下，属于<strong>“抢拍 (Early)”</strong>；如果光圈消失或滞后了才按，属于<strong>“拖拍 (Late)”</strong>。
              </li>
            </ul>
          </div>

          {/* Card 2: Why didn't I get Perfect? */}
          <div className="p-4 bg-slate-950/70 border border-amber-900/40 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-600 text-amber-300 flex items-center justify-center text-xs">
                2
              </span>
              <span>为什么觉得弹得没问题，节拍却总拿不到“完美 (PERFECT)”？</span>
            </div>
            <p className="text-slate-300 text-xs">
              琴友常遇到两个原因，我们已为你全面升级优化：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-1">
                <strong className="text-amber-300 text-xs">原因一：认谱期勿用苛刻节拍模式</strong>
                <p className="text-slate-400 text-[11px]">
                  初学认谱时，请使用<strong className="text-emerald-400">【等待纠错模式】</strong>！该模式乐谱耐心地等待你，<strong>只要弹对琴键就是完美</strong>，完全没有时间压力。只有在熟练找键后，再切换到【节拍流转打分】练习卡点！
                </p>
              </div>
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-1">
                <strong className="text-amber-300 text-xs">原因二：物理硬件延迟 & 容差设置</strong>
                <p className="text-slate-400 text-[11px]">
                  电钢琴通过 USB 连接电脑或声卡喇叭播放时，往往存在 10~30ms 的硬件传输延迟。系统现已为你默认开启<strong className="text-emerald-400">「宽松初学容差 (±120ms)」</strong>，并在下方提供延迟补偿，让你只要合着节拍弹就能轻松拿下 PERFECT！
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: 4-Beat Count In */}
          <div className="p-4 bg-slate-950/70 border border-sky-900/40 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-600 text-sky-300 flex items-center justify-center text-xs">
                3
              </span>
              <span>怎么跟上节奏？善用「4 拍预备倒计时 (Count-in)」</span>
            </div>
            <p className="text-[11px] text-slate-300">
              专业乐手演奏前都会数拍子（One, Two, Ready, Go!）。点击顶部绿色 <strong className="text-emerald-400">「4拍预备」</strong> 按钮：
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="font-mono font-bold text-emerald-400 text-sm">第 4 拍</div>
                <div className="text-slate-400 text-[10px] mt-0.5">听清速度律动</div>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="font-mono font-bold text-emerald-400 text-sm">第 3 拍</div>
                <div className="text-slate-400 text-[10px] mt-0.5">手掌就位琴键</div>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="font-mono font-bold text-emerald-400 text-sm">第 2 拍</div>
                <div className="text-slate-400 text-[10px] mt-0.5">目光注视目标音</div>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="font-mono font-bold text-emerald-400 text-sm">第 1 拍</div>
                <div className="text-emerald-300 font-semibold text-[10px] mt-0.5">数完正好下指！</div>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Settings Adjuster inside modal */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">实时调整：节拍完美判定宽松度</span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                当前: ±{toleranceMs}ms
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeToleranceMs(120)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  toleranceMs === 120
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div>宽松初学 (±120ms)</div>
                <div className="text-[10px] font-normal opacity-90">推荐！极易拿完美</div>
              </button>
              <button
                type="button"
                onClick={() => onChangeToleranceMs(80)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  toleranceMs === 80
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div>标准进阶 (±80ms)</div>
                <div className="text-[10px] font-normal opacity-90">经典音乐节拍</div>
              </button>
              <button
                type="button"
                onClick={() => onChangeToleranceMs(45)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  toleranceMs === 45
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div>严苛大师 (±45ms)</div>
                <div className="text-[10px] font-normal opacity-90">专业演奏级测试</div>
              </button>
            </div>

            {/* Hardware Latency Offset Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-300">电钢琴硬件延迟补偿</span>
                <span className="text-[10px] text-slate-500">如果总是被判定为拖拍，可适当增加补偿</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[-30, 0, 30, 60].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => onChangeLatencyOffsetMs(offset)}
                    className={`px-2 py-1 text-[11px] font-mono rounded-md border cursor-pointer ${
                      latencyOffsetMs === offset
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {offset > 0 ? `+${offset}` : offset}ms
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            关闭返回
          </button>
          <button
            type="button"
            onClick={() => {
              onStartCountIn();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>开启 4 拍预备，马上试弹！</span>
          </button>
        </div>
      </div>
    </div>
  );
};
