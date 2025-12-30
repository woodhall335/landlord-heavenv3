-- =============================================================================
-- LANDLORD HEAVEN - SEO AUTOMATION
-- =============================================================================
-- Migration 007: SEO content generation, keywords, and performance tracking
-- =============================================================================

-- =============================================================================
-- 1. SEO_PAGES TABLE
-- =============================================================================
CREATE TABLE public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page identification
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,

  -- Page content
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'location', -- 'location', 'topic', 'service', 'guide'

  -- SEO metadata
  target_keyword TEXT NOT NULL,
  secondary_keywords TEXT[] DEFAULT '{}',
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 0, -- 0-100

  -- Location targeting
  location TEXT,
  region TEXT,
  jurisdiction TEXT,

  -- Content quality
  word_count INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  ai_quality_score INTEGER DEFAULT 0, -- 0-100

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,

  -- Performance tracking
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,
  conversions INTEGER DEFAULT 0,

  -- Search rankings
  current_rank INTEGER,
  best_rank INTEGER,
  rank_history JSONB DEFAULT '[]',

  -- Linking
  internal_links TEXT[] DEFAULT '{}',
  backlinks_count INTEGER DEFAULT 0,

  -- Schema.org
  schema_markup JSONB,

  -- Automation
  auto_refresh BOOLEAN DEFAULT true,
  last_generated_by TEXT,
  generation_prompt TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Public read for published pages
CREATE POLICY "Anyone can view published seo_pages"
  ON public.seo_pages FOR SELECT
  USING (status = 'published');

-- Service role for management
CREATE POLICY "Service role manages seo_pages"
  ON public.seo_pages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_seo_pages_slug ON public.seo_pages(slug);
CREATE INDEX idx_seo_pages_status ON public.seo_pages(status);
CREATE INDEX idx_seo_pages_location ON public.seo_pages(location);
CREATE INDEX idx_seo_pages_keyword ON public.seo_pages(target_keyword);
CREATE INDEX idx_seo_pages_published ON public.seo_pages(published_at);

-- Trigger
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. SEO_KEYWORDS TABLE
-- =============================================================================
CREATE TABLE public.seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Keyword data
  keyword TEXT NOT NULL UNIQUE,
  search_volume INTEGER DEFAULT 0,
  difficulty INTEGER DEFAULT 0, -- 0-100
  cpc DECIMAL(10,2) DEFAULT 0.00,

  -- Categorization
  intent TEXT, -- 'informational', 'navigational', 'transactional'
  category TEXT, -- 'eviction', 'tenancy', 'hmo'
  jurisdiction TEXT,
  location TEXT,

  -- Competition
  serp_features TEXT[] DEFAULT '{}',
  top_ranking_domains TEXT[] DEFAULT '{}',
  content_gaps TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'identified', -- 'identified', 'targeted', 'ranked'
  priority INTEGER DEFAULT 0, -- 1-10
  assigned_page_id UUID REFERENCES public.seo_pages(id),

  -- Performance
  current_rank INTEGER,
  rank_history JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages seo_keywords"
  ON public.seo_keywords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_seo_keywords_keyword ON public.seo_keywords(keyword);
CREATE INDEX idx_seo_keywords_status ON public.seo_keywords(status);
CREATE INDEX idx_seo_keywords_priority ON public.seo_keywords(priority DESC);

-- Trigger
CREATE TRIGGER update_seo_keywords_updated_at
  BEFORE UPDATE ON public.seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. SEO_CONTENT_QUEUE TABLE
-- =============================================================================
CREATE TABLE public.seo_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content specification
  content_type TEXT NOT NULL, -- 'location_page', 'topic_page', 'guide', 'refresh'
  target_keyword TEXT NOT NULL,
  page_slug TEXT,
  page_id UUID REFERENCES public.seo_pages(id),

  -- Generation parameters
  location TEXT,
  jurisdiction TEXT,
  word_count_target INTEGER DEFAULT 1500,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  generation_prompt TEXT,

  -- Queue management
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 5, -- 1-10
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),

  -- Execution tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processing_time INTEGER, -- seconds

  -- Results
  generated_content TEXT,
  quality_score INTEGER,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.seo_content_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages seo_content_queue"
  ON public.seo_content_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_seo_content_queue_status ON public.seo_content_queue(status);
CREATE INDEX idx_seo_content_queue_scheduled ON public.seo_content_queue(scheduled_for);
CREATE INDEX idx_seo_content_queue_priority ON public.seo_content_queue(priority DESC);

-- Trigger
CREATE TRIGGER update_seo_content_queue_updated_at
  BEFORE UPDATE ON public.seo_content_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. SEO_AUTOMATION_LOG TABLE
-- =============================================================================
CREATE TABLE public.seo_automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task identification
  task_type TEXT NOT NULL,
  task_name TEXT NOT NULL,

  -- Execution details
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration INTEGER, -- seconds

  -- Results
  items_processed INTEGER DEFAULT 0,
  items_successful INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,

  -- Details
  summary TEXT,
  error_message TEXT,
  metadata JSONB,

  -- Scheduling
  scheduled_time TIMESTAMPTZ,
  triggered_by TEXT, -- 'cron', 'manual', 'api'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.seo_automation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages seo_automation_log"
  ON public.seo_automation_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_seo_automation_log_task ON public.seo_automation_log(task_type);
CREATE INDEX idx_seo_automation_log_status ON public.seo_automation_log(status);
CREATE INDEX idx_seo_automation_log_date ON public.seo_automation_log(created_at DESC);

-- =============================================================================
-- MIGRATION 007 COMPLETE
-- =============================================================================
