-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2025 at 05:15 PM
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
  `name` varchar(50) NOT NULL,
  `price` int(11) NOT NULL,
  `duration_days` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`membership_id`, `name`, `price`, `duration_days`) VALUES
(2, 'Standard', 250, 30),
(3, 'Premium', 400, 30),
(6, 'Basic ', 150, 30);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `birth_date` date NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `gender` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `first_name`, `last_name`, `birth_date`, `email`, `phone`, `gender`) VALUES
(1, 'shahafD', 'shahaf1', 'שחף', 'דוד', '1998-05-11', 'shahafD@gmail.com', '0508105452', 'זכר'),
(2, 'noyZ', 'noy1', 'נוי', 'זקן', '2002-03-31', 'noyZ@gmail.com', '0528081231', 'נקבה'),
(3, 'dekelD', 'dekel1', 'דקל', 'דוד', '2001-02-27', 'dekelD@gmail.com', '0546596539', 'נקבה'),
(4, 'romiD', 'romi1', 'רומי', 'דוד', '2005-04-01', 'romiD@gmail.com', '0549308595', 'נקבה'),
(5, 'orD', 'or1', 'אור', 'דוד', '1998-05-18', 'orD@gmail.com', '0528080759', 'זכר'),
(17, 'admin', 'admin1', 'admin', 'admin', '1998-05-11', 'admyn159@gmail.com', '0508105452', 'זכר');

-- --------------------------------------------------------

--
-- Table structure for table `user_membership`
--

CREATE TABLE `user_membership` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `membership_id` int(11) NOT NULL,
  `start_date` date NOT NULL DEFAULT curdate(),
  `end_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(2, '2025-08-04', '17:00:00'),
(3, '2025-08-04', '18:00:00'),
(4, '2025-08-04', '19:00:00'),
(5, '2025-08-04', '20:00:00'),
(6, '2025-08-05', '17:00:00'),
(7, '2025-08-05', '19:00:00'),
(8, '2025-08-05', '20:00:00'),
(9, '2025-08-06', '17:00:00'),
(10, '2025-08-06', '18:00:00'),
(11, '2025-08-06', '19:00:00'),
(12, '2025-08-06', '20:00:00'),
(13, '2025-08-07', '17:00:00'),
(14, '2025-08-07', '18:00:00'),
(15, '2025-08-07', '19:00:00'),
(16, '2025-08-07', '20:00:00'),
(17, '2025-08-08', '10:00:00'),
(18, '2025-08-08', '11:00:00'),
(19, '2025-08-08', '12:00:00'),
(20, '2025-08-10', '17:00:00'),
(21, '2025-08-10', '18:00:00'),
(22, '2025-08-10', '19:00:00'),
(23, '2025-08-10', '20:00:00'),
(24, '2025-08-05', '18:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `workout_exercises`
--

CREATE TABLE `workout_exercises` (
  `id` int(11) NOT NULL,
  `exercise` varchar(50) NOT NULL,
  `repetitions` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`membership_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_membership`
--
ALTER TABLE `user_membership`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_active_membership` (`user_id`,`membership_id`,`start_date`),
  ADD KEY `membership_id` (`membership_id`);

--
-- Indexes for table `user_workouts`
--
ALTER TABLE `user_workouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking` (`user_id`,`workout_date`,`workout_time`),
  ADD UNIQUE KEY `unique_user_workout` (`user_id`,`workout_date`,`workout_time`);

--
-- Indexes for table `workouts`
--
ALTER TABLE `workouts`
  ADD PRIMARY KEY (`workout_id`);

--
-- Indexes for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `user_membership`
--
ALTER TABLE `user_membership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_workouts`
--
ALTER TABLE `user_workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
