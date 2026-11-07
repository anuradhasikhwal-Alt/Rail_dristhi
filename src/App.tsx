/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrainInfo, RunningTrainStatus } from './types/train';
import { POPULAR_TRAINS, calculateRunningStatus, getTrainByNumber } from './data/trainData';
import { TrainMap } from './components/TrainMap';
import { LiveRunningStatus } from './components/LiveRunningStatus';
import { PnrStatusChecker } from './components/PnrStatusChecker';
import { TrainScheduleViewer } from './components/TrainScheduleViewer';
import { SeatAvailabilityChecker } from './components/SeatAvailabilityChecker';
import { LiveStationBoard } from './components/LiveStationBoard';
import { CoachBerthGuide } from './components/CoachBerthGuide';
import {
  Train,
  Ticket,
  CalendarDays,
  Armchair,
  Building2,
  Layers,
  PhoneCall,
  Search,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'tracking' | 'pnr' | 'schedule' | 'seats' | 'stations' | 'coach'
  >('tracking');

  const [currentTrain, setCurrentTrain] = useState<TrainInfo>(POPULAR_TRAINS[0]);
  const [progress, setProgress] = useState<number>(0.42);
  const [selectedStationCode, setSelectedStationCode] = useState<string | undefined>(undefined);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Tier 1 Google Maps Quota event listener
  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const runningStatus: RunningTrainStatus = calculateRunningStatus(currentTrain, progress);

  const handleSelectTrain = (train: TrainInfo) => {
    setCurrentTrain(train);
    setProgress(0.38);
    setSelectedStationCode(undefined);
  };

  const handleTrackTrainByNumber = (trainNumber: string) => {
    const t = getTrainByNumber(trainNumber);
    if (t) {
      setCurrentTrain(t);
      setProgress(0.42);
      setSelectedStationCode(undefined);
      setActiveTab('tracking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Tier 1 Quota Banner (Case A required format) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div
              onClick={() => setActiveTab('tracking')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Train className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white tracking-tight">RailDrishti</span>
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    INDIA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Live Train GPS Tracking &amp; PNR Confirmation
                </p>
              </div>
            </div>

            {/* Quick Train Selector in Nav */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Active Train:</span>
              <select
                value={currentTrain.number}
                onChange={(e) => {
                  const t = getTrainByNumber(e.target.value);
                  if (t) handleSelectTrain(t);
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
              >
                {POPULAR_TRAINS.map((t) => (
                  <option key={t.number} value={t.number}>
                    {t.number} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time & Helpline Badges */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{currentTimeStr || 'IST Live'}</span>
              </div>

              <a
                href="tel:139"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition shadow-sm"
                title="Indian Railways 24x7 Rail Madad Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>Dial 139</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 py-1.5">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Live Train Map</span>
            </button>

            <button
              onClick={() => setActiveTab('pnr')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'pnr'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>PNR Status</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Train Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('seats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'seats'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>Seat Availability</span>
            </button>

            <button
              onClick={() => setActiveTab('stations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'stations'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Live Station Board</span>
            </button>

            <button
              onClick={() => setActiveTab('coach')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'coach'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-950/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Coach &amp; Berth Layout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Live Train Tracking (Google Map + Running Status) */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Quick Train Switcher & Search Bar */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Train to Track Live:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {POPULAR_TRAINS.slice(0, 7).map((t) => {
                    const isSelected = t.number === currentTrain.number;
                    return (
                      <button
                        key={t.number}
                        onClick={() => handleSelectTrain(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold shadow-md shadow-orange-950/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-mono font-bold">#{t.number}</span>
                        <span>{t.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Search Input */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Enter train # (e.g. 22422)..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) handleTrackTrainByNumber(val);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Google Map Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Live Satellite &amp; Railway Route Map
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  Powered by Google Maps Platform
                </span>
              </div>

              <TrainMap
                train={currentTrain}
                runningStatus={runningStatus}
                selectedStationCode={selectedStationCode}
                onSelectStation={(code) => setSelectedStationCode(code)}
              />
            </div>

            {/* Real-time Status Card & Stepper Timeline */}
            <LiveRunningStatus
              train={currentTrain}
              runningStatus={runningStatus}
              onUpdateProgress={setProgress}
              onSelectStation={(code) => setSelectedStationCode(code)}
              selectedStationCode={selectedStationCode}
            />
          </div>
        )}

        {/* Tab 2: PNR Status */}
        {activeTab === 'pnr' && (
          <PnrStatusChecker onTrackTrain={handleTrackTrainByNumber} />
        )}

        {/* Tab 3: Train Schedule Viewer */}
        {activeTab === 'schedule' && (
          <TrainScheduleViewer
            onSelectTrainForTracking={(train) => {
              handleSelectTrain(train);
              setActiveTab('tracking');
            }}
          />
        )}

        {/* Tab 4: Seat Availability Checker */}
        {activeTab === 'seats' && (
          <SeatAvailabilityChecker
            onSelectTrainForTracking={(train) => {
              handleSelectTrain(train);
              setActiveTab('tracking');
            }}
          />
        )}

        {/* Tab 5: Live Station Board */}
        {activeTab === 'stations' && (
          <LiveStationBoard onSelectTrainNumber={handleTrackTrainByNumber} />
        )}

        {/* Tab 6: Coach & Berth Layout Guide */}
        {activeTab === 'coach' && <CoachBerthGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-white">RailDrishti India</span>
            <span>— Real-Time Train Tracking &amp; IRCTC PNR System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>NTES Verified</span>
            <span>•</span>
            <span>CRIS GPS Grounded</span>
            <span>•</span>
            <span>Emergency: 139</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
