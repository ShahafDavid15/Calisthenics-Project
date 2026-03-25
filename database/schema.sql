-- ============================================================
--  Calisthenics Project – Database Schema
--  MySQL / MariaDB
--
--  Setup:
--    1. mysql -u root -p < database/schema.sql
--    2. Then create an admin user (see bottom of this file)
-- ============================================================

CREATE DATABASE IF NOT EXISTS calisthenics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE calisthenics;

-- --------------------------------------------------------
-- membership
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership` (
  `membership_id` int(11) NOT NULL AUTO_INCREMENT,
  `name`          varchar(255) NOT NULL,
  `price`         decimal(10,2) NOT NULL,
  `price_with_vat` decimal(10,2) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `entry_count`   int(11) DEFAULT 0,
  `created_at`    timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `user_id`    int(11) NOT NULL AUTO_INCREMENT,
  `username`   varchar(255) NOT NULL,
  `password`   varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name`  varchar(255) DEFAULT NULL,
  `phone`      varchar(50) DEFAULT NULL,
  `email`      varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender`     enum('male','female','other') DEFAULT NULL,
  `role`       enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- workouts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workouts` (
  `workout_id`   int(11) NOT NULL AUTO_INCREMENT,
  `workout_date` date NOT NULL,
  `workout_time` time NOT NULL,
  PRIMARY KEY (`workout_id`),
  UNIQUE KEY `unique_workout_date_time` (`workout_date`,`workout_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- user_membership
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_membership` (
  `id`             int(11) NOT NULL AUTO_INCREMENT,
  `user_id`        int(11) NOT NULL,
  `membership_id`  int(11) NOT NULL,
  `start_date`     date NOT NULL,
  `end_date`       date NOT NULL,
  `paypal_order_id` varchar(255) DEFAULT NULL,
  `payer_id`       varchar(255) DEFAULT NULL,
  `created_at`     timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `membership_id` (`membership_id`),
  CONSTRAINT `user_membership_ibfk_1` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_membership_ibfk_2` FOREIGN KEY (`membership_id`)
    REFERENCES `membership` (`membership_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- user_workouts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_workouts` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `user_id`      int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `workout_time` time NOT NULL,
  `created_at`   timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_slot` (`user_id`,`workout_date`,`workout_time`),
  CONSTRAINT `user_workouts_ibfk_1` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- workout_exercises
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workout_exercises` (
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `user_id`      int(11) NOT NULL,
  `exercise`     varchar(255) NOT NULL,
  `repetitions`  int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `created_at`   timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `workout_exercises_ibfk_1` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
--  Demo Data
-- ============================================================

-- Membership plans (prices before VAT, price_with_vat = price * 1.18)
INSERT IGNORE INTO `membership` (`name`, `price`, `price_with_vat`, `duration_days`, `entry_count`) VALUES
  ('Basic',    127.12, 150.00, 30, 1),
  ('Standard', 211.87, 250.00, 30, 2),
  ('Premium',  338.98, 400.00, 30, 3);

-- Workout slots are NOT seeded here (old demo used evening hours on every day, which was wrong for Fridays).
-- The backend seeds the next 7 days on startup via utils/seedWorkouts.js:
--   Mon–Fri (excl. Sat): 17:00–20:00; Friday only: 10:00, 11:00, 12:00.


-- ============================================================
--  Admin User Setup
--
--  Run this Node.js snippet to generate a bcrypt hash:
--
--    node -e "require('bcrypt').hash('YourPassword123', 10, (e,h) => console.log(h))"
--
--  Then insert the admin user:
--
--    INSERT INTO users (username, password, role)
--    VALUES ('admin', '<paste_hash_here>', 'admin');
--
--  Or run the helper script:
--    node database/create-admin.js
-- ============================================================
