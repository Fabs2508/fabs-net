/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: fabsnet
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-0+deb13u1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `training_plans`
--

DROP TABLE IF EXISTS `training_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `plan_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`plan_json`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `repeat_future` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_week` (`user_id`,`week_start`),
  KEY `idx_training_plans_user_week` (`user_id`,`week_start`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_plans`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `training_plans` WRITE;
/*!40000 ALTER TABLE `training_plans` DISABLE KEYS */;
INSERT INTO `training_plans` VALUES
(2,1,'2026-06-01','{\"weekStart\":\"2026-06-01\",\"customBlocks\":[],\"days\":[{\"key\":\"monday\",\"label\":\"Montag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"tuesday\",\"label\":\"Dienstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"wednesday\",\"label\":\"Mittwoch\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"thursday\",\"label\":\"Donnerstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"friday\",\"label\":\"Freitag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"saturday\",\"label\":\"Samstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"sunday\",\"label\":\"Sonntag\",\"status\":\"planned\",\"blocks\":[]}]}','2026-05-13 20:21:03','2026-05-13 21:11:11',0),
(3,1,'2026-06-15','{\"weekStart\":\"2026-06-15\",\"customBlocks\":[],\"days\":[{\"key\":\"monday\",\"label\":\"Montag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"tuesday\",\"label\":\"Dienstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"wednesday\",\"label\":\"Mittwoch\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"thursday\",\"label\":\"Donnerstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"friday\",\"label\":\"Freitag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"saturday\",\"label\":\"Samstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"sunday\",\"label\":\"Sonntag\",\"status\":\"planned\",\"blocks\":[]}]}','2026-05-13 20:21:07','2026-05-13 21:11:09',0),
(10,1,'2026-05-18','{\"weekStart\":\"2026-05-18\",\"customBlocks\":[],\"days\":[{\"key\":\"monday\",\"label\":\"Montag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"tuesday\",\"label\":\"Dienstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"wednesday\",\"label\":\"Mittwoch\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"thursday\",\"label\":\"Donnerstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"friday\",\"label\":\"Freitag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"saturday\",\"label\":\"Samstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"sunday\",\"label\":\"Sonntag\",\"status\":\"planned\",\"blocks\":[]}]}','2026-05-13 21:11:03','2026-05-13 21:11:03',0),
(11,1,'2026-05-25','{\"weekStart\":\"2026-05-25\",\"customBlocks\":[],\"days\":[{\"key\":\"monday\",\"label\":\"Montag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"tuesday\",\"label\":\"Dienstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"wednesday\",\"label\":\"Mittwoch\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"thursday\",\"label\":\"Donnerstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"friday\",\"label\":\"Freitag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"saturday\",\"label\":\"Samstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"sunday\",\"label\":\"Sonntag\",\"status\":\"planned\",\"blocks\":[]}]}','2026-05-13 21:11:04','2026-05-13 21:11:04',0),
(13,1,'2026-06-08','{\"weekStart\":\"2026-06-08\",\"customBlocks\":[],\"days\":[{\"key\":\"monday\",\"label\":\"Montag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"tuesday\",\"label\":\"Dienstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"wednesday\",\"label\":\"Mittwoch\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"thursday\",\"label\":\"Donnerstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"friday\",\"label\":\"Freitag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"saturday\",\"label\":\"Samstag\",\"status\":\"planned\",\"blocks\":[]},{\"key\":\"sunday\",\"label\":\"Sonntag\",\"status\":\"planned\",\"blocks\":[]}]}','2026-05-13 21:11:06','2026-05-13 21:11:06',0);
/*!40000 ALTER TABLE `training_plans` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `twoFactor` tinyint(1) NOT NULL DEFAULT 0,
  `userData` longtext DEFAULT NULL,
  `last_login` bigint(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `last_seen` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'fabs','fabs@fabs.com','$2b$12$6HOO9QZmDxkFTlXfbhmYq.3rsVrwNqzQ3d.ARDCy4Vqr9cbKjFCrq','admin',0,'{\"theme\": \"dark\", \"profileCompleted\": false, \"biometric_data\": {}, \"trainingsplan\": {\"firstTime\": true}, \"gripper\": {\"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 19, \"isCalibrated\": true}}',20260429230657,NULL,NULL),
(2,'test1','test1@test.com','$2b$12$6HOO9QZmDxkFTlXfbhmYq.3rsVrwNqzQ3d.ARDCy4Vqr9cbKjFCrq','user',0,'{\"theme\": \"dark\", \"profileCompleted\": false, \"biometric_data\": {}, \"trainingsplan\": {\"firstTime\": true}, \"gripper\": {\"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 19, \"isCalibrated\": true}}',20260429230657,NULL,NULL),
(3,'Irgendwer','irgendwer@fabs-net.com','$2b$12$FV9tL4/C.Gd4aR4MS40weOaTXPb58TYD1ZwX9bPLSWEBRO3mF5wHC','user',0,'{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":true,\"isCalibrated\":false,\"gripper1\":{}}}',20260430211418,NULL,NULL),
(4,'tnt654@fabs-net.com','tnt654@fabs-net.com','$2b$12$makkGacIHEHkaTs2HD29ueFGrgJ1ODP8f1rPxie.0AKsK/LT2INmy','user',0,'{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":false,\"isCalibrated\":true,\"gripper1\":{},\"activeIndex\":0,\"grippers\":[{\"name\":\"Gripper 1\",\"minKg\":5,\"maxKg\":60,\"totalTurns\":20}]}}',20260507190327,NULL,1778174195884),
(5,'jeremy2','jeremy@jeremy.com','$2b$12$q/4pHGAdv1w3.BYPOt53K.NVSebuzJ8KSy4nI6iKFL07UakqkqdvW','admin',0,'{\"theme\": \"dark\", \"profileCompleted1\": false, \"profileCompleted2\": false, \"biometric_data\": {}, \"trainingsplan\": {\"firstTime\": true}, \"gripper\": {\"firstTime\": false, \"isCalibrated\": true, \"gripper1\": {}, \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 30, \"activeIndex\": 1, \"grippers\": [{\"name\": \"gorge\", \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 18}, {\"name\": \"Gripper 2\", \"minKg\": 5, \"maxKg\": 60, \"totalTurns\": 1000000000}, {\"name\": \"Gripper 3\", \"minKg\": 5, \"maxKg\": 59, \"totalTurns\": 16}]}}',20260511163830,NULL,1778512427108),
(6,'gorgina','gorgina.dresl@outlook.com','$2b$12$.a6VOza/uxXH8s8/oqjgJ.HbkP20o5LEEeDXg1ftgQPJzbG/xXXTC','user',0,'{\"theme\":\"dark\",\"profileCompleted1\":false,\"profileCompleted2\":false,\"biometric_data\":{},\"trainingsplan\":{\"firstTime\":true},\"gripper\":{\"firstTime\":true,\"isCalibrated\":false,\"gripper1\":{}}}',20260508091339,NULL,1778224481883);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-14  0:12:19
