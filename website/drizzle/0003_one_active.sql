CREATE UNIQUE INDEX ipas_one_active ON ipas_sessions(owner_id) WHERE completed=0;
