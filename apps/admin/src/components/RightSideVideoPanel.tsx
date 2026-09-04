import React from 'react';
import { ShieldCheck, Cpu, Zap } from 'lucide-react';

export const RightSideVideoPanel: React.FC = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 min-h-[540px] shadow-2xl z-10 group">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-105 group-hover:scale-100 transition-transform duration-700 pointer-events-none"
      >
        <source src="/videos/background-video.mp4" type="video/mp4" />
        <source src="/assets/videos/background-video.mp4" type="video/mp4" />
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/30 z-10 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider text-slate-200 uppercase">Zentrio AI Neural Core</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-300">Live Engine v3.0</span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-20 space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
            Autonomous AI Solutions & Real-Time Workspace
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed drop-shadow">
            Architecting next-generation artificial intelligence platforms, neural automation pipelines, and high-performance developer ecosystems.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col items-center text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold text-white">256-Bit SSL</span>
            <span className="text-[8px] text-slate-400">Encrypted Session</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col items-center text-center">
            <Zap className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] font-bold text-white">Real-Time</span>
            <span className="text-[8px] text-slate-400">Live Socket Sync</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col items-center text-center">
            <Cpu className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[10px] font-bold text-white">Firestore</span>
            <span className="text-[8px] text-slate-400">Cloud Persistence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
