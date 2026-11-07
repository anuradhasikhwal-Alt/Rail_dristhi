export interface StationCoordinates {
  lat: number;
  lng: number;
}

export interface TrainStop {
  stationCode: string;
  stationName: string;
  state: string;
  coordinates: StationCoordinates;
  day: number;
  distanceKm: number;
  scheduledArrival: string; // "14:15" or "START"
  scheduledDeparture: string; // "14:20" or "END"
  haltMinutes: number;
  platform: string;
}

export interface TrainStopRunning extends TrainStop {
  actualArrival: string;
  actualDeparture: string;
  delayMinutes: number;
  status: 'passed' | 'current' | 'upcoming';
  distanceFromPreviousKm?: number;
}

export interface CoachInfo {
  code: string;
  type: 'ENGINE' | 'SLR' | 'GEN' | 'SL' | '3A' | '3E' | '2A' | '1A' | 'CC' | 'EC' | 'PC' | '2S';
  name: string;
}

export interface TrainInfo {
  number: string;
  name: string;
  type: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Superfast' | 'Mail/Express' | 'Garib Rath';
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  totalDistanceKm: number;
  durationText: string;
  averageSpeedKmH: number;
  runsOn: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  classes: string[]; // ['1A', '2A', '3A', 'SL', 'CC', 'EC', etc.]
  hasPantry: boolean;
  coaches: CoachInfo[];
  schedule: TrainStop[];
}

export interface RunningTrainStatus {
  trainNumber: string;
  trainName: string;
  date: string;
  currentStationCode: string;
  lastDepartedStation: string;
  nextUpcomingStation: string;
  delayMinutes: number;
  statusText: string;
  currentSpeedKmH: number;
  updatedAgoSeconds: number;
  currentCoordinates: StationCoordinates;
  progressPercent: number;
  stops: TrainStopRunning[];
}

export interface PnrPassenger {
  passengerNumber: number;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  bookingStatus: string; // e.g. "WL 14", "RAC 6", "CNF B2-24"
  currentStatus: string; // e.g. "CNF B2-24", "RAC 2", "WL 3"
  coach: string;
  berthNumber: string;
  berthType: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window Seat' | 'Aisle Seat' | 'Cabin';
  isConfirmed: boolean;
}

export interface PnrRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  doj: string; // Date of Journey: "2026-11-06"
  fromStation: string;
  fromCode: string;
  toStation: string;
  toCode: string;
  boardingStation: string;
  boardingCode: string;
  travelClass: string;
  quota: string;
  chartStatus: 'Chart Prepared' | 'Chart Not Prepared';
  passengers: PnrPassenger[];
  expectedPlatform: string;
  confirmationProbabilityPercent: number;
  farePaid: number;
}

export interface DayAvailability {
  date: string; // "06 Nov, Fri"
  status: 'AVAILABLE' | 'RAC' | 'WL' | 'REGRET';
  count: number;
  statusLabel: string; // "AVAILABLE-42", "RAC 8", "WL 14"
  probability?: number;
}

export interface SeatAvailabilityResult {
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  travelClass: string;
  quota: string;
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  tatkalCharge: number;
  gst: number;
  totalFare: number;
  days: DayAvailability[];
}

export interface LiveStationTrain {
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  scheduledTime: string;
  expectedTime: string;
  platform: string;
  delayMinutes: number;
  type: 'ARRIVAL' | 'DEPARTURE';
  status: 'On Time' | 'Delayed' | 'Arrived' | 'Departed';
}
