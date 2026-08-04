-- Educational Videos Table
-- Doctors Vedika Backend Migration 0014

CREATE TABLE IF NOT EXISTS public.educational_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL DEFAULT 'youtube',
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'short')),
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration TEXT,
    views_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_platform_external_id UNIQUE (platform, external_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_educational_videos_published_at
ON public.educational_videos (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_educational_videos_content_type
ON public.educational_videos (content_type);

CREATE INDEX IF NOT EXISTS idx_educational_videos_is_active
ON public.educational_videos (is_active);