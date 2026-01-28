import { Clock, MapPin, Phone, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RequestStatusCardProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  technicianName?: string;
  estimatedArrival?: string;
  address?: string;
  onCancel?: () => void;
  onComplete?: () => void;
  onNavigate?: () => void;
  isTechnician?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Finding Technician',
    description: 'Looking for available technicians nearby...',
    color: 'bg-warning/10 text-warning border-warning/30',
    icon: Loader2,
    animate: true,
  },
  accepted: {
    label: 'Technician Accepted',
    description: 'Your technician is on the way',
    color: 'bg-primary/10 text-primary border-primary/30',
    icon: Navigation,
    animate: false,
  },
  in_progress: {
    label: 'In Progress',
    description: 'Work is being done',
    color: 'bg-mechanical/10 text-mechanical border-mechanical/30',
    icon: Clock,
    animate: false,
  },
  completed: {
    label: 'Completed',
    description: 'Service has been completed',
    color: 'bg-success/10 text-success border-success/30',
    icon: CheckCircle2,
    animate: false,
  },
};

export const RequestStatusCard = ({
  status,
  technicianName,
  estimatedArrival,
  address,
  onCancel,
  onComplete,
  onNavigate,
  isTechnician,
}: RequestStatusCardProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Status Header */}
      <div className={cn('p-3 sm:p-4 border-b', config.color)}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center', config.color)}>
            <StatusIcon className={cn('w-4 h-4 sm:w-5 sm:h-5', config.animate && 'animate-spin')} />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{config.label}</h3>
            <p className="text-xs sm:text-sm opacity-80">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
        {technicianName && (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg font-semibold text-primary">
                {technicianName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm sm:text-base truncate">{technicianName}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Technician</p>
            </div>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        )}

        {estimatedArrival && status !== 'completed' && (
          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-secondary/50 rounded-lg sm:rounded-xl">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Estimated Arrival</p>
              <p className="font-semibold text-foreground text-sm sm:text-base">{estimatedArrival}</p>
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-secondary/50 rounded-lg sm:rounded-xl">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
              <p className="font-medium text-foreground text-sm sm:text-base break-words">{address}</p>
            </div>
          </div>
        )}

        {/* Map Placeholder */}
        <div className="h-32 sm:h-40 bg-muted rounded-lg sm:rounded-xl flex items-center justify-center border border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="text-center z-10">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">Live tracking map</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          {onNavigate && status === 'accepted' && (
            <Button onClick={onNavigate} className="flex-1 gradient-primary text-primary-foreground text-sm sm:text-base py-2.5 sm:py-3">
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Navigate
            </Button>
          )}
          
          {onComplete && status === 'in_progress' && isTechnician && (
            <Button onClick={onComplete} className="flex-1 bg-success text-success-foreground hover:bg-success/90 text-sm sm:text-base py-2.5 sm:py-3">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Complete
            </Button>
          )}
          
          {onCancel && status === 'pending' && (
            <Button variant="outline" onClick={onCancel} className="flex-1 text-sm sm:text-base py-2.5 sm:py-3">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
