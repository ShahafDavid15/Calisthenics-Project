-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 30, 2025 at 09:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `calisthenics`
--

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `membership_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_with_vat` decimal(10,2) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `entry_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`membership_id`, `name`, `price`, `price_with_vat`, `duration_days`, `entry_count`, `created_at`) VALUES
(1, 'Basic ', 127.12, 150.00, 30, 1, '2025-12-30 19:39:07'),
(2, 'Standard', 211.87, 250.00, 30, 2, '2025-12-30 19:39:51'),
(3, 'Premium', 338.98, 400.00, 30, 3, '2025-12-30 19:40:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `first_name`, `last_name`, `phone`, `email`, `birth_date`, `gender`, `role`, `created_at`) VALUES
(1, 'leon', '$2b$10$Z0bm19.0aYqzR1d62oWTV.GSHBjY079M5Davpf1luGIgQ5NN5TMX.', 'לאון', 'דזבוייב', '0501234568', 'leondez159@gmail.com', '2000-02-17', '', 'user', '2025-12-30 19:32:51'),
(2, 'admin', '$2b$10$7PFo9B8SXHUfpxi2nDQd1OPaJB3mjlZBajgHBqwgmmaJPQf5A9Mkq', NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2025-12-30 19:38:19'),
(3, 'shahaf', '$2b$10$LKEdAPZhG.KRgruMAOW6u.7EKIctEa1B12i6su86n3rI29q/jZ.ue', 'שחף', 'דוד', '0508105452', 'shahaf.david11@gmail.com', '1998-05-11', '', 'user', '2025-12-30 19:52:26'),
(4, 'noy', '$2b$10$hmbW8QcEs3q27Sr5z01dV.h4R5.GH7NYupM2Ax/0ds7G9YZy4RRP.', 'נוי', 'זקן', '0528081231', 'noyzaken87@gmail.com', '2001-03-31', '', 'user', '2025-12-30 19:55:27');

-- --------------------------------------------------------

--
-- Table structure for table `user_membership`
--

CREATE TABLE `user_membership` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `membership_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `paypal_order_id` varchar(255) DEFAULT NULL,
  `payer_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_membership`
--

INSERT INTO `user_membership` (`id`, `user_id`, `membership_id`, `start_date`, `end_date`, `paypal_order_id`, `payer_id`, `created_at`) VALUES
(1, 1, 3, '2025-12-30', '2026-01-29', '70T766999J694314G', 'JEFCN6D7RLMSQ', '2025-12-30 19:45:55'),
(2, 3, 2, '2025-12-30', '2026-01-29', '30H72336KP335602H', 'JEFCN6D7RLMSQ', '2025-12-30 19:53:33'),
(3, 4, 1, '2025-12-30', '2026-01-29', '0N839845J1806342H', 'JEFCN6D7RLMSQ', '2025-12-30 19:58:19');

-- --------------------------------------------------------

--
-- Table structure for table `user_workouts`
--

