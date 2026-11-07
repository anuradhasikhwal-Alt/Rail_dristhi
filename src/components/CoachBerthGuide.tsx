import React, { useState } from 'react';
import { Layers, Search, Info, Check, ShieldCheck } from 'lucide-react';

export const CoachBerthGuide: React.FC = () => {
  const [coachType, setCoachType] = useState<'3A' | '2A' | 'SL' | 'CC'>('3A');
  const [selectedSeat, setSelectedSeat] = useState<number>(24);

  // Helper to determine berth type
  const getBerthDetails = (seatNo: number, type: '3A' | '2A' | 'SL' | 'CC') => {
    if (type === 'CC') {
      const isWindow = seatNo % 5 === 1 || seatNo % 5 === 0;
      const isAisle = seatNo % 5 === 2 || seatNo % 5 === 3;
      return {
        type: isWindow ? 'Window Seat' : isAisle ? 'Aisle Seat' : 'Middle Seat',
        cabin: Math.ceil(seatNo / 5),
        color: isWindow ? 'text-emerald-400' : 'text-slate-300',
      };
    }

    if (type === '2A') {
      const rem = seatNo % 6;
      if (rem === 1 || rem === 2) return { type: 'Lower Berth (LB)', cabin: Math.ceil(seatNo / 6), color: 'text-emerald-400' };
      if (rem === 3 || rem === 4) return { type: 'Upper Berth (UB)', cabin: Math.ceil(seatNo / 6), color: 'text-blue-400' };
      if (rem === 5) return { type: 'Side Lower (SL)', cabin: Math.ceil(seatNo / 6), color: 'text-amber-400' };
      return { type: 'Side Upper (SU)', cabin: Math.ceil(seatNo / 6), color: 'text-purple-400' };
    }

    // 3A and SL (8 berths per bay)
    const rem = seatNo % 8;
    if (rem === 1 || rem === 4) return { type: 'Lower Berth (LB)', cabin: Math.ceil(seatNo / 8), color: 'text-emerald-400' };
    if (rem === 2 || rem === 5) return { type: 'Middle Berth (MB)', cabin: Math.ceil(seatNo / 8), color: 'text-indigo-400' };
    if (rem === 3 || rem === 6) return { type: 'Upper Berth (UB)', cabin: Math.ceil(seatNo / 8), color: 'text-blue-400' };
    if (rem === 7) return { type: 'Side Lower (SL)', cabin: Math.ceil(seatNo / 8), color: 'text-amber-400' };
    return { type: 'Side Upper (SU)', cabin: Math.ceil(seatNo / 8), color: 'text-purple-400' };
  };

  const totalSeats = coachType === '3A' ? 64 : coachType === '2A' ? 48 : coachType === 'SL' ? 72 : 75;
  const currentDetails = getBerthDetails(selectedSeat, coachType);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Indian Railways Coach &amp; Berth Layout Guide
            </h2>
            <p className="text-xs text-slate-400">
              Interactive layout diagram: find whether your berth is Lower, Middle, Upper or Window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['3A', '2A', 'SL', 'CC'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setCoachType(type);
                  setSelectedSeat(Math.min(selectedSeat, type === '2A' ? 48 : 64));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  coachType === type
                    ? 'bg-orange-500 text-slate-950 border-orange-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {type === '3A' ? 'AC 3 Tier (3A)' : type === '2A' ? 'AC 2 Tier (2A)' : type === 'SL' ? 'Sleeper (SL)' : 'Chair Car (CC)'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Seat Inspector Banner */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-mono font-black text-xl text-orange-400">
              #{selectedSeat}
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">
                Berth Classification in {coachType}
              </span>
              <span className={`text-base font-bold ${currentDetails.color}`}>
                {currentDetails.type} • Bay #{currentDetails.cabin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Jump to Seat:</span>
            <input
              type="number"
              min={1}
              max={totalSeats}
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(Math.max(1, Math.min(totalSeats, parseInt(e.target.value) || 1)))}
              className="w-16 py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Interactive Berth Grid */}
        <div className="mt-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Click any berth below to inspect:
          </span>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-80 overflow-y-auto">
            {Array.from({ length: totalSeats }, (_, i) => i + 1).map((num) => {
              const isSelected = num === selectedSeat;
              const details = getBerthDetails(num, coachType);

              return (
                <button
                  key={num}
                  onClick={() => setSelectedSeat(num)}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center border font-mono transition ${
                    isSelected
                      ? 'bg-orange-500 text-slate-950 font-black border-white shadow-lg ring-2 ring-orange-400/50 scale-105 z-10'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{num}</span>
                  <span className="text-[9px] opacity-75 leading-tight">
                    {details.type.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
