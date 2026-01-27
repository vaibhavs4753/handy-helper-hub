import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceCard } from '@/components/ServiceCard';
import { TechnicianCard } from '@/components/TechnicianCard';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ServiceType = 'electrical' | 'mechanical' | 'plumbing';

interface Technician {
  id: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  hourly_rate: number;
  experience_years: number;
  rating: number;
  total_jobs: number;
  is_available: boolean;
  distance: number;
}

export default function ServiceRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    searchParams.get('service') as ServiceType | null
  );
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
  };

  const handleFindTechnicians = async () => {
    if (!selectedService || !address) {
      toast({
        title: 'Missing Information',
        description: 'Please select a service and enter your address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate finding technicians (in production, this would use geolocation)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock technicians data
    const mockTechnicians: Technician[] = [
      {
        id: '1',
        profile: { id: '1', full_name: 'Michael Johnson', avatar_url: null },
        hourly_rate: 45,
        experience_years: 8,
        rating: 4.9,
        total_jobs: 234,
        is_available: true,
        distance: 1.2,
      },
      {
        id: '2',
        profile: { id: '2', full_name: 'Sarah Williams', avatar_url: null },
        hourly_rate: 50,
        experience_years: 12,
        rating: 4.8,
        total_jobs: 456,
        is_available: true,
        distance: 2.5,
      },
      {
        id: '3',
        profile: { id: '3', full_name: 'David Chen', avatar_url: null },
        hourly_rate: 40,
        experience_years: 5,
        rating: 4.7,
        total_jobs: 123,
        is_available: true,
        distance: 3.8,
      },
    ];

    setTechnicians(mockTechnicians);
    setLoading(false);
    setStep(2);
  };

  const handleTechnicianSelect = (technician: Technician) => {
    setSelectedTechnician(technician);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setLoading(true);

    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Create service request
      const { error } = await supabase.from('service_requests').insert({
        client_id: profile.id,
        service_type: selectedService,
        description: description || `${selectedService} service request`,
        address: address,
        latitude: 0, // Would be actual coordinates in production
        longitude: 0,
        estimated_cost: selectedTechnician!.hourly_rate,
        payment_status: 'paid',
      });

      if (error) throw error;

      toast({
        title: 'Request Created!',
        description: 'Your service request has been submitted. A technician will accept soon.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">New Request</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 2</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Service Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Select Service Type</h2>
              <div className="grid gap-3">
                {(['electrical', 'mechanical', 'plumbing'] as const).map((service) => (
                  <ServiceCard
                    key={service}
                    type={service}
                    selected={selectedService === service}
                    onClick={() => handleServiceSelect(service)}
                  />
                ))}
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Location</h2>
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={() => setAddress('123 Main Street, City')}>
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  Use Current Location
                </Button>
              </div>
            </section>

            {/* Description */}
            <section>
              <Label className="text-lg font-semibold text-foreground mb-4 block">
                Describe the Issue (Optional)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  placeholder="E.g., Leaking faucet in the kitchen..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </section>

            {/* Find Button */}
            <Button
              onClick={handleFindTechnicians}
              disabled={!selectedService || !address || loading}
              className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding Technicians...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Nearby Technicians
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {technicians.length} Technicians Found
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a technician to proceed with payment
              </p>
            </div>

            <div className="space-y-4">
              {technicians.map((tech) => (
                <TechnicianCard
                  key={tech.id}
                  name={tech.profile.full_name}
                  rating={tech.rating}
                  totalJobs={tech.total_jobs}
                  distance={tech.distance}
                  hourlyRate={tech.hourly_rate}
                  experienceYears={tech.experience_years}
                  isAvailable={tech.is_available}
                  avatarUrl={tech.profile.avatar_url || undefined}
                  onSelect={() => handleTechnicianSelect(tech)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        amount={selectedTechnician?.hourly_rate || 0}
        serviceType={selectedService || ''}
      />
    </div>
  );
}
