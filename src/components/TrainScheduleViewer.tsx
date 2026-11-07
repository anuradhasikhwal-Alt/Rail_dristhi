import React, { useState } from 'react';
import { TrainInfo } from '../types/train';
import { POPULAR_TRAINS, searchTrains } from '../data/trainData';
import {
  CalendarDays,
  Search,
  Train,
  Clock,
  MapPin,
  Utensils,
  Zap,
  ArrowRight,
  Gauge,
  CheckCircle2,
  Calendar,
  Share2,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface TrainScheduleViewerProps {
  onSelectTrainForTracking: (train: TrainInfo) => void;
}

export const TrainScheduleViewer: React.FC<TrainScheduleViewerProps> = ({
  onSelectTrainForTracking,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo>(POPULAR_TRAINS[0]);

  const searchResults = searchTrains(searchQuery);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Top Search & Train Selector Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <CalendarDays className="w-6 h-6 text-orange-400" />
              Indian Railways Train Timetable &amp; Route Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Lookup official schedules, platform numbers, halt timings and route stops across India.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search train by number (e.g. 22422, 22421, 12951) or name (Salasar, Mandore, Rajdhani)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />

            {/* Instant Search Suggestions Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-800">
                {searchResults.slice(0, 8).map((match) => (
                  <button
                    key={match.number}
                    onClick={() => {
                      setSelectedTrain(match);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 hover:bg-slate-800 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-400">#{match.number}</span>
                        <span className="font-bold text-white group-hover:text-orange-300">{match.name}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {match.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {match.source} ({match.sourceCode}) ➔ {match.destination} ({match.destinationCode}) • {match.totalDistanceKm} km
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Popular Trains Carousel */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-semibold block">Premier Express Trains:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TRAINS.map((train) => {
                const isSelected = train.number === selectedTrain.number;
                return (
                  <button
                    key={train.number}
                    onClick={() => {
                      setSelectedTrain(train);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-bold'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="font-mono">{train.number}</span>
                    <span>{train.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Train Overview Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedTrain.name}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-bold text-sm">
                #{selectedTrain.number}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                {selectedTrain.type}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{selectedTrain.source} ({selectedTrain.sourceCode})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{selectedTrain.destination} ({selectedTrain.destinationCode})</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>Total: <strong className="text-white">{selectedTrain.totalDistanceKm} km</strong></span>
              <span className="text-slate-600">•</span>
              <span>Time: <strong className="text-white">{selectedTrain.durationText}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Avg Speed: <strong className="text-white">{selectedTrain.averageSpeedKmH} km/h</strong></span>
            </div>

            {/* Operating Days */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Runs On:</span>
              <div className="flex items-center gap-1">
                {daysOfWeek.map((day) => {
                  const runs = selectedTrain.runsOn.includes(day);
                  return (
                    <span
                      key={day}
                      className={`w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                        runs
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800/40 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {day.slice(0, 1)}
                    </span>
                  );
                })}
              </div>

              {selectedTrain.hasPantry && (
                <span className="ml-2 flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Utensils className="w-3.5 h-3.5" /> Pantry Car Attached
                </span>
              )}
            </div>
          </div>

          {/* Action button to switch to live GPS map */}
          <div className="flex sm:flex-col gap-2.5">
            <button
              onClick={() => onSelectTrainForTracking(selectedTrain)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-orange-950/40 transition active:scale-95"
            >
              <Train className="w-4 h-4" />
              <span>Track Live on Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Timetable Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            Complete Station-by-Station Timetable ({selectedTrain.schedule.length} Stoppages)
          </h3>
          <span className="text-xs text-slate-400">
            All times in Indian Standard Time (IST)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800 text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Station Code</th>
                <th className="py-3 px-4">Station Name &amp; State</th>
                <th className="py-3 px-4">Sch. Arrival</th>
                <th className="py-3 px-4">Sch. Departure</th>
                <th className="py-3 px-4">Halt Time</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {selectedTrain.schedule.map((stop, index) => {
                const isOrigin = index === 0;
                const isDest = index === selectedTrain.schedule.length - 1;

                return (
                  <tr
                    key={stop.stationCode}
                    className={`hover:bg-slate-800/50 transition ${
                      isOrigin || isDest ? 'bg-orange-500/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                      {stop.stationCode}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      <div>{stop.stationName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{stop.state}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {stop.scheduledArrival === 'START' ? (
                        <span className="text-emerald-400 font-bold">SOURCE</span>
                      ) : (
                        stop.scheduledArrival
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {stop.scheduledDeparture === 'END' ? (
                        <span className="text-rose-400 font-bold">DESTINATION</span>
                      ) : (
                        stop.scheduledDeparture
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {stop.haltMinutes > 0 ? `${stop.haltMinutes} mins` : '--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {stop.distanceKm} km
                    </td>
                    <td className="py-3.5 px-4">
                      Day {stop.day}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-700">
                        PF #{stop.platform}
                      </span>
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
