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
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {isAvailable && (
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-success flex items-center justify-center border-2 border-card">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{name}</h3>
          
          <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-warning text-warning" />
              <span className="text-xs sm:text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">•</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{totalJobs} jobs</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{distance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{experienceYears}+ yrs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">${hourlyRate}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">/hr</span>
        </div>
        
        <Button 
          onClick={onSelect}
          className="gradient-accent text-accent-foreground hover:opacity-90 shadow-accent-glow text-sm sm:text-base px-3 sm:px-4"
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Select
        </Button>
      </div>
    </div>
  );
};
