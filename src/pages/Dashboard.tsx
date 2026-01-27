import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History, Bell, Settings, Zap, Wrench, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { RequestStatusCard } from '@/components/RequestStatusCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ServiceRequest {
  id: string;
  service_type: 'electrical' | 'mechanical' | 'plumbing';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
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

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; user_type: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRequests();
      subscribeToRequests();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name, user_type')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileData) return;

      let query = supabase
        .from('service_requests')
        .select(`
          id,
          service_type,
          status,
          address,
          created_at,
          technician:technician_id(full_name)
        `)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (profileData.user_type === 'client') {
        query = query.eq('client_id', profileData.id);
      } else {
        query = query.or(`technician_id.eq.${profileData.id},status.eq.pending`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        technician: Array.isArray(item.technician) ? item.technician[0] : item.technician
      })) as ServiceRequest[];
      
      setActiveRequests(transformedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel('service_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Request Cancelled',
        description: 'Your service request has been cancelled',
      });
      fetchRequests();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Hello, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile?.user_type === 'technician' 
              ? 'Check for new service requests nearby'
              : 'Need a repair? Book a technician now'}
          </p>
        </div>

        {/* Quick Actions */}
        {profile?.user_type === 'client' && (
          <div className="mb-8">
            <Button
              onClick={() => navigate('/request')}
              className="w-full py-6 text-lg gradient-accent text-accent-foreground shadow-accent-glow"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Service Request
            </Button>
          </div>
        )}

        {/* Active Requests */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Active Requests</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : activeRequests.length > 0 ? (
            <div className="space-y-4">
              {activeRequests.map((request) => (
                <RequestStatusCard
                  key={request.id}
                  status={request.status}
                  technicianName={request.technician?.full_name}
                  address={request.address}
                  estimatedArrival={request.status === 'accepted' ? '15-20 mins' : undefined}
                  onCancel={() => handleCancelRequest(request.id)}
                  isTechnician={profile?.user_type === 'technician'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No Active Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {profile?.user_type === 'technician'
                  ? 'New requests will appear here'
                  : 'Create a new request to get started'}
              </p>
              {profile?.user_type === 'client' && (
                <Button onClick={() => navigate('/request')} className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Quick Services for Clients */}
        {profile?.user_type === 'client' && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Services</h2>
            <div className="grid grid-cols-3 gap-3">
              {(['electrical', 'mechanical', 'plumbing'] as const).map((service) => {
                const Icon = serviceIcons[service];
                return (
                  <button
                    key={service}
                    onClick={() => navigate(`/request?service=${service}`)}
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
        )}
      </main>
    </div>
  );
}
