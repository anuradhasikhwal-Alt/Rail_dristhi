import React, { useState, useEffect } from 'react';
import { TrainInfo, RunningTrainStatus, TrainStopRunning } from '../types/train';
import {
  Clock,
  Navigation,
  Gauge,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  Volume2,
  ArrowRight,
  Share2,
} from 'lucide-react';

interface LiveRunningStatusProps {
  train: TrainInfo;
  runningStatus: RunningTrainStatus;
  onUpdateProgress: (newProgress: number | ((prev: number) => number)) => void;
  onSelectStation: (stationCode: string) => void;
  selectedStationCode?: string;
}

export const LiveRunningStatus: React.FC<LiveRunningStatusProps> = ({
  train,
  runningStatus,
  onUpdateProgress,
  onSelectStation,
  selectedStationCode,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [alarmStationCode, setAlarmStationCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation ticker: moves train slowly along its track
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onUpdateProgress((prev) => {
        const step = 0.002 * simulationSpeed;
        const next = prev + step;
        if (next >= 1) return 0; // loop back to start
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed, onUpdateProgress]);

  // Check alarm station
  useEffect(() => {
    if (alarmStationCode && runningStatus.nextUpcomingStation.includes(alarmStationCode)) {
      if (!alarmTriggered) {
        setAlarmTriggered(true);
        playChime();
        setToastMessage(`🚨 Station Alert! You are approaching ${alarmStationCode}. Prepare for arrival.`);
      }
    }
  }, [alarmStationCode, runningStatus.nextUpcomingStation, alarmTriggered]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext fallback
    }
  };

  const handleToggleAlarm = (stationCode: string) => {
    if (alarmStationCode === stationCode) {
      setAlarmStationCode(null);
      setToastMessage(`Alarm cleared for ${stationCode}`);
    } else {
      setAlarmStationCode(stationCode);
      setAlarmTriggered(false);
      playChime();
      setToastMessage(`⏰ Wake-up alert activated for station ${stationCode}!`);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredStops = runningStatus.stops.filter(
    (s) =>
      s.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stationCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-amber-500 text-slate-950 font-semibold rounded-xl shadow-2xl border border-amber-300 animate-bounce">
          <Volume2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Real-Time Status Card & Speedometer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Status Hero */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-700/80 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live GPS Active
              </span>
              <span className="text-xs text-slate-400">• Updated 12s ago</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 ${
                  runningStatus.delayMinutes === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {runningStatus.delayMinutes === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Right Time
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Late by {runningStatus.delayMinutes} mins
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {train.name}
              <span className="text-sm font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                #{train.number}
              </span>
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              {runningStatus.statusText}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span className="text-white font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {train.source} ({train.sourceCode})
              </span>
              <span className="text-orange-400 font-bold">{runningStatus.progressPercent}%</span>
              <span className="text-white font-semibold flex items-center gap-1">
                {train.destination} ({train.destinationCode})
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
              </span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${runningStatus.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Dep: {train.schedule[0].scheduledDeparture}</span>
              <span>Total Distance: {train.totalDistanceKm} km</span>
              <span>Exp Arr: {train.schedule[train.schedule.length - 1].scheduledArrival}</span>
            </div>
          </div>
        </div>

        {/* Speedometer & Live Simulation Controller */}
        <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-orange-400" /> Live Speed
              </span>
              <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                WAP-7 GPS
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {runningStatus.currentSpeedKmH}
              </span>
              <span className="text-sm font-bold text-slate-400">km/h</span>
            </div>
            <p className="text-xs text-slate-400">
              Avg Route Speed: <span className="text-slate-200 font-semibold">{train.averageSpeedKmH} km/h</span>
            </p>
          </div>

          {/* Simulation Toggles */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Live Simulation:</span>
              <div className="flex items-center gap-1">
                {[1, 5, 15].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      simulationSpeed === speed
                        ? 'bg-orange-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume Live
                  </>
                )}
              </button>

              <button
                onClick={() => onUpdateProgress(0)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
                title="Restart simulation from source"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Station Timeline & Route Stops */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-400" />
              Station-by-Station Live Running Progress
            </h3>
            <p className="text-xs text-slate-400">
              Interactive timeline with platforms, halt durations, and station wake-up alarms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station or code..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline Stepper Container */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
          {filteredStops.map((stop, index) => {
            const isSelected = stop.stationCode === selectedStationCode;
            const isAlarmSet = stop.stationCode === alarmStationCode;
            const isPassed = stop.status === 'passed';
            const isCurrent = stop.status === 'current';

            return (
              <div
                key={stop.stationCode}
                className={`relative group rounded-xl p-3 sm:p-4 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-800/90 border-orange-500/80 ring-1 ring-orange-500/40 shadow-lg'
                    : isCurrent
                    ? 'bg-gradient-to-r from-orange-950/30 to-slate-800/60 border-orange-500/50 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                {/* Node icon in vertical line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform ${
                    isCurrent
                      ? 'bg-orange-500 border-white text-slate-950 scale-110 shadow-lg ring-4 ring-orange-500/30'
                      : isPassed
                      ? 'bg-emerald-600 border-emerald-300 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                >
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Station Name & Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-white group-hover:text-orange-300 transition">
                        {stop.stationName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-orange-400 border border-slate-700">
                        {stop.stationCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        PF #{stop.platform}
                      </span>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-slate-950 animate-pulse">
                          CURRENT STOP
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Day {stop.day}</span>
                      <span>•</span>
                      <span>{stop.distanceKm} km from source</span>
                      <span>•</span>
                      <span>Halt: {stop.haltMinutes} mins</span>
                    </div>
                  </div>

                  {/* Arrival / Departure timings and Delay Badge */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        Sch: <span className="text-slate-300 font-semibold">{stop.scheduledArrival}</span> - <span className="text-slate-300 font-semibold">{stop.scheduledDeparture}</span>
                      </div>
                      <div className="text-xs">
                        Act / Exp: <span className="text-white font-bold">{stop.actualArrival}</span> - <span className="text-white font-bold">{stop.actualDeparture}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          stop.delayMinutes === 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {stop.delayMinutes === 0 ? 'On Time' : `+${stop.delayMinutes}m`}
                      </span>

                      {/* Station Wake-up Alarm Toggle */}
                      <button
                        onClick={() => handleToggleAlarm(stop.stationCode)}
                        className={`p-2 rounded-xl text-xs font-semibold transition border ${
                          isAlarmSet
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                        title={isAlarmSet ? 'Station alarm active' : 'Set station arrival wake-up alarm'}
                      >
                        {isAlarmSet ? (
                          <BellRing className="w-4 h-4 animate-bounce" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </button>

                      {/* Map Focus Button */}
                      <button
                        onClick={() => onSelectStation(stop.stationCode)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                        title="Focus station on Google Map"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span className="hidden sm:inline">Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
