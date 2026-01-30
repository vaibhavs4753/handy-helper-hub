import { useEffect, useState } from 'react';
import { Loader2, MapPin, Clock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WaitingForTechnicianProps {
  serviceType: string;
  address: string;
  onCancel: () => void;
  onTechnicianAccepted?: (technician: TechnicianInfo) => void;
}

interface TechnicianInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  eta: number;
  latitude: number;
  longitude: number;
}

export const WaitingForTechnician = ({ 
  serviceType, 
  address, 
  onCancel,
  onTechnicianAccepted 
}: WaitingForTechnicianProps) => {
  const [dots, setDots] = useState('');
  const [searchRadius, setSearchRadius] = useState(1);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const radiusInterval = setInterval(() => {
      setSearchRadius(prev => prev >= 10 ? 1 : prev + 1);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(radiusInterval);
    };
  }, []);

  // Simulate technician acceptance after some time (for demo)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onTechnicianAccepted) {
        onTechnicianAccepted({
          id: 'tech-1',
          name: 'Michael Johnson',
          phone: '+1 234 567 8900',
          rating: 4.9,
          eta: 12,
          latitude: 37.7849,
          longitude: -122.4094,
        });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onTechnicianAccepted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Animated Radar */}
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8">
        {/* Radar circles */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 rounded-full border-2 border-primary/30',
              'animate-ping'
            )}
            style={{
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s',
            }}
          />
        ))}
        
        {/* Center pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Rotating line */}
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"
          style={{
            animation: 'spin 2s linear infinite',
          }}
        />
      </div>

      {/* Status Text */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">
        Finding Nearby Technicians{dots}
      </h2>
      <p className="text-muted-foreground text-center mb-6">
        Searching within {searchRadius} km radius
      </p>

      {/* Request Details Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-4 sm:p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            serviceType === 'electrical' ? 'bg-yellow-500/10 text-electrical' :
            serviceType === 'mechanical' ? 'bg-blue-500/10 text-mechanical' :
            'bg-teal-500/10 text-plumbing'
          )}>
            {serviceType === 'electrical' && <span className="text-xl">⚡</span>}
            {serviceType === 'mechanical' && <span className="text-xl">🔧</span>}
            {serviceType === 'plumbing' && <span className="text-xl">🔧</span>}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground capitalize">{serviceType} Service</h3>
            <p className="text-sm text-muted-foreground">Request pending</p>
          </div>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{address}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Clock className="w-4 h-4" />
        <span>Average wait time: 2-5 minutes</span>
      </div>

      {/* Cancel Button */}
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="w-full max-w-sm"
      >
        Cancel Request
      </Button>
    </div>
  );
};
