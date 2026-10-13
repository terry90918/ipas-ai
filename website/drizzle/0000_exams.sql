CREATE TABLE ipas_exams (id TEXT PRIMARY KEY, body TEXT NOT NULL CHECK(json_valid(body)));
