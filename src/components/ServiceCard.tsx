import { Zap, Wrench, Droplets, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  type: 'electrical' | 'mechanical' | 'plumbing';
  onClick: () => void;
  selected?: boolean;
}

const serviceConfig: Record<string, { icon: LucideIcon; label: string; description: string; colorClass: string; bgClass: string }> = {
  electrical: {
    icon: Zap,
    label: 'Electrical',
    description: 'Wiring, repairs, installations',
    colorClass: 'text-electrical',
    bgClass: 'bg-electrical/10 hover:bg-electrical/20 border-electrical/30',
  },
  mechanical: {
    icon: Wrench,
    label: 'Mechanical',
    description: 'HVAC, appliances, equipment',
    colorClass: 'text-mechanical',
    bgClass: 'bg-mechanical/10 hover:bg-mechanical/20 border-mechanical/30',
  },
  plumbing: {
    icon: Droplets,
    label: 'Plumbing',
    description: 'Pipes, fixtures, drainage',
    colorClass: 'text-plumbing',
    bgClass: 'bg-plumbing/10 hover:bg-plumbing/20 border-plumbing/30',
  },
};

export const ServiceCard = ({ type, onClick, selected }: ServiceCardProps) => {
  const config = serviceConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left',
        config.bgClass,
        selected && 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
      )}
    >
      <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', config.colorClass, 'bg-current/10')}>
        <Icon className={cn('w-7 h-7', config.colorClass)} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{config.label}</h3>
      <p className="text-sm text-muted-foreground">{config.description}</p>
      
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
