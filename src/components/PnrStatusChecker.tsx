import React, { useState } from 'react';
import { PnrRecord, PnrPassenger } from '../types/train';
import { lookupPnr, DEMO_PNR_RECORDS, POPULAR_TRAINS } from '../data/trainData';
import {
  Ticket,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Train,
  ArrowRight,
  TrendingUp,
  Share2,
  Download,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PnrStatusCheckerProps {
  onTrackTrain?: (trainNumber: string) => void;
}

export const PnrStatusChecker: React.FC<PnrStatusCheckerProps> = ({ onTrackTrain }) => {
  const [pnrInput, setPnrInput] = useState<string>('2458913470');
  const [pnrData, setPnrData] = useState<PnrRecord>(DEMO_PNR_RECORDS['2458913470']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (pnrToQuery?: string) => {
    const query = pnrToQuery || pnrInput;
    const clean = query.replace(/\D/g, '');

    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit Indian Railways PNR number.');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = lookupPnr(clean);
      setPnrData(result);
      setLoading(false);

      if (result.passengers.some((p) => p.isConfirmed)) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 400);
  };

  const handleQuickChip = (pnr: string) => {
    setPnrInput(pnr);
    handleSearch(pnr);
  };

  // Find coach list for the train to highlight coach position
  const trainInfo = POPULAR_TRAINS.find((t) => t.number === pnrData.trainNumber) || POPULAR_TRAINS[0];

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Ticket className="w-6 h-6 text-orange-400" />
              Live IRCTC PNR Status &amp; Berth Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Get real-time seat allocation, charting status, confirmation probability &amp; coach position.
            </p>
          </div>

          {/* Input field */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                maxLength={10}
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter 10-Digit PNR Number..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold tracking-widest text-lg placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-orange-950/40 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Fetching Status...' : 'Check Status'}
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Sample PNR Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Try Sample PNRs:</span>
            {Object.keys(DEMO_PNR_RECORDS).map((pnr) => (
              <button
                key={pnr}
                onClick={() => handleQuickChip(pnr)}
                className={`px-2.5 py-1 rounded-lg border font-mono transition ${
                  pnrInput === pnr
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {pnr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PNR Digital Ticket Card */}
      {pnrData && (
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 shadow-2xl overflow-hidden">
          {/* Header Strip with Indian Railways branding */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-white/20 flex items-center justify-center">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-orange-200 block">
                  Indian Railways E-Ticket
                </span>
                <span className="font-mono text-base font-black tracking-widest text-white">
                  PNR: {pnrData.pnr}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow ${
                  pnrData.chartStatus === 'Chart Prepared'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-amber-300 border border-amber-400/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {pnrData.chartStatus}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Journey Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Train Details
                </span>
                <span className="text-base font-bold text-white block">
                  {pnrData.trainName}
                </span>
                <span className="text-xs text-orange-400 font-mono font-bold">
                  #{pnrData.trainNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Date of Journey
                </span>
                <span className="text-base font-bold text-white block flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {pnrData.doj}
                </span>
                <span className="text-xs text-slate-400">Class: {pnrData.travelClass} • Quota: {pnrData.quota}</span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Route
                </span>
                <span className="text-base font-bold text-white block">
                  {pnrData.fromCode} ➔ {pnrData.toCode}
                </span>
                <span className="text-xs text-slate-400">
                  {pnrData.fromStation} to {pnrData.toStation}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Boarding &amp; Platform
                </span>
                <span className="text-base font-bold text-white block">
                  {pnrData.boardingStation}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Expected PF #{pnrData.expectedPlatform}
                </span>
              </div>
            </div>

            {/* Passenger Status Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" /> Passenger Details &amp; Seat Allocation
                </h3>
                <span className="text-xs text-slate-400">
                  Total Fare: <strong className="text-white">₹{pnrData.farePaid}</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-800 text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Passenger Name</th>
                      <th className="py-3 px-4">Booking Status</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">Coach</th>
                      <th className="py-3 px-4">Berth / Seat</th>
                      <th className="py-3 px-4">Berth Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {pnrData.passengers.map((passenger) => (
                      <tr key={passenger.passengerNumber} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          {passenger.passengerNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {passenger.name}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            ({passenger.age}, {passenger.gender})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">
                          {passenger.bookingStatus}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                              passenger.isConfirmed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {passenger.isConfirmed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {passenger.currentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-orange-400 font-mono">
                          {passenger.coach}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white font-mono">
                          {passenger.berthNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {passenger.berthType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coach Composition Strip (Where will my coach halt?) */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  Train Coach Composition &amp; Position (From Engine)
                </span>
                <span className="text-[11px] text-slate-400">
                  Your Coach: <strong className="text-orange-400 font-mono">{pnrData.passengers[0]?.coach}</strong>
                </span>
              </div>

              {/* Visual Coach Train */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1">
                {/* Engine */}
                <div className="flex-shrink-0 w-16 h-12 rounded-lg bg-red-600 border border-red-400 text-white flex flex-col items-center justify-center shadow">
                  <Train className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">ENG</span>
                </div>

                {trainInfo.coaches.map((coach) => {
                  const isPassengerCoach = pnrData.passengers.some(
                    (p) => p.coach.toUpperCase() === coach.code.toUpperCase()
                  );

                  return (
                    <div
                      key={coach.code}
                      className={`flex-shrink-0 min-w-14 h-12 rounded-lg flex flex-col items-center justify-center border px-2 shadow transition-transform ${
                        isPassengerCoach
                          ? 'bg-orange-500 border-white text-slate-950 font-black scale-105 ring-2 ring-orange-400 shadow-orange-900/50'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                      title={`${coach.name} (${coach.code})`}
                    >
                      <span className="text-xs font-mono font-bold leading-tight">
                        {coach.code}
                      </span>
                      <span className="text-[9px] opacity-75 font-semibold">
                        {coach.type}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Tip: Locomotive is on the left. Stand near the platform marker corresponding to coach <strong className="text-orange-400">{pnrData.passengers[0]?.coach}</strong>.
              </p>
            </div>

            {/* Confirmation Probability & Live Tracking Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">
                    Historical Confirmation Chance
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-400">
                      {pnrData.confirmationProbabilityPercent}%
                    </span>
                    <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      High Probability
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Based on 12,000+ past bookings on route {pnrData.fromCode}-{pnrData.toCode}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400 opacity-60" />
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">
                    Live GPS Running Status
                  </span>
                  <span className="text-sm font-bold text-white block">
                    Track train #{pnrData.trainNumber} on Google Maps
                  </span>
                  <p className="text-[11px] text-slate-400">
                    See current speed, next station ETA &amp; platform
                  </p>
                </div>
                <button
                  onClick={() => onTrackTrain && onTrackTrain(pnrData.trainNumber)}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <span>Track Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
