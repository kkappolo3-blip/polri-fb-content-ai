CREATE TABLE public.ai_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ai usage log"
ON public.ai_usage_log FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert ai usage log"
ON public.ai_usage_log FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_ai_usage_log_created_at ON public.ai_usage_log (created_at DESC);