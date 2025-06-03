-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2025 at 03:58 PM
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
(1, 'Basic ', 150, 30),
(2, 'Standard', 250, 30),
(3, 'Premium ', 400, 30);

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
(1, 'shahafD', 'shahaf1', 'Shahaf', 'David', '1998-05-11', 'shahafD@gmail.com', '0508105452', 'M'),
(2, 'noyZ', 'noy1', 'Noy', 'Zaken', '2002-03-31', 'noyZ@gmail.com', '0528081231', 'F'),
(3, 'dekelD', 'dekel1', 'Dekel', 'David', '2001-02-27', 'dekelD@gmail.com', '0546596539', 'F'),
(4, 'romiD', 'romi1', 'Romi', 'David', '2005-04-01', 'romiD@gmail.com', '0549308595', 'F'),
(5, 'orD', 'or1', 'Or', 'David', '1998-05-18', 'orD@gmail.com', '0528080759', 'M');

-- --------------------------------------------------------

--
-- Table structure for table `user_workout`
--

CREATE TABLE `user_workout` (
  `user_id` int(11) NOT NULL,
  `workout_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_workout`
--

INSERT INTO `user_workout` (`user_id`, `workout_id`) VALUES
(1, 101),
(1, 104),
(2, 101),
(5, 104);

-- --------------------------------------------------------

--
-- Table structure for table `workout`
--

CREATE TABLE `workout` (
  `workout_id` int(11) NOT NULL,
  `workout_date` date NOT NULL,
  `workout_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout`
--

INSERT INTO `workout` (`workout_id`, `workout_date`, `workout_time`) VALUES
(101, '2025-05-21', '10:00:00'),
(102, '2025-05-21', '11:00:00'),
(103, '2025-05-21', '18:00:00'),
(104, '2025-05-22', '10:00:00'),
(105, '2025-05-22', '18:00:00'),
(106, '2025-05-24', '10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `workout_exercises`
--

CREATE TABLE `workout_exercises` (
  `workout_id` int(11) NOT NULL,
  `exercise_name` varchar(50) NOT NULL,
  `repetitions` int(11) NOT NULL,
  `duration_seconds` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout_exercises`
--

INSERT INTO `workout_exercises` (`workout_id`, `exercise_name`, `repetitions`, `duration_seconds`) VALUES
(101, 'Muscle Up', 5, 25),
(101, 'Pull Up', 10, 30),
(104, 'Back Lever', 2, 10),
(104, 'Front Lever', 2, 5),
(106, 'Jump Squat', 10, 20),
(106, 'Squat', 20, 40);

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
-- Indexes for table `user_workout`
--
ALTER TABLE `user_workout`
  ADD PRIMARY KEY (`user_id`,`workout_id`),
  ADD KEY `workout_id` (`workout_id`);

--
-- Indexes for table `workout`
--
ALTER TABLE `workout`
  ADD PRIMARY KEY (`workout_id`);

--
-- Indexes for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  ADD PRIMARY KEY (`workout_id`,`exercise_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `workout`
--
ALTER TABLE `workout`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_workout`
--
ALTER TABLE `user_workout`
  ADD CONSTRAINT `user_workout_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_workout_ibfk_2` FOREIGN KEY (`workout_id`) REFERENCES `workout` (`workout_id`) ON DELETE CASCADE;

--
-- Constraints for table `workout_exercises`
--
ALTER TABLE `workout_exercises`
  ADD CONSTRAINT `workout_exercises_ibfk_1` FOREIGN KEY (`workout_id`) REFERENCES `workout` (`workout_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
