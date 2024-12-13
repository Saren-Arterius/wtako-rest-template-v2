// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.



export interface Tables {
  "article": Article,
  "comment": Comment,
  "config": Config,
  "knex_migrations": KnexMigrations,
  "knex_migrations_lock": KnexMigrationsLock,
  "profile": Profile,
}

export interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string | null;
  content: string;
  side: string | null;
  location: unknown;
  created_at: string;
}

export interface Config {
  key: string;
  value: string | null;
}

export interface KnexMigrations {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
}

export interface KnexMigrationsLock {
  index: number;
  is_locked: number | null;
}

export interface Profile {
  id: string;
  username: string;
  name: string;
  description: string | null;
  created_at: string;
  details: Record<string, unknown>;
}

