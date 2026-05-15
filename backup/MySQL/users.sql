-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+deb13u1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 13, 2026 at 10:10 PM
-- Server version: 11.8.6-MariaDB-0+deb13u1 from Debian
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fabsnet`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `twoFactor` tinyint(1) NOT NULL DEFAULT 0,
  `userData` longtext DEFAULT NULL,
  `last_login` bigint(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `last_seen` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `twoFactor`, `userData`, `last_login`, `profile_image`, `last_seen`) VALUES
(108, 'test1', 'test1@test.com', '$2b$12$6HOO9QZmDxkFTlXfbhmYq.3rsVrwNqzQ3d.ARDCy4Vqr9cbKjFCrq', 'user', 0, '{\"theme\": \"dark\", \"profileCompleted\": false, \"biometric_data\": {}, \"trainingsplan\": {\"firstTime\": true}, \"gripper\": {\"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 19, \"isCalibrated\": true}}', 20260429230657, NULL, NULL),
(122, 'Irgendwer', 'irgendwer@fabs-net.com', '$2b$12$FV9tL4/C.Gd4aR4MS40weOaTXPb58TYD1ZwX9bPLSWEBRO3mF5wHC', 'user', 0, '{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":true,\"isCalibrated\":false,\"gripper1\":{}}}', 20260430211418, NULL, NULL),
(132, 'tnt654@fabs-net.com', 'tnt654@fabs-net.com', '$2b$12$makkGacIHEHkaTs2HD29ueFGrgJ1ODP8f1rPxie.0AKsK/LT2INmy', 'user', 0, '{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":false,\"isCalibrated\":true,\"gripper1\":{},\"activeIndex\":0,\"grippers\":[{\"name\":\"Gripper 1\",\"minKg\":5,\"maxKg\":60,\"totalTurns\":20}]}}', 20260507190327, NULL, 1778174195884),
(143, 'jeremy2', 'jeremy@jeremy.com', '$2b$12$q/4pHGAdv1w3.BYPOt53K.NVSebuzJ8KSy4nI6iKFL07UakqkqdvW', 'admin', 0, '{\"theme\": \"dark\", \"profileCompleted1\": false, \"profileCompleted2\": false, \"biometric_data\": {}, \"trainingsplan\": {\"firstTime\": true}, \"gripper\": {\"firstTime\": false, \"isCalibrated\": true, \"gripper1\": {}, \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 30, \"activeIndex\": 1, \"grippers\": [{\"name\": \"gorge\", \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 18}, {\"name\": \"Gripper 2\", \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 1000000000}, {\"name\": \"Gripper 3\", \"minKg\": 5, \"maxKg\": 59, \"totalTurns\": 16}]}}', 20260511163830, NULL, 1778512427108),
(158, 'gorgina', 'gorgina.dresl@outlook.com', '$2b$12$.a6VOza/uxXH8s8/oqjgJ.HbkP20o5LEEeDXg1ftgQPJzbG/xXXTC', 'user', 0, '{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":true,\"isCalibrated\":false,\"gripper1\":{}}}', 20260508091339, NULL, 1778224481883);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
