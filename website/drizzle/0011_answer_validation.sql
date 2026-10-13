CREATE TRIGGER ipas_validate_answer BEFORE INSERT ON ipas_attempts
WHEN (SELECT phase FROM ipas_storage_control WHERE id=1) NOT IN ('copying','restoring')
BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM ipas_sessions WHERE id=NEW.session_id AND owner_id=NEW.owner_id) THEN RAISE(ABORT,'SESSION_NOT_FOUND') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM ipas_sessions s,json_each(s.question_ids) q WHERE s.id=NEW.session_id AND q.value=NEW.question_id) THEN RAISE(ABORT,'QUESTION_NOT_IN_SESSION') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM ipas_attempts WHERE session_id=NEW.session_id AND question_id=NEW.question_id AND choice<>NEW.choice) THEN RAISE(ABORT,'ANSWER_CONFLICT') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM ipas_attempts WHERE session_id=NEW.session_id AND question_id=NEW.question_id AND choice=NEW.choice) THEN RAISE(IGNORE) END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM ipas_sessions WHERE id=NEW.session_id AND completed=1 AND mode<>'import') THEN RAISE(ABORT,'SESSION_COMPLETED') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM ipas_questions WHERE id=NEW.question_id) THEN RAISE(ABORT,'CATALOG_NOT_READY') END;
 SELECT CASE WHEN NEW.correct<>(SELECT json_extract(body,'$.answer')=NEW.choice FROM ipas_questions WHERE id=NEW.question_id) THEN RAISE(ABORT,'INVALID_CHOICE') END;
END;
