import React, { useState } from 'react';
import { MAJOR_STATIONS, getStationLiveBoard } from '../data/trainData';
import { LiveStationTrain } from '../types/train';
import {
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface LiveStationBoardProps {
  onSelectTrainNumber?: (num: string) => void;
}

export const LiveStationBoard: React.FC<LiveStationBoardProps> = ({ onSelectTrainNumber }) => {
  const [selectedStationCode, setSelectedStationCode] = useState<string>('NDLS');
  const [filterType, setFilterType] = useState<'ALL' | 'DEPARTURE' | 'ARRIVAL'>('ALL');

  const stationData = MAJOR_STATIONS[selectedStationCode] || MAJOR_STATIONS.NDLS;
  const trains = getStationLiveBoard(selectedStationCode);

  const filteredTrains = trains.filter(
    (t) => filterType === 'ALL' || t.type === filterType
  );

  return (
    <div className="space-y-6">
      {/* Top Station Selector */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              Live Station Arrival &amp; Departure Electronic Board
            </h2>
            <p className="text-xs text-slate-400">
              Real-time platform assignments and live train movement at major Indian junctions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Junction:</label>
            <select
              value={selectedStationCode}
              onChange={(e) => setSelectedStationCode(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-orange-500"
            >
              {Object.entries(MAJOR_STATIONS).map(([code, st]) => (
                <option key={code} value={code}>
                  {st.name} ({code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-800 mt-4 text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'ALL'
                ? 'bg-orange-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Trains ({trains.length})
          </button>
          <button
            onClick={() => setFilterType('DEPARTURE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterType === 'DEPARTURE'
                ? 'bg-orange-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Departures
          </button>
          <button
            onClick={() => setFilterType('ARRIVAL')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterType === 'ARRIVAL'
                ? 'bg-orange-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Arrivals
          </button>
        </div>
      </div>

      {/* Live Railway Electronic Board Style Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden font-mono">
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold tracking-wider">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>LIVE NTES BOARD • {stationData.name.toUpperCase()} ({selectedStationCode})</span>
          </div>
          <span>TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Train #</th>
                <th className="py-3 px-4">Train Name</th>
                <th className="py-3 px-4">From ➔ To</th>
                <th className="py-3 px-4">Sch. Time</th>
                <th className="py-3 px-4">Exp. Time</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredTrains.map((train) => {
                const isDelayed = train.delayMinutes > 0;

                return (
                  <tr key={train.trainNumber} className="hover:bg-slate-900/60 font-sans">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                      {train.trainNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {train.trainName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {train.origin} ➔ {train.destination}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {train.scheduledTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {train.expectedTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40 text-xs">
                        PF #{train.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDelayed
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isDelayed ? (
                          <>
                            <AlertTriangle className="w-3 h-3" /> Late {train.delayMinutes}m
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> On Time
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onSelectTrainNumber && onSelectTrainNumber(train.trainNumber)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
