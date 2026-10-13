CREATE INDEX ipas_attempts_owner_question ON ipas_attempts(owner_id,question_id,created_at DESC,ordinal DESC);
