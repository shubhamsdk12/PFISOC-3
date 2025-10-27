-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL,
  tci_score NUMERIC(5, 2) DEFAULT 0,
  environment_score NUMERIC(5, 2) DEFAULT 0,
  social_score NUMERIC(5, 2) DEFAULT 0,
  governance_score NUMERIC(5, 2) DEFAULT 0,
  fairness_score NUMERIC(5, 2) DEFAULT 0,
  confidence_level NUMERIC(5, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('Environment', 'Social', 'Governance')),
  status TEXT NOT NULL CHECK (status IN ('Supporting', 'Contradicting', 'Neutral')),
  evidence TEXT,
  confidence NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role-based access
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Investor', 'Regulator', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table for investors
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  risk_premium NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create compliance_log table for regulators
CREATE TABLE IF NOT EXISTS public.compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (public read)
CREATE POLICY "companies_select_all" ON public.companies FOR SELECT USING (true);

-- RLS Policies for claims (public read)
CREATE POLICY "claims_select_all" ON public.claims FOR SELECT USING (true);

-- RLS Policies for user_roles (users can view their own role)
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for watchlist (users can manage their own)
CREATE POLICY "watchlist_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for compliance_log (public read)
CREATE POLICY "compliance_log_select_all" ON public.compliance_log FOR SELECT USING (true);
