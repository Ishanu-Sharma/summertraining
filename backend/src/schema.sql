-- THE QUAD — Database Schema (MariaDB / MySQL)
-- Run once against your database. Safe to re-run (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
  id                 VARCHAR(64) PRIMARY KEY,
  full_name          VARCHAR(150) NOT NULL,
  email              VARCHAR(190) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  role               ENUM('student','alumni','admin') NOT NULL DEFAULT 'alumni',
  verified           TINYINT(1) NOT NULL DEFAULT 0,
  deactivated        TINYINT(1) NOT NULL DEFAULT 0,
  grad_year          INT NULL,
  department         VARCHAR(120) NULL,
  industry           VARCHAR(120) NULL,
  location           VARCHAR(150) NULL,
  headline           VARCHAR(200) NULL,
  bio                TEXT NULL,
  company            VARCHAR(150) NULL,
  job_title          VARCHAR(150) NULL,
  linkedin           VARCHAR(255) NULL,
  website            VARCHAR(255) NULL,
  avatar             VARCHAR(500) NULL,
  skills             JSON NULL,
  privacy            JSON NULL,
  notifications      JSON NULL,
  reset_token_hash   VARCHAR(64) NULL,
  reset_token_expires DATETIME NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_grad_year (grad_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS experiences (
  id          VARCHAR(64) PRIMARY KEY,
  user_id     VARCHAR(64) NOT NULL,
  title       VARCHAR(150) NOT NULL,
  company     VARCHAR(150) NOT NULL,
  period      VARCHAR(100) NULL,
  location    VARCHAR(150) NULL,
  description TEXT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS education (
  id          VARCHAR(64) PRIMARY KEY,
  user_id     VARCHAR(64) NOT NULL,
  degree      VARCHAR(150) NOT NULL,
  school      VARCHAR(150) NOT NULL,
  period      VARCHAR(100) NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS connections (
  id         VARCHAR(64) PRIMARY KEY,
  user_a     VARCHAR(64) NOT NULL,
  user_b     VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pair (user_a, user_b),
  FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS events (
  id          VARCHAR(64) PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT NULL,
  date        DATE NOT NULL,
  time        VARCHAR(100) NULL,
  location    VARCHAR(200) NULL,
  type        ENUM('in-person','online') NOT NULL DEFAULT 'in-person',
  cohort      VARCHAR(150) NULL,
  featured    TINYINT(1) NOT NULL DEFAULT 0,
  created_by  VARCHAR(64) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_agenda (
  id         VARCHAR(64) PRIMARY KEY,
  event_id   VARCHAR(64) NOT NULL,
  time       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  note       VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_hosts (
  id       VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  user_id  VARCHAR(64) NOT NULL,
  label    VARCHAR(150) NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_rsvps (
  id         VARCHAR(64) PRIMARY KEY,
  event_id   VARCHAR(64) NOT NULL,
  user_id    VARCHAR(64) NOT NULL,
  status     ENUM('going','interested','not-going') NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_rsvp (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_comments (
  id         VARCHAR(64) PRIMARY KEY,
  event_id   VARCHAR(64) NOT NULL,
  user_id    VARCHAR(64) NOT NULL,
  text       TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jobs (
  id             VARCHAR(64) PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  company        VARCHAR(150) NOT NULL,
  location       VARCHAR(150) NOT NULL,
  type           VARCHAR(50) NOT NULL,
  experience     VARCHAR(50) NULL,
  salary         VARCHAR(100) NULL,
  description    TEXT NOT NULL,
  apply_link     VARCHAR(255) NOT NULL,
  referral_note  TEXT NULL,
  posted_by      VARCHAR(64) NOT NULL,
  status         ENUM('pending','approved') NOT NULL DEFAULT 'pending',
  posted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_jobs (
  id      VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  job_id  VARCHAR(64) NOT NULL,
  UNIQUE KEY uniq_save (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS applied_jobs (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL,
  job_id     VARCHAR(64) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_apply (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id         VARCHAR(64) PRIMARY KEY,
  author_id  VARCHAR(64) NOT NULL,
  text       TEXT NOT NULL,
  tag        VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_likes (
  id      VARCHAR(64) PRIMARY KEY,
  post_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  UNIQUE KEY uniq_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_replies (
  id         VARCHAR(64) PRIMARY KEY,
  post_id    VARCHAR(64) NOT NULL,
  user_id    VARCHAR(64) NOT NULL,
  text       TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversations (
  id         VARCHAR(64) PRIMARY KEY,
  user_a     VARCHAR(64) NOT NULL,
  user_b     VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_conv_pair (user_a, user_b),
  INDEX idx_conv_user_b (user_b),
  FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_reads (
  conversation_id VARCHAR(64) NOT NULL,
  user_id         VARCHAR(64) NOT NULL,
  last_read_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
  id              VARCHAR(64) PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL,
  sender_id       VARCHAR(64) NOT NULL,
  text            TEXT NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_msg_conv (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  id                          INT PRIMARY KEY DEFAULT 1,
  platform_name               VARCHAR(150) NOT NULL DEFAULT 'The Quad',
  support_email                VARCHAR(190) NOT NULL DEFAULT 'alumni@adtu.in',
  require_university_email     TINYINT(1) NOT NULL DEFAULT 1,
  auto_approve_jobs            TINYINT(1) NOT NULL DEFAULT 0,
  allow_student_directory_view TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (id) VALUES (1);
