import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Star, Clock, Navigation, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  shadowSize: [41, 41]
});

const technicianIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ServiceMapProps {
  clientLocation: { lat: number; lng: number };
  technicianLocation: { lat: number; lng: number };
  technicianName: string;
  technicianPhone: string;
  technicianRating: number;
  eta: number;
  onComplete?: () => void;
  // Technician view props
  isTechnicianView?: boolean;
  clientName?: string;
  clientPhone?: string;
  jobStatus?: 'accepted' | 'in_progress' | 'pending' | 'completed';
  onStartJob?: () => void;
}

// Component to fit bounds
function FitBounds({ clientLocation, technicianLocation }: { 
  clientLocation: { lat: number; lng: number }; 
  technicianLocation: { lat: number; lng: number };
}) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLngBounds(
      [clientLocation.lat, clientLocation.lng],
      [technicianLocation.lat, technicianLocation.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, clientLocation, technicianLocation]);
  
  return null;
}

export const ServiceMap = ({
  clientLocation,
  technicianLocation,
  technicianName,
  technicianPhone,
  technicianRating,
  eta,
  onComplete,
  isTechnicianView = false,
  clientName,
  clientPhone,
  jobStatus,
  onStartJob
}: ServiceMapProps) => {
  // Determine which info to show based on view
  const displayName = isTechnicianView ? clientName || 'Client' : technicianName;
  const displayPhone = isTechnicianView ? clientPhone || '' : technicianPhone;
  const displayEmoji = isTechnicianView ? '👤' : '👷';
  const displayLabel = isTechnicianView ? 'Client' : 'Technician';

  return (
    <div className="flex flex-col h-full">
      {/* Info Card */}
      <div className="bg-card border-b border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">{displayEmoji}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {!isTechnicianView && (
                  <>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{technicianRating}</span>
                  </>
                )}
                {isTechnicianView && (
                  <span className="capitalize">{displayLabel}</span>
                )}
              </div>
            </div>
          </div>
          {displayPhone && (
            <a 
              href={`tel:${displayPhone}`}
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
              <p className="text-xs text-muted-foreground">
                {isTechnicianView ? 'Time to arrive' : 'Estimated arrival'}
              </p>
              <p className="font-semibold text-foreground">{eta} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">2.3 km</p>
            </div>
          </div>
        </div>

        {/* Job Status for Technician */}
        {isTechnicianView && jobStatus && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              jobStatus === 'accepted' 
                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}>
              {jobStatus === 'accepted' ? 'Heading to location' : 'Work in progress'}
            </span>
          </div>
        )}
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
          
          <Marker position={[clientLocation.lat, clientLocation.lng]} icon={clientIcon}>
            <Popup>{isTechnicianView ? `${clientName} - Client` : 'Your Location'}</Popup>
          </Marker>
          
          <Marker position={[technicianLocation.lat, technicianLocation.lng]} icon={technicianIcon}>
            <Popup>{isTechnicianView ? 'Your Location' : `${technicianName} - Technician`}</Popup>
          </Marker>

          <FitBounds clientLocation={clientLocation} technicianLocation={technicianLocation} />
        </MapContainer>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-background border-t border-border">
        {isTechnicianView ? (
          <>
            {jobStatus === 'accepted' && onStartJob && (
              <Button 
                onClick={onStartJob}
                className="w-full py-6 text-lg gradient-primary text-primary-foreground shadow-glow"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Job
              </Button>
            )}
            {jobStatus === 'in_progress' && (
              <Button 
                onClick={onComplete}
                className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete Job
              </Button>
            )}
          </>
        ) : (
          <Button 
            onClick={onComplete}
            className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
          >
            Mark as Completed
          </Button>
        )}
      </div>
    </div>
  );
};
