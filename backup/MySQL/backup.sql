/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: gymapp
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
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'fabs','fabs@fabs.com','$2b$12$vnfr2Z2GfTVRhe0nCbvHduwlcbUeAIZfBKP.6EMx72Pb8KwETZ2mS','admin',0,'{\"gripper\":{\"minKg\":5,\"maxKg\":60,\"totalTurns\":0,\"isCalibrated\":false}}','2026-04-25 12:36:24'),
(108,'test1','test1@test.com','$2b$12$6HOO9QZmDxkFTlXfbhmYq.3rsVrwNqzQ3d.ARDCy4Vqr9cbKjFCrq','user',0,'{}',NULL),
(121,'jeremy','Gugu@gaga.com','$2b$12$X/kbFUBtCLaBZPbsKD91ne0Vmq6tD4zvQc9tKZFmlmUTt00n/j6Fi','user',0,'{}',NULL),
(122,'Irgendwer','irgendwer@fabs-net.com','$2b$12$FV9tL4/C.Gd4aR4MS40weOaTXPb58TYD1ZwX9bPLSWEBRO3mF5wHC','user',0,'{}',NULL),
(132,'tnt654@fabs-net.com','tnt654@fabs-net.com','$2b$12$makkGacIHEHkaTs2HD29ueFGrgJ1ODP8f1rPxie.0AKsK/LT2INmy','user',0,'{}','2026-04-24 20:41:06'),
(136,'eee','e@e.e','$2b$12$4h/VhwTbIQbaXcD5FL7bbee/nEkZPGwGhQcVcYcGCnS.YGcyFRWp.','user',0,'{\"gripper\":{\"minKg\":5,\"maxKg\":60,\"totalTurns\":0,\"currentTurns\":0,\"isCalibrated\":false}}',NULL),
(137,'hhh','h@h.h','$2b$12$Dft2BjdgUB/9BepGAi6zVuOR2JtJGTT3p9nfmadwt1TnVWn/HRc3G','user',0,'{\"gripper\":{\"minKg\":5,\"maxKg\":60,\"totalTurns\":0,\"currentTurns\":0,\"isCalibrated\":false}}',NULL),
(138,'fff','f@f.f','$2b$12$eRfURIHlr1HvSltwZDTHk.XaKxG17.rF3hTHlvw0iegabi0EMECQK','user',0,'{\"gripper\":{\"minKg\":5,\"maxKg\":60,\"totalTurns\":0,\"currentTurns\":0,\"isCalibrated\":false}}',NULL),
(139,'jjj','j@j.j','$2b$12$SpsC5m79LFpgWbG04N71YOFJQ4ZzASRh2cffFf3S1CTAFboXE91dG','user',0,'{\"gripper\":{\"minKg\":5,\"maxKg\":60,\"totalTurns\":0,\"isCalibrated\":false}}','2026-04-25 12:18:07');
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

-- Dump completed on 2026-04-25 12:44:22
