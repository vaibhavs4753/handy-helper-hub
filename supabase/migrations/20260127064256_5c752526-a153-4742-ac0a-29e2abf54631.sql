-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('client', 'technician');

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('electrical', 'mechanical', 'plumbing');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type user_type NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create technician_profiles table for additional technician info
CREATE TABLE public.technician_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  services service_type[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  experience_years INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  description TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Technician profiles policies
CREATE POLICY "Anyone can view technician profiles" ON public.technician_profiles
  FOR SELECT USING (true);

CREATE POLICY "Technicians can update their own profile" ON public.technician_profiles
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Technicians can insert their own profile" ON public.technician_profiles
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Service requests policies
CREATE POLICY "Clients can view their own requests" ON public.service_requests
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    technician_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can create requests" ON public.service_requests
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Involved parties can update requests" ON public.service_requests
  FOR UPDATE USING (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    technician_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Technicians can view pending requests (for accepting)
CREATE POLICY "Technicians can view pending requests" ON public.service_requests
  FOR SELECT USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.technician_profiles tp ON tp.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technician_profiles_updated_at
  BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for service_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;