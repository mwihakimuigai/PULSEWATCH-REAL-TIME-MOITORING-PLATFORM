CREATE DATABASE IF NOT EXISTS pulsewatch;
USE pulsewatch;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
);

CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('error', 'info', 'warning') NOT NULL,
  message VARCHAR(500) NOT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  source ENUM('system', 'user') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_created_at (created_at),
  INDEX idx_events_type_created_at (type, created_at),
  INDEX idx_events_severity_created_at (severity, created_at),
  INDEX idx_events_source_created_at (source, created_at)
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  trigger_type ENUM('high_severity_threshold') NOT NULL,
  status ENUM('resolved', 'unresolved') NOT NULL DEFAULT 'unresolved',
  resolved_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alert_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_alerts_created_at (created_at),
  INDEX idx_alerts_event_id (event_id),
  INDEX idx_alerts_status (status)
);
