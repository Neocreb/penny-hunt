
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for investment status
CREATE TYPE public.investment_status AS ENUM ('active', 'completed', 'cancelled');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'commission', 'daily_return', 'referral_bonus');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Create enum for KYC status
CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  kyc_status kyc_status DEFAULT 'pending',
  kyc_documents JSONB,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create investment packages table
CREATE TABLE public.investment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  daily_return_rate DECIMAL(5,4) NOT NULL,
  duration_days INTEGER NOT NULL,
  referral_bonus_rate DECIMAL(5,4) NOT NULL,
  level_commissions DECIMAL(5,4)[] NOT NULL,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user investments table
CREATE TABLE public.user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.investment_packages(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status investment_status DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  daily_return DECIMAL(10,2),
  total_returns DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  reference_id UUID,
  investment_id UUID REFERENCES public.user_investments(id),
  from_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  commission_rate DECIMAL(5,4),
  total_commissions DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  withdrawal_method TEXT NOT NULL,
  account_details JSONB,
  status withdrawal_status DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user levels table
CREATE TABLE public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level_name TEXT NOT NULL,
  direct_referrals INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 0,
  total_investment DECIMAL(10,2) DEFAULT 0,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default investment packages
INSERT INTO public.investment_packages (name, description, price, daily_return_rate, duration_days, referral_bonus_rate, level_commissions, features) VALUES
('Starter', 'Perfect for beginners', 100.00, 0.025, 30, 0.10, ARRAY[0.10, 0.05, 0.03], ARRAY['2.5% daily returns', '30-day investment period', '10% direct referral bonus', '3-level commission structure', 'Basic support']),
('Professional', 'Most popular choice', 500.00, 0.030, 45, 0.12, ARRAY[0.12, 0.07, 0.05, 0.03], ARRAY['3.0% daily returns', '45-day investment period', '12% direct referral bonus', '4-level commission structure', 'Priority support', 'Weekly bonus payments']),
('Premium', 'For serious investors', 1000.00, 0.035, 60, 0.15, ARRAY[0.15, 0.10, 0.07, 0.05, 0.03], ARRAY['3.5% daily returns', '60-day investment period', '15% direct referral bonus', '5-level commission structure', 'VIP support', 'Weekly bonus payments', 'Monthly performance bonus']),
('Elite', 'Maximum returns', 5000.00, 0.040, 90, 0.20, ARRAY[0.20, 0.15, 0.10, 0.07, 0.05, 0.03], ARRAY['4.0% daily returns', '90-day investment period', '20% direct referral bonus', '6-level commission structure', 'Dedicated account manager', 'Weekly bonus payments', 'Monthly performance bonus', 'Exclusive investment opportunities']);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    code := 'PH' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_code;
    EXIT WHEN NOT exists_code;
  END LOOP;
  RETURN code;
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referral_code_param TEXT;
  referrer_id_param UUID;
BEGIN
  -- Generate unique referral code
  referral_code_param := public.generate_referral_code();
  
  -- Find referrer if referral code was provided
  IF NEW.raw_user_meta_data ->> 'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id_param 
    FROM public.profiles 
    WHERE referral_code = NEW.raw_user_meta_data ->> 'referral_code';
  END IF;
  
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    referral_code,
    referred_by
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    referral_code_param,
    referrer_id_param
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Initialize user level
  INSERT INTO public.user_levels (user_id, level_name)
  VALUES (NEW.id, 'Bronze');
  
  -- Create referral relationship if referred
  IF referrer_id_param IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (referrer_id_param, NEW.id);
    
    -- Create notification for referrer
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      referrer_id_param,
      'New Referral!',
      'Someone joined using your referral code',
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.user_roles
  FOR INSERT WITH CHECK (true);

-- RLS Policies for investment_packages
CREATE POLICY "Anyone can view active packages" ON public.investment_packages
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_investments
CREATE POLICY "Users can view their own investments" ON public.user_investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" ON public.user_investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON public.user_investments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Enable insert for service role" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_levels
CREATE POLICY "Users can view their own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.user_levels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON public.user_levels
  FOR UPDATE USING (true);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for transactions
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for user_investments
ALTER TABLE public.user_investments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_investments;
