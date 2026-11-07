import React, { useState } from 'react';
import { TrainInfo, SeatAvailabilityResult, DayAvailability } from '../types/train';
import { POPULAR_TRAINS, checkSeatAvailability, getTrainByNumber } from '../data/trainData';
import {
  Armchair,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Tag,
  Sparkles,
  Train,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeatAvailabilityCheckerProps {
  onSelectTrainForTracking?: (train: TrainInfo) => void;
}

export const SeatAvailabilityChecker: React.FC<SeatAvailabilityCheckerProps> = ({
  onSelectTrainForTracking,
}) => {
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12951');
  const [journeyDate, setJourneyDate] = useState<string>('2026-11-07');
  const [travelClass, setTravelClass] = useState<string>('3A');
  const [quota, setQuota] = useState<string>('GN');
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);

  const train = getTrainByNumber(selectedTrainNumber) || POPULAR_TRAINS[0];

  const [availabilityResult, setAvailabilityResult] = useState<SeatAvailabilityResult>(() =>
    checkSeatAvailability(
      selectedTrainNumber,
      train.sourceCode,
      train.destinationCode,
      journeyDate,
      travelClass,
      quota
    )
  );

  const handleCheckAvailability = () => {
    const res = checkSeatAvailability(
      selectedTrainNumber,
      train.sourceCode,
      train.destinationCode,
      journeyDate,
      travelClass,
      quota
    );
    setAvailabilityResult(res);
  };

  const handleTrainChange = (num: string) => {
    setSelectedTrainNumber(num);
    const newTrain = getTrainByNumber(num) || POPULAR_TRAINS[0];
    const initialClass = newTrain.classes[0] || '3A';
    setTravelClass(initialClass);

    const res = checkSeatAvailability(
      num,
      newTrain.sourceCode,
      newTrain.destinationCode,
      journeyDate,
      initialClass,
      quota
    );
    setAvailabilityResult(res);
  };

  const handleBookClick = (day: DayAvailability) => {
    setSelectedDay(day);
    setBookingModalOpen(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const QUOTAS = [
    { code: 'GN', name: 'General (GN)' },
    { code: 'TQ', name: 'Tatkal (TQ)' },
    { code: 'PT', name: 'Premium Tatkal (PT)' },
    { code: 'LD', name: 'Ladies (LD)' },
    { code: 'SS', name: 'Senior Citizen (SS)' },
  ];

  const CLASSES_INFO: Record<string, string> = {
    '1A': 'AC First Class (Coupe & Cabins with sliding doors)',
    '2A': 'AC 2-Tier (Curtains, 48-54 berths)',
    '3A': 'AC 3-Tier (64-72 berths, most popular)',
    '3E': 'AC 3-Economy (Modern 3AC layout with 83 berths)',
    'CC': 'AC Chair Car (3x2 seating for daytime journeys)',
    'EC': 'Executive Chair Car (2x2 luxury seating with meals)',
    'SL': 'Sleeper Class (Non-AC 72 berths)',
    '2S': 'Second Sitting (Non-AC reserved seats)',
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Armchair className="w-6 h-6 text-orange-400" />
              Live Indian Railways Seat &amp; Berth Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Check real-time confirmed berths, RAC &amp; Waitlist status with fare breakdown.
            </p>
          </div>

          {/* Form Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Train Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Train
              </label>
              <select
                value={selectedTrainNumber}
                onChange={(e) => handleTrainChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              >
                {POPULAR_TRAINS.map((t) => (
                  <option key={t.number} value={t.number}>
                    {t.number} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Date of Journey
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Class
              </label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              >
                {train.classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} ({CLASSES_INFO[cls] ? cls : cls})
                  </option>
                ))}
              </select>
            </div>

            {/* Quota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Quota
              </label>
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              >
                {QUOTAS.map((q) => (
                  <option key={q.code} value={q.code}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Route:</span>
              <span className="text-white font-bold">{train.source} ({train.sourceCode})</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-white font-bold">{train.destination} ({train.destinationCode})</span>
              <span>• Distance: {train.totalDistanceKm} km</span>
            </div>

            <button
              onClick={handleCheckAvailability}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Update Availability</span>
            </button>
          </div>
        </div>
      </div>

      {/* Availability Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Day Calendar Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              Real-Time Availability for Next 6 Dates
            </h3>
            <span className="text-xs text-slate-400">
              Class: <strong className="text-orange-400">{travelClass}</strong> • Quota: <strong className="text-white">{quota}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availabilityResult.days.map((day) => {
              const isAvailable = day.status === 'AVAILABLE';
              const isRac = day.status === 'RAC';
              const isWl = day.status === 'WL';

              return (
                <div
                  key={day.date}
                  className={`rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                    isAvailable
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20'
                      : isRac
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-amber-950/20'
                      : isWl
                      ? 'bg-orange-950/20 border-orange-500/40 hover:border-orange-400'
                      : 'bg-slate-900 border-slate-800 opacity-60'
                  } shadow-lg`}
                >
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-white">{day.date}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {travelClass}
                      </span>
                    </div>

                    <div className="pt-1">
                      <span
                        className={`text-base font-black tracking-tight block ${
                          isAvailable
                            ? 'text-emerald-400'
                            : isRac
                            ? 'text-amber-400'
                            : isWl
                            ? 'text-orange-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {day.statusLabel}
                      </span>

                      {isAvailable && (
                        <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed Berth Guaranteed
                        </span>
                      )}
                      {isRac && (
                        <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Reservation Against Cancellation
                        </span>
                      )}
                      {isWl && (
                        <span className="text-[11px] text-orange-300 font-medium flex items-center gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3" /> {day.probability}% Confirmation Chance
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClick(day)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs tracking-wide transition shadow flex items-center justify-center gap-1.5 ${
                      isAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : isRac
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>Book For ₹{availabilityResult.totalFare}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Berth Layout Information Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Berth Allocation Matrix in {travelClass}
            </span>
            <p className="text-xs text-slate-400">
              {CLASSES_INFO[travelClass] || 'Standard Indian Railways coach configuration.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                LB: Lower Berth (Senior priority)
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                MB: Middle Berth
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                UB: Upper Berth
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                SL: Side Lower
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                SU: Side Upper
              </span>
            </div>
          </div>
        </div>

        {/* Fare Summary Breakdown Card */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-orange-400" />
            IRCTC Official Fare Breakdown
          </h3>

          <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-xl space-y-4">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Fare</span>
                <span className="font-mono font-bold">₹{availabilityResult.baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reservation Surcharge</span>
                <span className="font-mono font-bold">₹{availabilityResult.reservationCharge}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Superfast Train Charge</span>
                <span className="font-mono font-bold">₹{availabilityResult.superfastCharge}</span>
              </div>
              {availabilityResult.tatkalCharge > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Tatkal Premium Charge</span>
                  <span className="font-mono font-bold">₹{availabilityResult.tatkalCharge}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Goods &amp; Services Tax (GST 5%)</span>
                <span className="font-mono font-bold">₹{availabilityResult.gst}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total Ticket Fare</span>
              <span className="text-2xl font-black text-orange-400 font-mono">
                ₹{availabilityResult.totalFare}
              </span>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Free cancellation before chart preparation
              </p>
              <p className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Valid for journey on train #{availabilityResult.trainNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Booking Modal */}
      {bookingModalOpen && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Seat Reservation Simulated</span>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Train</span>
                <span className="font-bold text-white block">{train.name} (#{train.number})</span>
                <span className="text-xs text-orange-400 font-semibold">
                  {train.sourceCode} ➔ {train.destinationCode} • {selectedDay.date}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Class &amp; Quota</span>
                  <span className="font-bold text-white">{travelClass} ({quota})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Allocated Status</span>
                  <span className="font-bold text-emerald-400 font-mono">{selectedDay.statusLabel}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
                ✓ PNR generated. You can track this journey and check live updates anytime in the PNR Tracker tab!
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