CREATE TABLE `user_workouts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `workout_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_workouts`
--

INSERT INTO `user_workouts` (`id`, `user_id`, `workout_date`, `workout_time`, `created_at`) VALUES
(1, 1, '2025-12-31', '18:00:00', '2025-12-30 19:46:13'),
(2, 1, '2026-01-01', '18:00:00', '2025-12-30 19:46:15'),
(4, 1, '2026-01-02', '12:00:00', '2025-12-30 19:46:32'),
(5, 3, '2026-01-01', '18:00:00', '2025-12-30 19:53:52'),
(6, 3, '2026-01-02', '12:00:00', '2025-12-30 19:53:59'),
(7, 4, '2026-01-01', '19:00:00', '2025-12-30 19:59:27');

-- --------------------------------------------------------

--
-- Table structure for table `workouts`
--

CREATE TABLE `workouts` (
  `workout_id` int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `workout_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workouts`
--

INSERT INTO `workouts` (`workout_id`, `workout_date`, `workout_time`) VALUES
(1, '2025-12-30', '17:00:00'),
(2, '2025-12-30', '18:00:00'),
(3, '2025-12-30', '19:00:00'),
(4, '2025-12-30', '20:00:00'),
(5, '2025-12-31', '17:00:00'),
(6, '2025-12-31', '18:00:00'),
(7, '2025-12-31', '19:00:00'),
(8, '2025-12-31', '20:00:00'),
(9, '2026-01-01', '17:00:00'),
(10, '2026-01-01', '18:00:00'),
(11, '2026-01-01', '19:00:00'),
(12, '2026-01-01', '20:00:00'),
(13, '2026-01-02', '10:00:00'),
(14, '2026-01-02', '11:00:00'),
(15, '2026-01-02', '12:00:00'),
(16, '2026-01-04', '17:00:00'),
(17, '2026-01-04', '18:00:00'),
(18, '2026-01-04', '19:00:00'),
(19, '2026-01-04', '20:00:00'),
(20, '2026-01-05', '17:00:00'),
(21, '2026-01-05', '18:00:00'),
(22, '2026-01-05', '19:00:00'),
(23, '2026-01-05', '20:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `workout_exercises`
--

CREATE TABLE `workout_exercises` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exercise` varchar(255) NOT NULL,
  `repetitions` int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout_exercises`
--

INSERT INTO `workout_exercises` (`id`, `user_id`, `exercise`, `repetitions`, `workout_date`, `created_at`) VALUES
(1, 1, 'עליות כוח', 3, '2025-12-30', '2025-12-30 19:46:47'),
(2, 1, 'שכיבות שמיכה', 15, '2025-12-30', '2025-12-30 19:46:52'),
(3, 1, 'כפיפות בטן', 20, '2025-12-30', '2025-12-30 19:46:57'),
(4, 1, 'מתח', 5, '2025-12-30', '2025-12-30 19:47:03'),
(5, 1, 'סקוואטים', 10, '2025-12-23', '2025-12-30 19:47:14'),
(6, 1, 'דיפס', 10, '2025-12-23', '2025-12-30 19:47:22'),
(7, 1, 'עליות כוח', 1, '2025-12-21', '2025-12-30 19:47:49'),
(8, 1, 'מתח', 5, '2025-12-21', '2025-12-30 19:48:20'),
(9, 1, 'ג\'אמפ סקוואט', 5, '2025-12-21', '2025-12-30 19:48:25'),
(10, 1, 'לאנג\' בולגרי', 6, '2025-12-23', '2025-12-30 19:48:31'),
(11, 4, 'סקוואטים', 20, '2025-12-30', '2025-12-30 19:59:33'),
(12, 4, 'כפיפות בטן', 10, '2025-12-30', '2025-12-30 19:59:38'),
(13, 4, 'לאנג\' בולגרי', 20, '2025-12-30', '2025-12-30 19:59:42'),
(14, 4, 'ג\'אמפ סקוואט', 10, '2025-12-30', '2025-12-30 19:59:46'),
(15, 4, 'מתח', 2, '2025-12-30', '2025-12-30 19:59:52'),
(16, 4, 'סקוואטים', 12, '2025-12-23', '2025-12-30 19:59:57'),
(17, 4, 'ג\'אמפ סקוואט', 7, '2025-12-23', '2025-12-30 20:00:03'),
(18, 4, 'כפיפות בטן', 5, '2025-12-23', '2025-12-30 20:00:09'),
(19, 4, 'מתח', 1, '2025-12-23', '2025-12-30 20:00:14'),
(20, 3, 'עליות כוח', 5, '2025-12-23', '2025-12-30 20:00:40'),
(21, 3, 'מתח', 15, '2025-12-23', '2025-12-30 20:00:45'),
(22, 3, 'דיפס', 15, '2025-12-23', '2025-12-30 20:00:50'),
(23, 3, 'כפיפות בטן', 30, '2025-12-23', '2025-12-30 20:00:55'),
(24, 3, 'שכיבות שמיכה', 20, '2025-12-23', '2025-12-30 20:01:02'),
(25, 3, 'עליות כוח', 8, '2025-12-30', '2025-12-30 20:01:07'),
(26, 3, 'מתח', 20, '2025-12-30', '2025-12-30 20:01:11'),
(27, 3, 'שכיבות שמיכה', 30, '2025-12-30', '2025-12-30 20:01:15'),
(28, 3, 'כפיפות בטן', 30, '2025-12-30', '2025-12-30 20:01:20'),
(29, 3, 'ג\'אמפ סקוואט', 10, '2025-12-30', '2025-12-30 20:01:25'),
(30, 3, 'לאנג\' בולגרי', 5, '2025-12-30', '2025-12-30 20:01:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`membership_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_membership`
--
ALTER TABLE `user_membership`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `membership_id` (`membership_id`);

--
-- Indexes for table `user_workouts`
--
ALTER TABLE `user_workouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_slot` (`user_id`,`workout_date`,`workout_time`);

--
-- Indexes for table `workouts`
--
ALTER TABLE `workouts`
  ADD PRIMARY KEY (`workout_id`),
  ADD UNIQUE KEY `unique_workout_date_time` (`workout_date`,`workout_time`);

--
-- Indexes for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_membership`
--
ALTER TABLE `user_membership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_workouts`
--
ALTER TABLE `user_workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_membership`
--
ALTER TABLE `user_membership`
  ADD CONSTRAINT `user_membership_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_membership_ibfk_2` FOREIGN KEY (`membership_id`) REFERENCES `membership` (`membership_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_workouts`
--
ALTER TABLE `user_workouts`
  ADD CONSTRAINT `user_workouts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  ADD CONSTRAINT `workout_exercises_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
