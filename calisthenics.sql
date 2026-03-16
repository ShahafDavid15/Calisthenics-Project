-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2026 at 09:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
(2, 'admin', '$2b$10$7PFo9B8SXHUfpxi2nDQd1OPaJB3mjlZBajgHBqwgmmaJPQf5A9Mkq', NULL, NULL, NULL, NULL, NULL, NULL, 'user', '2025-12-30 19:38:19'),
(3, 'shahaf', '$2b$10$/q/.grQFenOqeoM3.fi5IOXrxwA2F81Ujc3nzKaj2pC9EHM5emLRy', 'שחף', 'דוד', '0508105452', 'shahaf.david11@gmail.com', '1998-05-11', '', 'user', '2025-12-30 19:52:26'),
(4, 'noy', '$2b$10$hmbW8QcEs3q27Sr5z01dV.h4R5.GH7NYupM2Ax/0ds7G9YZy4RRP.', 'נוי', 'זקן', '0528081231', 'noyzaken87@gmail.com', '2001-03-31', '', 'user', '2025-12-30 19:55:27'),
(6, 'dekel', '$2b$10$wXPGAG0NYJypxUx.TgXq9.B4L55ZitBFOnewfC3QieGmF77M0Ltr2', 'דקל', 'דוד', '0521123123', 'ajpsus1595@gmail.com', '2001-02-27', '', 'user', '2026-03-09 12:34:48'),
(7, 'romi', '$2b$10$JBNQOiFa9Oa.0V24rfAoZOMnB2UYh0Q6ApfAGkQohG08/sAlm8BHW', 'רומי', 'דוד', '0541231231', 'dekeldd159@gmail.com', '2005-04-01', '', 'user', '2026-03-09 12:58:59');

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
(2, 3, 2, '2025-12-30', '2026-01-29', '30H72336KP335602H', 'JEFCN6D7RLMSQ', '2025-12-30 19:53:33'),
(3, 4, 1, '2025-12-30', '2026-01-29', '0N839845J1806342H', 'JEFCN6D7RLMSQ', '2025-12-30 19:58:19'),
(6, 3, 3, '2026-03-09', '2026-04-08', '91M00287GJ1549649', 'JEFCN6D7RLMSQ', '2026-03-09 12:16:58'),
(7, 4, 2, '2026-03-09', '2026-04-08', '9VV30925M8455533D', 'JEFCN6D7RLMSQ', '2026-03-09 12:20:08'),
(8, 6, 1, '2026-03-09', '2026-04-08', '4JL58924M4531121V', 'JEFCN6D7RLMSQ', '2026-03-09 12:35:56'),
(10, 7, 1, '2026-03-11', '2026-04-10', '52K4564634011484S', 'JEFCN6D7RLMSQ', '2026-03-11 20:31:57');

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
(5, 3, '2026-01-01', '18:00:00', '2025-12-30 19:53:52'),
(6, 3, '2026-01-02', '12:00:00', '2025-12-30 19:53:59'),
(7, 4, '2026-01-01', '19:00:00', '2025-12-30 19:59:27'),
(9, 3, '2026-02-27', '10:00:00', '2026-02-26 10:28:08'),
(10, 3, '2026-02-26', '19:00:00', '2026-02-26 10:28:19'),
(11, 3, '2026-03-09', '18:00:00', '2026-03-09 12:05:55'),
(12, 3, '2026-03-10', '19:00:00', '2026-03-09 12:05:56'),
(13, 3, '2026-03-12', '18:00:00', '2026-03-09 12:05:59'),
(14, 4, '2026-03-10', '20:00:00', '2026-03-09 12:20:24'),
(15, 4, '2026-03-12', '19:00:00', '2026-03-09 12:20:32'),
(16, 6, '2026-03-12', '19:00:00', '2026-03-09 12:36:37'),
(17, 7, '2026-03-10', '19:00:00', '2026-03-09 12:59:30'),
(18, 7, '2026-03-09', '19:00:00', '2026-03-09 12:59:37');

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
(23, '2026-01-05', '20:00:00'),
(24, '2026-02-26', '17:00:00'),
(25, '2026-02-26', '18:00:00'),
(26, '2026-02-26', '19:00:00'),
(27, '2026-02-26', '20:00:00'),
(47, '2026-02-27', '09:00:00'),
(28, '2026-02-27', '10:00:00'),
(29, '2026-02-27', '11:00:00'),
(30, '2026-02-27', '12:00:00'),
(31, '2026-03-01', '17:00:00'),
(32, '2026-03-01', '18:00:00'),
(33, '2026-03-01', '19:00:00'),
(34, '2026-03-01', '20:00:00'),
(35, '2026-03-02', '17:00:00'),
(36, '2026-03-02', '18:00:00'),
(37, '2026-03-02', '19:00:00'),
(38, '2026-03-02', '20:00:00'),
(39, '2026-03-03', '17:00:00'),
(40, '2026-03-03', '18:00:00'),
(41, '2026-03-03', '19:00:00'),
(42, '2026-03-03', '20:00:00'),
(43, '2026-03-04', '17:00:00'),
(44, '2026-03-04', '18:00:00'),
(45, '2026-03-04', '19:00:00'),
(46, '2026-03-04', '20:00:00'),
(48, '2026-03-09', '17:00:00'),
(49, '2026-03-09', '18:00:00'),
(50, '2026-03-09', '19:00:00'),
(51, '2026-03-09', '20:00:00'),
(52, '2026-03-10', '17:00:00'),
(53, '2026-03-10', '18:00:00'),
(54, '2026-03-10', '19:00:00'),
(55, '2026-03-10', '20:00:00'),
(56, '2026-03-11', '17:00:00'),
(57, '2026-03-11', '18:00:00'),
(58, '2026-03-11', '19:00:00'),
(59, '2026-03-11', '20:00:00'),
(60, '2026-03-12', '17:00:00'),
(61, '2026-03-12', '18:00:00'),
(62, '2026-03-12', '19:00:00'),
(63, '2026-03-12', '20:00:00'),
(64, '2026-03-13', '10:00:00'),
(65, '2026-03-13', '11:00:00'),
(66, '2026-03-13', '12:00:00'),
(67, '2026-03-15', '17:00:00'),
(68, '2026-03-15', '18:00:00'),
(69, '2026-03-15', '19:00:00'),
(70, '2026-03-15', '20:00:00'),
(71, '2026-03-16', '17:00:00'),
(72, '2026-03-16', '18:00:00'),
(73, '2026-03-16', '19:00:00'),
(74, '2026-03-16', '20:00:00'),
(75, '2026-03-17', '17:00:00'),
(76, '2026-03-17', '18:00:00'),
(77, '2026-03-17', '19:00:00'),
(78, '2026-03-17', '20:00:00');

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
(30, 3, 'לאנג\' בולגרי', 5, '2025-12-30', '2025-12-30 20:01:29'),
(31, 3, 'עליות כוח', 10, '2026-02-26', '2026-02-26 10:29:11'),
(32, 3, 'שכיבות שמיכה', 20, '2026-02-26', '2026-02-26 10:29:16'),
(33, 3, 'מתח', 30, '2026-02-26', '2026-02-26 10:29:21'),
(34, 3, 'כפיפות בטן', 15, '2026-02-26', '2026-02-26 10:29:26'),
(35, 6, 'מתח', 2, '2026-03-09', '2026-03-09 12:37:15'),
(36, 6, 'שכיבות שמיכה', 4, '2026-03-09', '2026-03-09 12:37:21'),
(37, 6, 'סקוואטים', 12, '2026-03-09', '2026-03-09 12:37:24'),
(38, 6, 'לאנג\' בולגרי', 5, '2026-03-09', '2026-03-09 12:37:28'),
(39, 3, 'עליות כוח', 15, '2026-03-11', '2026-03-11 20:28:53'),
(40, 3, 'מתח', 17, '2026-03-11', '2026-03-11 20:29:00'),
(41, 3, 'כפיפות בטן', 30, '2026-03-11', '2026-03-11 20:29:04'),
(42, 3, 'סקוואטים', 12, '2026-03-11', '2026-03-11 20:29:09'),
(43, 7, 'שכיבות שמיכה', 5, '2026-03-10', '2026-03-11 20:32:33'),
(44, 7, 'סקוואטים', 15, '2026-03-10', '2026-03-11 20:32:37'),
(45, 7, 'ג\'אמפ סקוואט', 10, '2026-03-10', '2026-03-11 20:32:43');

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
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_membership`
--
ALTER TABLE `user_membership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_workouts`
--
ALTER TABLE `user_workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
