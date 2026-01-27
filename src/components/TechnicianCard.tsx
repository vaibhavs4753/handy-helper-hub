import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TechnicianCardProps {
  name: string;
  rating: number;
  totalJobs: number;
  distance: number;
  hourlyRate: number;
  experienceYears: number;
  isAvailable: boolean;
  onSelect: () => void;
  avatarUrl?: string;
}

export const TechnicianCard = ({
  name,
  rating,
  totalJobs,
  distance,
  hourlyRate,
  experienceYears,
  isAvailable,
  onSelect,
  avatarUrl,
}: TechnicianCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {isAvailable && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-card">
              <div className="w-2 h-2 rounded-full bg-success-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-sm text-muted-foreground">{totalJobs} jobs</span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{distance.toFixed(1)} km away</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{experienceYears}+ years</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div>
          <span className="text-2xl font-bold text-foreground">${hourlyRate}</span>
          <span className="text-sm text-muted-foreground">/hr</span>
        </div>
        
        <Button 
          onClick={onSelect}
          className="gradient-accent text-accent-foreground hover:opacity-90 shadow-accent-glow"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Select
        </Button>
      </div>
    </div>
  );
};
