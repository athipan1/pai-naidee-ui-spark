-- MANUAL RELEASE MIGRATION. Never executed by API startup.
-- Run only after approved backup/preflight/release; additive, no place deletion.
CREATE TABLE IF NOT EXISTS province_review_boundaries (
  province TEXT PRIMARY KEY,
  iso_code TEXT NOT NULL UNIQUE,
  geometry JSONB NOT NULL,
  source_url TEXT NOT NULL,
  license_name TEXT NOT NULL,
  reviewed_by TEXT NOT NULL REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS place_reviews (
  draft_id TEXT PRIMARY KEY REFERENCES place_drafts(id),
  state TEXT NOT NULL DEFAULT 'STAGED' CHECK (state IN
    ('DISCOVERED','STAGED','VERIFIED','REVIEW_PENDING','APPROVED','PUBLISHED','POSSIBLE_DUPLICATE','LICENSE_HOLD','COORDINATE_HOLD','REJECTED')),
  evidence JSONB NOT NULL DEFAULT '{}',
  payload_hash TEXT NOT NULL,
  media_probe JSONB,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision>0),
  reviewed_by TEXT REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS place_review_events (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL REFERENCES place_drafts(id),
  actor_id TEXT NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  evidence JSONB NOT NULL,
  payload_hash TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_place_review_events_draft ON place_review_events(draft_id,created_at);
CREATE INDEX IF NOT EXISTS idx_place_reviews_queue ON place_reviews(state,updated_at);
CREATE INDEX IF NOT EXISTS idx_place_drafts_province_review ON place_drafts((payload->>'province'));
CREATE OR REPLACE FUNCTION reject_place_review_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Review events are append-only'; END; $$;
DROP TRIGGER IF EXISTS place_review_events_append_only ON place_review_events;
CREATE TRIGGER place_review_events_append_only BEFORE UPDATE OR DELETE ON place_review_events
  FOR EACH ROW EXECUTE FUNCTION reject_place_review_event_mutation();
CREATE TABLE IF NOT EXISTS place_external_ids (
  namespace TEXT NOT NULL,
  external_id TEXT NOT NULL,
  place_id TEXT NOT NULL REFERENCES places(id),
  reviewed_by TEXT NOT NULL REFERENCES admin_users(id),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(namespace,external_id)
);
CREATE INDEX IF NOT EXISTS idx_place_external_ids_place ON place_external_ids(place_id);
CREATE TABLE IF NOT EXISTS place_publication_details (
  place_id TEXT PRIMARY KEY REFERENCES places(id),
  evidence JSONB NOT NULL,
  reviewed_by TEXT NOT NULL REFERENCES admin_users(id),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS province_import_jobs (
  id TEXT PRIMARY KEY,
  province TEXT NOT NULL,
  request_key TEXT NOT NULL UNIQUE,
  input_hash TEXT NOT NULL,
  candidate_count INTEGER NOT NULL CHECK(candidate_count BETWEEN 1 AND 20),
  next_index INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'STAGED' CHECK(state IN ('STAGED','RUNNING','REVIEW_PENDING','FAILED')),
  result JSONB NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS province_import_candidates (
  job_id TEXT NOT NULL REFERENCES province_import_jobs(id),
  ordinal INTEGER NOT NULL CHECK(ordinal>=0),
  draft_id TEXT NOT NULL UNIQUE REFERENCES place_drafts(id),
  PRIMARY KEY(job_id,ordinal)
);
