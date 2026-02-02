-- Add location tracking columns to technician_profiles for real-time updates
ALTER TABLE public.technician_profiles 
ADD COLUMN IF NOT EXISTS last_location_update timestamp with time zone DEFAULT now();

-- Enable realtime for technician_profiles to broadcast location updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.technician_profiles;