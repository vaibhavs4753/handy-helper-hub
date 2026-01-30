import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceTypeCard, ServiceType } from '@/components/ServiceTypeCard';
import { WaitingForTechnician } from '@/components/WaitingForTechnician';
import { ServiceMap } from '@/components/ServiceMap';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type BookingStep = 'select-service' | 'details' | 'waiting' | 'connected';

interface TechnicianInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  eta: number;
  latitude: number;
  longitude: number;
}

export default function BookService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<BookingStep>('select-service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedTechnician, setConnectedTechnician] = useState<TechnicianInfo | null>(null);
  const [clientLocation, setClientLocation] = useState({ lat: 37.7749, lng: -122.4194 });

  useEffect(() => {
    if (!user) {
      navigate('/auth?role=client');
    }
  }, [user, navigate]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClientLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
  };

  const handleContinueToDetails = () => {
    if (!selectedService) {
      toast({
        title: 'Select a Service',
        description: 'Please select the type of service you need',
        variant: 'destructive',
      });
      return;
    }
    setStep('details');
  };

  const handleSubmitRequest = async () => {
    if (!address) {
      toast({
        title: 'Missing Address',
        description: 'Please enter your address',
        variant: 'destructive',
      });
      return;
    }

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
        latitude: clientLocation.lat,
        longitude: clientLocation.lng,
        status: 'pending',
      });

      if (error) throw error;

      setStep('waiting');
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicianAccepted = (technician: TechnicianInfo) => {
    setConnectedTechnician(technician);
    setStep('connected');
    toast({
      title: 'Technician Found!',
      description: `${technician.name} has accepted your request`,
    });
  };

  const handleCancelRequest = () => {
    setStep('select-service');
    setSelectedService(null);
    setAddress('');
    setDescription('');
  };

  const handleServiceComplete = () => {
    toast({
      title: 'Service Completed!',
      description: 'Thank you for using our service',
    });
    navigate('/dashboard');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select-service');
    } else if (step === 'select-service') {
      navigate('/');
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'select-service': return 1;
      case 'details': return 2;
      case 'waiting': return 3;
      case 'connected': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden when connected */}
      {step !== 'connected' && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
          <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">
            {step !== 'waiting' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="w-9 h-9 sm:w-10 sm:h-10">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="font-semibold text-foreground text-sm sm:text-base">Book a Service</h1>
              <p className="text-xs text-muted-foreground">Step {getStepNumber()} of 4</p>
            </div>
          </div>
        </header>
      )}

      {/* Step 1: Select Service Type */}
      {step === 'select-service' && (
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                What service do you need?
              </h2>
              <p className="text-muted-foreground">
                Select the type of service you're looking for
              </p>
            </div>

            <div className="grid gap-4 sm:gap-5">
              {(['electrical', 'mechanical', 'plumbing'] as const).map((service) => (
                <ServiceTypeCard
                  key={service}
                  type={service}
                  selected={selectedService === service}
                  onClick={() => handleServiceSelect(service)}
                />
              ))}
            </div>

            <Button
              onClick={handleContinueToDetails}
              disabled={!selectedService}
              className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow mt-6"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>
      )}

      {/* Step 2: Enter Details */}
      {step === 'details' && (
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Where do you need help?
              </h2>
              <p className="text-muted-foreground">
                Enter your location and describe the issue
              </p>
            </div>

            {/* Selected Service Summary */}
            <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedService === 'electrical' ? 'bg-yellow-500/20 text-electrical' :
                selectedService === 'mechanical' ? 'bg-blue-500/20 text-mechanical' :
                'bg-teal-500/20 text-plumbing'
              }`}>
                {selectedService === 'electrical' && <span className="text-lg">⚡</span>}
                {selectedService === 'mechanical' && <span className="text-lg">🔧</span>}
                {selectedService === 'plumbing' && <span className="text-lg">💧</span>}
              </div>
              <div className="flex-1">
                <p className="font-medium capitalize">{selectedService} Service</p>
                <p className="text-sm text-muted-foreground">Selected service type</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('select-service')}>
                Change
              </Button>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Your Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full h-12" 
                onClick={() => setAddress('123 Main Street, San Francisco, CA')}
              >
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Use Current Location
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Describe the Issue (Optional)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  placeholder="E.g., Leaking faucet in the kitchen, socket not working..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 min-h-[120px] text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitRequest}
              disabled={!address || loading}
              className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Find Technician
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </main>
      )}

      {/* Step 3: Waiting for Technician */}
      {step === 'waiting' && (
        <WaitingForTechnician
          serviceType={selectedService || ''}
          address={address}
          onCancel={handleCancelRequest}
          onTechnicianAccepted={handleTechnicianAccepted}
        />
      )}

      {/* Step 4: Connected with Map */}
      {step === 'connected' && connectedTechnician && (
        <div className="h-screen flex flex-col">
          <ServiceMap
            clientLocation={clientLocation}
            technicianLocation={{
              lat: connectedTechnician.latitude,
              lng: connectedTechnician.longitude
            }}
            technicianName={connectedTechnician.name}
            technicianPhone={connectedTechnician.phone}
            technicianRating={connectedTechnician.rating}
            eta={connectedTechnician.eta}
            onComplete={handleServiceComplete}
          />
        </div>
      )}
    </div>
  );
}
