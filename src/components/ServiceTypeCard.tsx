import { Zap, Wrench, Droplets, LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import electricalImage from '@/assets/electrical-service.jpg';
import mechanicalImage from '@/assets/mechanical-service.jpg';
import plumbingImage from '@/assets/plumbing-service.jpg';

export type ServiceType = 'electrical' | 'mechanical' | 'plumbing';

interface ServiceTypeCardProps {
  type: ServiceType;
  onClick: () => void;
  selected?: boolean;
}

const serviceConfig: Record<ServiceType, { 
  icon: LucideIcon; 
  label: string; 
  description: string; 
  image: string;
  colorClass: string;
  bgGradient: string;
}> = {
  electrical: {
    icon: Zap,
    label: 'Electrical',
    description: 'Wiring, repairs, panel upgrades, lighting installations',
    image: electricalImage,
    colorClass: 'text-electrical',
    bgGradient: 'from-yellow-500/20 to-amber-600/20',
  },
  mechanical: {
    icon: Wrench,
    label: 'Mechanical',
    description: 'HVAC systems, appliance repairs, equipment maintenance',
    image: mechanicalImage,
    colorClass: 'text-mechanical',
    bgGradient: 'from-blue-500/20 to-sky-600/20',
  },
  plumbing: {
    icon: Droplets,
    label: 'Plumbing',
    description: 'Pipe repairs, fixture installation, drainage solutions',
    image: plumbingImage,
    colorClass: 'text-plumbing',
    bgGradient: 'from-teal-500/20 to-emerald-600/20',
  },
};

export const ServiceTypeCard = ({ type, onClick, selected }: ServiceTypeCardProps) => {
  const config = serviceConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        selected 
          ? 'border-primary ring-2 ring-primary ring-offset-2 shadow-lg' 
          : 'border-border/50 hover:border-primary/50'
      )}
    >
      {/* Background Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img 
          src={config.image} 
          alt={config.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent'
        )} />
        
        {/* Icon Badge */}
        <div className={cn(
          'absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center',
          'bg-background/90 backdrop-blur-sm shadow-md',
          config.colorClass
        )}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Selected Check */}
        {selected && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn('text-lg sm:text-xl font-bold', config.colorClass)}>
              {config.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
          <ChevronRight className={cn(
            'w-5 h-5 transition-transform',
            selected ? 'text-primary translate-x-1' : 'text-muted-foreground group-hover:translate-x-1'
          )} />
        </div>
      </div>
    </button>
  );
};
