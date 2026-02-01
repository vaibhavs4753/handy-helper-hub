import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, Loader2, ChevronRight, History, User, LogOut, Zap, Wrench, Droplets, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceTypeCard, ServiceType } from '@/components/ServiceTypeCard';
import { WaitingForTechnician } from '@/components/WaitingForTechnician';
import { ServiceMap } from '@/components/ServiceMap';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AppView = 'home' | 'select-service' | 'details' | 'payment' | 'waiting' | 'connected' | 'history';

interface TechnicianInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  eta: number;
  latitude: number;
  longitude: number;
}

interface ServiceRequest {
  id: string;
  service_type: 'electrical' | 'mechanical' | 'plumbing';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  created_at: string;
  technician?: {
    full_name: string;
  };
}

const serviceIcons = {
  electrical: Zap,
  mechanical: Wrench,
  plumbing: Droplets,
};

export default function ClientApp() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [view, setView] = useState<AppView>('home');
  const [profile, setProfile] = useState<{ id: string; full_name: string } | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedTechnician, setConnectedTechnician] = useState<TechnicianInfo | null>(null);
  const [clientLocation, setClientLocation] = useState({ lat: 37.7749, lng: -122.4194 });
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [pastRequests, setPastRequests] = useState<ServiceRequest[]>([]);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(50); // Base service fee

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=client');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchRequests();
      subscribeToRequests();
    }
  }, [profile]);

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
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, user_type')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      // If user is a technician, redirect them
      if (data.user_type === 'technician') {
        navigate('/technician');
        return;
      }
      setProfile({ id: data.id, full_name: data.full_name });
    }
  };

  const fetchRequests = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('service_requests')
      .select(`
        id,
        service_type,
        status,
        address,
        created_at,
        technician:technician_id(full_name)
      `)
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      const transformedData = data.map(item => ({
        ...item,
        technician: Array.isArray(item.technician) ? item.technician[0] : item.technician
      })) as ServiceRequest[];
      
      setActiveRequests(transformedData.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)));
      setPastRequests(transformedData.filter(r => ['completed', 'cancelled'].includes(r.status)));
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel('client_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        (payload) => {
          fetchRequests();
          
          // Check if a technician accepted our request
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as any;
            if (updated.id === currentRequestId && updated.status === 'accepted' && updated.technician_id) {
              // Fetch technician details
              fetchTechnicianDetails(updated.technician_id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTechnicianDetails = async (technicianProfileId: string) => {
    const { data: techProfile } = await supabase
      .from('technician_profiles')
      .select(`
        *,
        profile:profile_id(full_name, phone)
      `)
      .eq('profile_id', technicianProfileId)
      .single();

    if (techProfile) {
      const profileData = Array.isArray(techProfile.profile) ? techProfile.profile[0] : techProfile.profile;
      setConnectedTechnician({
        id: techProfile.id,
        name: profileData?.full_name || 'Technician',
        phone: profileData?.phone || '',
        rating: techProfile.rating || 4.8,
        eta: 15,
        latitude: techProfile.latitude || clientLocation.lat + 0.01,
        longitude: techProfile.longitude || clientLocation.lng + 0.01,
      });
      setView('connected');
    }
  };

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
    setView('details');
  };

  const handleProceedToPayment = () => {
    if (!address) {
      toast({
        title: 'Missing Address',
        description: 'Please enter your address',
        variant: 'destructive',
      });
      return;
    }
    // Set estimated cost based on service type
    const baseCosts = { electrical: 60, mechanical: 55, plumbing: 50 };
    setEstimatedCost(baseCosts[selectedService!] || 50);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.from('service_requests').insert({
        client_id: profile!.id,
        service_type: selectedService,
        description: description || `${selectedService} service request`,
        address: address,
        latitude: clientLocation.lat,
        longitude: clientLocation.lng,
        status: 'pending',
        payment_status: 'paid',
        estimated_cost: estimatedCost,
      }).select().single();

      if (error) throw error;

      setCurrentRequestId(data.id);
      setView('waiting');
      toast({
        title: 'Payment Successful!',
        description: 'Looking for nearby technicians...',
      });
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

  const handleSubmitRequest = () => {
    handleProceedToPayment();
  };

  const handleTechnicianAccepted = (technician: TechnicianInfo) => {
    setConnectedTechnician(technician);
    setView('connected');
    toast({
      title: 'Technician Found!',
      description: `${technician.name} has accepted your request`,
    });
  };

  const handleCancelRequest = async () => {
    if (currentRequestId) {
      await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', currentRequestId);
    }
    resetBookingState();
  };

  const resetBookingState = () => {
    setView('home');
    setSelectedService(null);
    setAddress('');
    setDescription('');
    setCurrentRequestId(null);
    setConnectedTechnician(null);
  };

  const handleServiceComplete = () => {
    toast({
      title: 'Service Completed!',
      description: 'Thank you for using FixIt Pro',
    });
    resetBookingState();
    fetchRequests();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">Accepted</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/20">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Cancelled</span>;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Connected View with Map
  if (view === 'connected' && connectedTechnician) {
    return (
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
    );
  }

  // Waiting View
  if (view === 'waiting') {
    return (
      <WaitingForTechnician
        serviceType={selectedService || ''}
        address={address}
        onCancel={handleCancelRequest}
        onTechnicianAccepted={handleTechnicianAccepted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'home' && view !== 'history' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => view === 'details' ? setView('select-service') : setView('home')}
                className="w-9 h-9"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-sm sm:text-base">FixIt<span className="text-primary">Pro</span></h1>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {view === 'home' && (
              <Button variant="ghost" size="icon" onClick={() => setView('history')}>
                <History className="w-5 h-5" />
              </Button>
            )}
            {view === 'history' && (
              <Button variant="ghost" size="sm" onClick={() => setView('home')}>
                Back
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Home View */}
      {view === 'home' && (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-2xl">
          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              Hello, {profile?.full_name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              What do you need help with today?
            </p>
          </div>

          {/* Main CTA */}
          <Button
            onClick={() => setView('select-service')}
            className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow mb-6"
          >
            Request a Service
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Quick Services */}
          <section className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-3">Quick Services</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['electrical', 'mechanical', 'plumbing'] as const).map((service) => {
                const Icon = serviceIcons[service];
                return (
                  <button
                    key={service}
                    onClick={() => {
                      setSelectedService(service);
                      setView('details');
                    }}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-center group"
                  >
                    <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      service === 'electrical' ? 'bg-electrical/10' :
                      service === 'mechanical' ? 'bg-mechanical/10' :
                      'bg-plumbing/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        service === 'electrical' ? 'text-electrical' :
                        service === 'mechanical' ? 'text-mechanical' :
                        'text-plumbing'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-foreground capitalize">{service}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-foreground mb-3">Active Requests</h3>
              <div className="space-y-3">
                {activeRequests.map((request) => {
                  const Icon = serviceIcons[request.service_type];
                  return (
                    <div key={request.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          request.service_type === 'electrical' ? 'bg-electrical/10' :
                          request.service_type === 'mechanical' ? 'bg-mechanical/10' :
                          'bg-plumbing/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            request.service_type === 'electrical' ? 'text-electrical' :
                            request.service_type === 'mechanical' ? 'text-mechanical' :
                            'text-plumbing'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{request.service_type}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{request.address}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sign Out */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </main>
      )}

      {/* Select Service View */}
      {view === 'select-service' && (
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

      {/* Details View */}
      {view === 'details' && (
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
                selectedService === 'electrical' ? 'bg-electrical/10 text-electrical' :
                selectedService === 'mechanical' ? 'bg-mechanical/10 text-mechanical' :
                'bg-plumbing/10 text-plumbing'
              }`}>
                {selectedService === 'electrical' && <Zap className="w-5 h-5" />}
                {selectedService === 'mechanical' && <Wrench className="w-5 h-5" />}
                {selectedService === 'plumbing' && <Droplets className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium capitalize">{selectedService} Service</p>
                <p className="text-sm text-muted-foreground">Selected service type</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView('select-service')}>
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
              <Label className="text-base font-semibold">Describe the Issue (Optional)</Label>
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
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>
          </div>
        </main>
      )}

      {/* History View */}
      {view === 'history' && (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-2xl">
          <h2 className="text-xl font-bold text-foreground mb-4">Service History</h2>
          
          {pastRequests.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">No Past Services</h3>
              <p className="text-sm text-muted-foreground">Your completed services will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastRequests.map((request) => {
                const Icon = serviceIcons[request.service_type];
                return (
                  <div key={request.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        request.service_type === 'electrical' ? 'bg-electrical/10' :
                        request.service_type === 'mechanical' ? 'bg-mechanical/10' :
                        'bg-plumbing/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          request.service_type === 'electrical' ? 'text-electrical' :
                          request.service_type === 'mechanical' ? 'text-mechanical' :
                          'text-plumbing'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{request.service_type}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{request.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={estimatedCost}
        serviceType={selectedService || ''}
      />
    </div>
  );
}
