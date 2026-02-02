import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  lat: number;
  lng: number;
  timestamp: string;
}

interface UseRealtimeLocationOptions {
  technicianProfileId: string;
  isTracking: boolean;
  updateInterval?: number;
}

export function useRealtimeLocation({
  technicianProfileId,
  isTracking,
  updateInterval = 5000,
}: UseRealtimeLocationOptions) {
  const [technicianLocation, setTechnicianLocation] = useState<LocationData | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to realtime location updates (for client view)
  useEffect(() => {
    if (!technicianProfileId) return;

    // Subscribe to technician_profiles table changes for this specific technician
    const channel = supabase
      .channel(`technician_location_${technicianProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'technician_profiles',
          filter: `profile_id=eq.${technicianProfileId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.latitude && updated.longitude) {
            setTechnicianLocation({
              lat: updated.latitude,
              lng: updated.longitude,
              timestamp: updated.last_location_update || new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [technicianProfileId]);

  // Broadcast own location (for technician view)
  useEffect(() => {
    if (!isTracking || !technicianProfileId) return;

    const updateLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      // Update technician's location in database
      await supabase
        .from('technician_profiles')
        .update({
          latitude,
          longitude,
          last_location_update: new Date().toISOString(),
        })
        .eq('profile_id', technicianProfileId);
      
      setTechnicianLocation({
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
    };

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, technicianProfileId]);

  return { technicianLocation };
}
