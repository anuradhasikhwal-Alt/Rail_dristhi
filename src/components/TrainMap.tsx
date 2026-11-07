import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { TrainInfo, RunningTrainStatus, StationCoordinates } from '../types/train';
import {
  Train,
  MapPin,
  Layers,
  LocateFixed,
  Maximize2,
  Clock,
  Compass,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface TrainMapProps {
  train: TrainInfo;
  runningStatus: RunningTrainStatus;
  selectedStationCode?: string;
  onSelectStation?: (stationCode: string) => void;
  apiKey?: string;
}

// Inner helper to handle polylines and camera fitting
function MapTrackOverlay({
  train,
  runningStatus,
  selectedStationCode,
  isFollowTrain,
}: {
  train: TrainInfo;
  runningStatus: RunningTrainStatus;
  selectedStationCode?: string;
  isFollowTrain: boolean;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const passedPolylineRef = useRef<google.maps.Polyline | null>(null);

  // Compute full track path
  const pathCoordinates = useMemo(() => {
    return train.schedule.map((stop) => ({
      lat: stop.coordinates.lat,
      lng: stop.coordinates.lng,
    }));
  }, [train]);

  // Compute passed path up to train's current position
  const passedPathCoordinates = useMemo(() => {
    const coords: { lat: number; lng: number }[] = [];
    for (const stop of train.schedule) {
      if (stop.distanceKm <= (runningStatus.progressPercent / 100) * train.totalDistanceKm) {
        coords.push({ lat: stop.coordinates.lat, lng: stop.coordinates.lng });
      }
    }
    coords.push({
      lat: runningStatus.currentCoordinates.lat,
      lng: runningStatus.currentCoordinates.lng,
    });
    return coords;
  }, [train, runningStatus]);

  // Render Polylines on the map
  useEffect(() => {
    if (!map || !mapsLib) return;

    // Remaining / Total route (steel grey-blue)
    if (!polylineRef.current) {
      polylineRef.current = new mapsLib.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#475569',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
    } else {
      polylineRef.current.setPath(pathCoordinates);
      polylineRef.current.setMap(map);
    }

    // Active covered route (vibrant emerald green)
    if (!passedPolylineRef.current) {
      passedPolylineRef.current = new mapsLib.Polyline({
        path: passedPathCoordinates,
        geodesic: true,
        strokeColor: '#10b981',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map,
      });
    } else {
      passedPolylineRef.current.setPath(passedPathCoordinates);
      passedPolylineRef.current.setMap(map);
    }

    return () => {
      polylineRef.current?.setMap(null);
      passedPolylineRef.current?.setMap(null);
    };
  }, [map, mapsLib, pathCoordinates, passedPathCoordinates]);

  // Fit bounds initially or when train changes
  useEffect(() => {
    if (!map || pathCoordinates.length === 0) return;

    if (!isFollowTrain && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      pathCoordinates.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [map, train.number, isFollowTrain, pathCoordinates]);

  // Pan to train when follow mode is on
  useEffect(() => {
    if (map && isFollowTrain) {
      map.panTo({
        lat: runningStatus.currentCoordinates.lat,
        lng: runningStatus.currentCoordinates.lng,
      });
    }
  }, [map, isFollowTrain, runningStatus.currentCoordinates]);

  // Pan to selected station if changed
  useEffect(() => {
    if (!map || !selectedStationCode) return;
    const stop = train.schedule.find((s) => s.stationCode === selectedStationCode);
    if (stop) {
      map.panTo({
        lat: stop.coordinates.lat,
        lng: stop.coordinates.lng,
      });
      map.setZoom(10);
    }
  }, [map, selectedStationCode, train]);

  return null;
}

export const TrainMap: React.FC<TrainMapProps> = ({
  train,
  runningStatus,
  selectedStationCode,
  onSelectStation,
  apiKey,
}) => {
  const [activeStationCode, setActiveStationCode] = useState<string | null>(null);
  const [isFollowTrain, setIsFollowTrain] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // Compute map center (either train's current position or first stop)
  const defaultCenter = useMemo(() => {
    return {
      lat: runningStatus.currentCoordinates.lat || 28.6429,
      lng: runningStatus.currentCoordinates.lng || 77.2195,
    };
  }, [runningStatus.currentCoordinates]);

  const activeStop = useMemo(() => {
    if (!activeStationCode) return null;
    return train.schedule.find((s) => s.stationCode === activeStationCode) || null;
  }, [activeStationCode, train]);

  const effectiveKey = apiKey || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
      <APIProvider apiKey={effectiveKey}>
        <GoogleMap
          style={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={6}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <MapTrackOverlay
            train={train}
            runningStatus={runningStatus}
            selectedStationCode={selectedStationCode}
            isFollowTrain={isFollowTrain}
          />

          {/* Station Markers along the track */}
          {train.schedule.map((stop, index) => {
            const isOrigin = index === 0;
            const isDestination = index === train.schedule.length - 1;
            const isPassed =
              stop.distanceKm <=
              (runningStatus.progressPercent / 100) * train.totalDistanceKm;

            return (
              <AdvancedMarker
                key={stop.stationCode}
                position={{
                  lat: stop.coordinates.lat,
                  lng: stop.coordinates.lng,
                }}
                title={`${stop.stationName} (${stop.stationCode})`}
                onClick={() => {
                  setActiveStationCode(stop.stationCode);
                  if (onSelectStation) onSelectStation(stop.stationCode);
                }}
              >
                <div className="cursor-pointer group relative flex flex-col items-center">
                  {/* Station Marker Pin */}
                  <div
                    className={`flex items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-200 group-hover:scale-125 ${
                      isOrigin || isDestination
                        ? 'w-7 h-7 bg-amber-500 border-amber-200 text-slate-950'
                        : isPassed
                        ? 'w-5 h-5 bg-emerald-600 border-emerald-200 text-white'
                        : 'w-5 h-5 bg-slate-800 border-slate-400 text-slate-300'
                    }`}
                  >
                    {isOrigin ? (
                      <span className="text-[10px] font-black">A</span>
                    ) : isDestination ? (
                      <span className="text-[10px] font-black">B</span>
                    ) : (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPassed ? 'bg-white' : 'bg-slate-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Station Code Label badge */}
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 backdrop-blur-sm text-[10px] font-semibold text-slate-200 whitespace-nowrap shadow">
                    {stop.stationCode}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Active Live Moving Train Marker */}
          <AdvancedMarker
            position={{
              lat: runningStatus.currentCoordinates.lat,
              lng: runningStatus.currentCoordinates.lng,
            }}
            title={`${train.name} (${train.number})`}
            zIndex={100}
          >
            <div className="relative flex flex-col items-center cursor-pointer">
              {/* Outer pulsing ring */}
              <div className="absolute -inset-2 bg-rose-500/30 rounded-full animate-ping" />

              {/* Train Locomotive Icon Badge */}
              <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-rose-600 to-amber-500 text-white rounded-full shadow-2xl border-2 border-white ring-4 ring-rose-500/40">
                <Train className="w-5 h-5" />
              </div>

              {/* Speed & Status pill */}
              <div className="mt-1.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/95 border border-rose-500/50 shadow-xl backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">
                  {runningStatus.currentSpeedKmH} km/h
                </span>
              </div>
            </div>
          </AdvancedMarker>

          {/* InfoWindow for Station details */}
          {activeStop && (
            <InfoWindow
              position={{
                lat: activeStop.coordinates.lat,
                lng: activeStop.coordinates.lng,
              }}
              onCloseClick={() => setActiveStationCode(null)}
            >
              <div className="p-2 max-w-xs text-slate-900">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {activeStop.stationName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Code: {activeStop.stationCode} • {activeStop.state}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                    PF #{activeStop.platform}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Arr / Dep</span>
                    <span className="font-bold text-slate-800">
                      {activeStop.scheduledArrival} / {activeStop.scheduledDeparture}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Halt / Dist</span>
                    <span className="font-bold text-slate-800">
                      {activeStop.haltMinutes}m • {activeStop.distanceKm} km
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Water &amp; Refreshments available on platform
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Train Info HUD Badge */}
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                {train.number}
              </span>
              <span className="text-xs text-orange-400 font-semibold uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                {train.type}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {train.sourceCode} ➔ {train.destinationCode} ({train.totalDistanceKm} km)
            </p>
          </div>
        </div>
      </div>

      {/* Top Right Quick Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Recenter on Train button */}
        <button
          onClick={() => setIsFollowTrain(!isFollowTrain)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md transition-all ${
            isFollowTrain
              ? 'bg-rose-600 border-rose-500 text-white shadow-rose-900/30'
              : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Keep camera focused on moving train"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>{isFollowTrain ? 'Tracking Live' : 'Center Train'}</span>
        </button>

        {/* Layer style toggle */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              mapType === 'roadmap' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              mapType === 'terrain' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              mapType === 'hybrid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Bottom Floating Live Telemetry Strip */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE GPS</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-700" />
            <div className="text-slate-300">
              Last Station: <span className="text-white font-semibold">{runningStatus.lastDepartedStation}</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-700" />
            <div className="text-slate-300">
              Next Stop: <span className="text-amber-400 font-semibold">{runningStatus.nextUpcomingStation}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Current Delay</span>
              <span
                className={`font-bold ${
                  runningStatus.delayMinutes === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {runningStatus.delayMinutes === 0
                  ? 'Right Time (RT)'
                  : `+${runningStatus.delayMinutes} mins Late`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Progress</span>
              <span className="font-bold text-white">{runningStatus.progressPercent}% Route Covered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
