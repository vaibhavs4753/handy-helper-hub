import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Star, Clock, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouting } from '@/hooks/useRouting';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const clientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const technicianIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LiveTrackingMapProps {
  clientLocation: { lat: number; lng: number };
  initialTechnicianLocation: { lat: number; lng: number };
  technicianProfileId: string;
  technicianName: string;
  technicianPhone: string;
  technicianRating: number;
  onComplete?: () => void;
}

// Component to fit bounds and update on location change
function MapUpdater({
  clientLocation,
  technicianLocation,
}: {
  clientLocation: { lat: number; lng: number };
  technicianLocation: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(
      [clientLocation.lat, clientLocation.lng],
      [technicianLocation.lat, technicianLocation.lng]
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [map, clientLocation.lat, clientLocation.lng, technicianLocation.lat, technicianLocation.lng]);

  return null;
}

export const LiveTrackingMap = ({
  clientLocation,
  initialTechnicianLocation,
  technicianProfileId,
  technicianName,
  technicianPhone,
  technicianRating,
  onComplete,
}: LiveTrackingMapProps) => {
  // Real-time location tracking (subscribe only, not broadcasting)
  const { technicianLocation: realtimeLocation } = useRealtimeLocation({
    technicianProfileId,
    isTracking: false,
  });

  // Current technician position (realtime or initial)
  const currentTechnicianLocation = useMemo(
    () =>
      realtimeLocation
        ? { lat: realtimeLocation.lat, lng: realtimeLocation.lng }
        : initialTechnicianLocation,
    [realtimeLocation, initialTechnicianLocation]
  );

  // Route calculation
  const { route, distanceKm, durationMinutes } = useRouting({
    origin: currentTechnicianLocation,
    destination: clientLocation,
    enabled: true,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Info Card */}
      <div className="bg-card border-b border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">👷</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{technicianName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{technicianRating}</span>
              </div>
            </div>
          </div>
          {technicianPhone && (
            <a
              href={`tel:${technicianPhone}`}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Estimated arrival</p>
              <p className="font-semibold text-foreground">
                {durationMinutes ? `${durationMinutes} min` : 'Calculating...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">
                {distanceKm ? `${distanceKm} km` : 'Calculating...'}
              </p>
            </div>
          </div>
        </div>

        {/* Live tracking indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-xs text-success font-medium">Live Tracking Active</span>
        </div>

      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <MapContainer
          center={[clientLocation.lat, clientLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Client Marker */}
          <Marker position={[clientLocation.lat, clientLocation.lng]} icon={clientIcon}>
            <Popup>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Your Location</span>
              </div>
            </Popup>
          </Marker>

          {/* Technician Marker */}
          <Marker
            position={[currentTechnicianLocation.lat, currentTechnicianLocation.lng]}
            icon={technicianIcon}
          >
            <Popup>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>{technicianName} - Technician</span>
              </div>
            </Popup>
          </Marker>

          {/* Route Polyline */}
          {route && route.coordinates.length > 0 && (
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: '#3b82f6',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />
          )}

          <MapUpdater
            clientLocation={clientLocation}
            technicianLocation={currentTechnicianLocation}
          />
        </MapContainer>
      </div>

      {/* Action Button */}
      <div className="p-4 bg-background border-t border-border">
        <Button
          onClick={onComplete}
          className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
        >
          Mark as Completed
        </Button>
      </div>
    </div>
  );
};
