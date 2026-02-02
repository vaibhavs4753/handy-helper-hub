import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, CheckCircle2, XCircle, Phone, MessageSquare, Navigation, Wrench, Zap, Droplets, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LiveTrackingMap } from '@/components/LiveTrackingMap';
interface ServiceRequest {
  id: string;
  service_type: 'electrical' | 'mechanical' | 'plumbing';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  client: {
    id: string;
    full_name: string;
    phone: string | null;
  };
}

interface TechnicianProfile {
  id: string;
  profile_id: string;
  is_available: boolean;
  hourly_rate: number;
  rating: number;
  total_jobs: number;
  services: string[];
}

const serviceIcons = {
  electrical: Zap,
  mechanical: Wrench,
  plumbing: Droplets,
};

const serviceColors = {
  electrical: 'bg-electrical/10 text-electrical border-electrical/30',
  mechanical: 'bg-mechanical/10 text-mechanical border-mechanical/30',
  plumbing: 'bg-plumbing/10 text-plumbing border-plumbing/30',
};

export default function TechnicianApp() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<{ id: string; full_name: string } | null>(null);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [activeJob, setActiveJob] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [technicianLocation, setTechnicianLocation] = useState({ lat: 37.7849, lng: -122.4094 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=technician');
    }
  }, [user, authLoading, navigate]);

  // Get technician's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTechnicianLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchTechnicianProfile();
      fetchPendingRequests();
      subscribeToRequests();
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, user_type')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      // If user is not a technician, redirect them
      if (data.user_type !== 'technician') {
        navigate('/client');
        return;
      }
      setProfile({ id: data.id, full_name: data.full_name });
    }
  };

  const fetchTechnicianProfile = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('technician_profiles')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (data) {
      setTechnicianProfile(data);
      setIsAvailable(data.is_available ?? true);
    } else {
      // Create technician profile if doesn't exist
      const { data: newProfile } = await supabase
        .from('technician_profiles')
        .insert({
          profile_id: profile.id,
          is_available: true,
          services: ['electrical', 'mechanical', 'plumbing'],
        })
        .select()
        .single();
      
      if (newProfile) {
        setTechnicianProfile(newProfile);
      }
    }
    setLoading(false);
  };

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select(`
        id,
        service_type,
        status,
        address,
        description,
        latitude,
        longitude,
        created_at,
        client:client_id(id, full_name, phone)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      const transformedData = data.map(item => ({
        ...item,
        client: Array.isArray(item.client) ? item.client[0] : item.client
      })) as ServiceRequest[];
      setPendingRequests(transformedData);
    }
  };

  const fetchActiveJob = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('service_requests')
      .select(`
        id,
        service_type,
        status,
        address,
        description,
        latitude,
        longitude,
        created_at,
        client:client_id(id, full_name, phone)
      `)
      .eq('technician_id', profile.id)
      .in('status', ['accepted', 'in_progress'])
      .maybeSingle();

    if (data) {
      const transformedData = {
        ...data,
        client: Array.isArray(data.client) ? data.client[0] : data.client
      } as ServiceRequest;
      setActiveJob(transformedData);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel('technician_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        () => {
          fetchPendingRequests();
          fetchActiveJob();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleAvailability = async (available: boolean) => {
    setIsAvailable(available);
    
    if (technicianProfile) {
      await supabase
        .from('technician_profiles')
        .update({ is_available: available })
        .eq('id', technicianProfile.id);
    }
  };

  const acceptRequest = async (request: ServiceRequest) => {
    if (!profile) return;

    const { error } = await supabase
      .from('service_requests')
      .update({
        technician_id: profile.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .eq('status', 'pending'); // Only if still pending

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept request. It may have been taken by another technician.',
        variant: 'destructive',
      });
    } else {
      setActiveJob({ ...request, status: 'accepted' });
      toast({
        title: 'Job Accepted!',
        description: `You're now connected with ${request.client.full_name}`,
      });
    }
  };

  const startJob = async () => {
    if (!activeJob) return;

    await supabase
      .from('service_requests')
      .update({ status: 'in_progress' })
      .eq('id', activeJob.id);

    setActiveJob({ ...activeJob, status: 'in_progress' });
    toast({
      title: 'Job Started',
      description: 'The client has been notified',
    });
  };

  const completeJob = async () => {
    if (!activeJob) return;

    await supabase
      .from('service_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeJob.id);

    // Update total jobs
    if (technicianProfile) {
      await supabase
        .from('technician_profiles')
        .update({ total_jobs: (technicianProfile.total_jobs || 0) + 1 })
        .eq('id', technicianProfile.id);
    }

    setActiveJob(null);
    toast({
      title: 'Job Completed!',
      description: 'Great work! The job has been marked as complete.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Active Job View with Live Tracking Map
  if (activeJob && profile) {
    return (
      <div className="h-screen flex flex-col">
        <LiveTrackingMap
          clientLocation={{ lat: activeJob.latitude, lng: activeJob.longitude }}
          initialTechnicianLocation={technicianLocation}
          technicianProfileId={profile.id}
          technicianName={profile.full_name || 'Technician'}
          technicianPhone=""
          technicianRating={technicianProfile?.rating || 4.8}
          onComplete={completeJob}
          isTechnicianView={true}
          clientName={activeJob.client.full_name}
          clientPhone={activeJob.client.phone || ''}
          jobStatus={activeJob.status}
          onStartJob={startJob}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm sm:text-base">FixIt<span className="text-primary">Pro</span></h1>
              <p className="text-xs text-muted-foreground">Technician</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-success' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-medium">{isAvailable ? 'Online' : 'Offline'}</span>
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
                className="scale-75"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Hello, {profile?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAvailable 
              ? `${pendingRequests.length} service request${pendingRequests.length !== 1 ? 's' : ''} nearby`
              : 'You are currently offline'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{technicianProfile?.total_jobs || 0}</div>
            <div className="text-xs text-muted-foreground">Jobs Done</div>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xl sm:text-2xl font-bold text-foreground">{technicianProfile?.rating || '4.8'}</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center">
            <div className="text-xl sm:text-2xl font-bold text-foreground">${technicianProfile?.hourly_rate || '25'}</div>
            <div className="text-xs text-muted-foreground">Per Hour</div>
          </div>
        </div>

        {/* Available Requests */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">Available Requests</h3>
          
          {!isAvailable ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-2">You're Offline</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Turn on availability to see new requests
              </p>
              <Button onClick={() => toggleAvailability(true)} className="gradient-primary text-primary-foreground">
                Go Online
              </Button>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-2">No Requests Yet</h4>
              <p className="text-sm text-muted-foreground">
                New service requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const Icon = serviceIcons[request.service_type];
                const colorClass = serviceColors[request.service_type];
                
                return (
                  <div
                    key={request.id}
                    className="bg-card rounded-xl border border-border p-4 animate-fade-in"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground capitalize">
                            {request.service_type} Service
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(request.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {request.client.full_name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{request.address}</span>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground pl-6">
                          "{request.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {}}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        className="flex-1 gradient-accent text-accent-foreground"
                        onClick={() => acceptRequest(request)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}
