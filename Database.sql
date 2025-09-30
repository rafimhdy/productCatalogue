-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: project
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'mahdy','rafi@example.com','123456','2025-09-26 08:00:36','2025-09-28 09:40:38'),(2,'admin','admin@example.com','123456','2025-09-26 08:00:36','2025-09-26 12:08:25'),(6,'admin2','admin2@example.com','$2b$10$TxJOu.Oq6JQqlk3sqRaOIOMdrpm0n83sjWnBFDpYikGHhVb.lQcbO','2025-09-28 09:40:59','2025-09-28 09:40:59');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `best_sellers`
--

DROP TABLE IF EXISTS `best_sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `best_sellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `rank_position` int NOT NULL,
  `wilson_score` decimal(5,4) NOT NULL,
  `total_sold` int NOT NULL,
  `average_rating` decimal(3,2) NOT NULL,
  `total_reviews` int NOT NULL,
  `calculation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product` (`product_id`),
  KEY `idx_rank_position` (`rank_position`),
  KEY `idx_best_sellers_calculation_date` (`calculation_date`),
  KEY `idx_best_sellers_wilson_score` (`wilson_score` DESC),
  CONSTRAINT `best_sellers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `best_sellers`
--

LOCK TABLES `best_sellers` WRITE;
/*!40000 ALTER TABLE `best_sellers` DISABLE KEYS */;
INSERT INTO `best_sellers` VALUES (1,2,1,0.7225,24,4.80,10,'2025-09-28 05:12:09');
/*!40000 ALTER TABLE `best_sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (78,6,4,1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,1,'2025-09-25 01:56:13'),(2,2,'2025-09-25 02:36:07'),(3,5,'2025-09-26 04:03:01'),(4,6,'2025-09-26 05:30:22'),(5,8,'2025-09-27 07:55:33'),(6,7,'2025-09-27 10:47:12');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Makanan','Produk makanan siap saji atau bahan mentah'),(4,'Minuman','Produk Minuman'),(5,'Dessert','Makanan Penutup'),(7,'Cemilan','Produk cemilan');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_login_history`
--

DROP TABLE IF EXISTS `customer_login_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `login_success` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_login_time` (`login_time`),
  KEY `idx_customer_login_history_customer_id_time` (`customer_id`,`login_time`),
  CONSTRAINT `fk_customer_login_history_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_login_history`
--

LOCK TABLES `customer_login_history` WRITE;
/*!40000 ALTER TABLE `customer_login_history` DISABLE KEYS */;
INSERT INTO `customer_login_history` VALUES (1,1,'2025-09-28 10:34:05','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',1),(2,1,'2025-09-28 11:05:16','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',1),(3,1,'2025-09-28 12:06:29','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',1);
/*!40000 ALTER TABLE `customer_login_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_google` tinyint(1) NOT NULL DEFAULT '0',
  `image_url` varchar(500) DEFAULT NULL,
  `newsletter_preference` tinyint(1) DEFAULT '0',
  `product_categories_preference` json DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_customers_email` (`email`),
  KEY `idx_customers_verification_token` (`verification_token`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Doe John','customer@example.com','','$2b$10$/oc3k5atCtmfDItK8QsuveAnSjfOnRx8JyCvVXyvygMtiPAhyNb.u','2025-09-26 02:03:07',NULL,NULL,0,0,NULL,0,'[]','2025-09-28 12:06:29'),(2,'customer2','customer2@example.com',NULL,'123456','2025-09-26 02:03:07',NULL,NULL,0,0,NULL,0,NULL,NULL),(3,'customer10','customer10@example.com',NULL,'123456','2025-09-26 02:03:07',NULL,NULL,0,0,NULL,0,NULL,NULL),(5,'Muhammad Rafi Mahdy','muhammadrafimahdy@gmail.com',NULL,'$2b$10$Ku3VAwBeq9/1iKlfvd5cW.KYd95W0FZmcWDtUec9Eyq7qNgU30phy','2025-09-26 04:00:41',NULL,NULL,0,0,NULL,0,NULL,NULL),(6,'Mahdy','mahdayyyyyy@gmail.com',NULL,'$2b$10$D/Af7E1mnugZSE0/ptxXU.pueqT4LhwnRwzJNXsVTNZKxEl7LZe8y','2025-09-26 04:44:05','73321e74fd8512fd25c340fb48816e5cd7d9336e3bf1feab735d2aa20141b632','2025-09-26 12:44:06',0,0,NULL,0,NULL,NULL),(7,'Rashy MBE','mbrrash@gmail.com',NULL,'$2b$10$I3T2lGG/YlqWQGyGQcDKROLF7yGZcErlgzXrTOSLMM8WSFxZl8KAi','2025-09-27 07:50:46',NULL,NULL,0,0,'https://lh3.googleusercontent.com/a/ACg8ocKn0x27Hs04VPZN44tMM7QILFC7cKUADmdBONgYlcjX3CvSB_g=s96-c',0,NULL,NULL),(8,'Rafi Mahdy','uoptical79@gmail.com',NULL,'$2b$10$Ma7yOxfhopcnE/.iNYIRQuKKorGYMfPk04TRiL87cGpkpmRkL3Cve','2025-09-27 07:55:24',NULL,NULL,0,0,'https://lh3.googleusercontent.com/a/ACg8ocIHBnlhSIJPAei9vPMJsJ3CK1Vci1xjnE1kKH5UKAfNSHh38vs=s96-c',0,NULL,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,6,2,'Mie Ayam',1,12000.00,'2025-09-26 02:24:51'),(2,7,4,'Thai Tea',4,10000.00,'2025-09-26 02:59:15'),(3,7,2,'Mie Ayam',4,12000.00,'2025-09-26 02:59:15'),(4,7,1,'Nasi Goreng Spesial',3,25000.00,'2025-09-26 02:59:15'),(16,14,2,'Mie Ayam',1,12000.00,'2025-09-26 05:32:55'),(17,14,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-26 05:32:55'),(18,15,2,'Mie Ayam',2,12000.00,'2025-09-26 05:46:20'),(20,17,2,'Mie Ayam',1,12000.00,'2025-09-26 06:06:57'),(21,18,2,'Mie Ayam',1,12000.00,'2025-09-26 06:13:41'),(29,26,2,'Mie Ayam',1,12000.00,'2025-09-26 08:35:08'),(30,27,4,'Thai Tea',1,10000.00,'2025-09-26 12:06:15'),(33,30,2,'Mie Ayam',1,12000.00,'2025-09-27 07:55:37'),(35,32,2,'Mie Ayam',1,12000.00,'2025-09-27 08:13:01'),(36,33,2,'Mie Ayam',2,12000.00,'2025-09-27 08:15:01'),(37,34,2,'Mie Ayam',1,12000.00,'2025-09-27 08:27:35'),(38,35,2,'Mie Ayam',2,12000.00,'2025-09-27 08:30:29'),(40,37,2,'Mie Ayam',1,12000.00,'2025-09-27 08:36:17'),(42,39,2,'Mie Ayam',1,12000.00,'2025-09-27 08:40:29'),(43,40,2,'Mie Ayam',1,12000.00,'2025-09-27 08:44:07'),(44,41,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-27 08:46:43'),(45,42,2,'Mie Ayam',2,12000.00,'2025-09-27 08:54:51'),(46,43,2,'Mie Ayam',1,12000.00,'2025-09-27 08:55:25'),(47,44,2,'Mie Ayam',1,12000.00,'2025-09-27 08:59:23'),(48,45,2,'Mie Ayam',1,12000.00,'2025-09-27 08:59:49'),(49,46,2,'Mie Ayam',1,12000.00,'2025-09-27 09:04:55'),(50,47,2,'Mie Ayam',2,12000.00,'2025-09-27 09:07:31'),(51,48,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-27 09:09:07'),(52,49,2,'Mie Ayam',2,12000.00,'2025-09-27 12:44:06'),(53,50,2,'Mie Ayam',1,12000.00,'2025-09-27 13:11:35'),(54,51,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-27 13:14:35'),(55,52,2,'Mie Ayam',1,12000.00,'2025-09-27 13:45:59'),(56,53,2,'Mie Ayam',1,12000.00,'2025-09-27 14:35:47'),(57,54,5,'Batagor',1,5000.00,'2025-09-27 14:57:13'),(58,55,2,'Mie Ayam',1,12000.00,'2025-09-28 04:10:39'),(59,56,2,'Mie Ayam',1,12000.00,'2025-09-28 04:13:09'),(60,57,2,'Mie Ayam',5,12000.00,'2025-09-28 04:29:55'),(61,58,2,'Mie Ayam',1,12000.00,'2025-09-28 04:37:35'),(62,58,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-28 04:37:35'),(63,59,2,'Mie Ayam',1,12000.00,'2025-09-28 04:38:25'),(64,60,2,'Mie Ayam',1,12000.00,'2025-09-28 04:40:00'),(65,61,2,'Mie Ayam',1,12000.00,'2025-09-28 04:40:34'),(66,62,2,'Mie Ayam',1,12000.00,'2025-09-28 04:41:18'),(67,63,2,'Mie Ayam',1,12000.00,'2025-09-28 04:41:44'),(68,64,2,'Mie Ayam',1,12000.00,'2025-09-28 04:42:16'),(69,65,2,'Mie Ayam',1,12000.00,'2025-09-28 05:35:04'),(70,66,2,'Mie Ayam',1,12000.00,'2025-09-28 06:20:33'),(71,67,9,'Kue Cubit',1,1000.00,'2025-09-28 07:08:42'),(72,68,5,'Batagor',1,5000.00,'2025-09-28 10:34:23'),(73,68,1,'Nasi Goreng Spesial',2,25000.00,'2025-09-28 10:34:23'),(74,69,5,'Batagor',1,5000.00,'2025-09-28 10:42:10'),(75,69,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-28 10:42:10'),(76,70,5,'Batagor',1,5000.00,'2025-09-28 10:58:08'),(77,70,1,'Nasi Goreng Spesial',1,25000.00,'2025-09-28 10:58:08'),(78,71,5,'Batagor',2,5000.00,'2025-09-28 11:05:29'),(79,71,1,'Nasi Goreng Spesial',2,25000.00,'2025-09-28 11:05:29');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` varchar(50) DEFAULT 'pending',
  `midtrans_order_id` varchar(64) DEFAULT NULL,
  `midtrans_transaction_id` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (6,2,12000.00,'cancelled','2025-09-26 02:24:51','pending',NULL,NULL),(7,1,163000.00,'delivered','2025-09-26 02:59:15','pending',NULL,NULL),(14,1,37000.00,'delivered','2025-09-26 05:32:55','pending',NULL,NULL),(15,1,24000.00,'delivered','2025-09-26 05:46:20','pending',NULL,NULL),(17,1,12000.00,'cancelled','2025-09-26 06:06:57','pending',NULL,NULL),(18,6,12000.00,'delivered','2025-09-26 06:13:41','pending',NULL,NULL),(26,1,12000.00,'delivered','2025-09-26 08:35:08','pending',NULL,NULL),(27,1,10000.00,'delivered','2025-09-26 12:06:15','pending',NULL,NULL),(30,8,12000.00,'cancelled','2025-09-27 07:55:37','pending',NULL,NULL),(32,1,12000.00,'cancelled','2025-09-27 08:13:01','pending',NULL,NULL),(33,1,24000.00,'cancelled','2025-09-27 08:15:01','pending',NULL,NULL),(34,1,12000.00,'cancelled','2025-09-27 08:27:35','pending',NULL,NULL),(35,1,24000.00,'cancelled','2025-09-27 08:30:29','pending',NULL,NULL),(37,1,12000.00,'cancelled','2025-09-27 08:36:17','pending',NULL,NULL),(39,1,12000.00,'cancelled','2025-09-27 08:40:29','pending',NULL,NULL),(40,1,12000.00,'cancelled','2025-09-27 08:44:07','pending',NULL,NULL),(41,1,25000.00,'cancelled','2025-09-27 08:46:43','pending',NULL,NULL),(42,1,24000.00,'cancelled','2025-09-27 08:54:51','pending',NULL,NULL),(43,1,12000.00,'cancelled','2025-09-27 08:55:25','pending',NULL,NULL),(44,1,12000.00,'cancelled','2025-09-27 08:59:23','pending',NULL,NULL),(45,1,12000.00,'cancelled','2025-09-27 08:59:49','pending',NULL,NULL),(46,1,12000.00,'cancelled','2025-09-27 09:04:55','pending',NULL,NULL),(47,1,24000.00,'cancelled','2025-09-27 09:07:31','pending',NULL,NULL),(48,1,25000.00,'cancelled','2025-09-27 09:09:07','pending',NULL,NULL),(49,1,24000.00,'delivered','2025-09-27 12:44:06','pending',NULL,NULL),(50,1,12000.00,'cancelled','2025-09-27 13:11:35','pending',NULL,NULL),(51,1,25000.00,'cancelled','2025-09-27 13:14:35','pending',NULL,NULL),(52,1,12000.00,'cancelled','2025-09-27 13:45:59','pending',NULL,NULL),(53,1,12000.00,'cancelled','2025-09-27 14:35:47','pending',NULL,NULL),(54,1,5000.00,'delivered','2025-09-27 14:57:13','pending',NULL,NULL),(55,1,12000.00,'delivered','2025-09-28 04:10:39','pending',NULL,NULL),(56,1,12000.00,'cancelled','2025-09-28 04:13:09','pending',NULL,NULL),(57,2,60000.00,'delivered','2025-09-28 04:29:55','pending',NULL,NULL),(58,2,37000.00,'delivered','2025-09-28 04:37:35','pending',NULL,NULL),(59,2,12000.00,'delivered','2025-09-28 04:38:25','pending',NULL,NULL),(60,2,12000.00,'delivered','2025-09-28 04:40:00','pending',NULL,NULL),(61,2,12000.00,'delivered','2025-09-28 04:40:34','pending',NULL,NULL),(62,2,12000.00,'delivered','2025-09-28 04:41:18','pending',NULL,NULL),(63,2,12000.00,'delivered','2025-09-28 04:41:44','pending',NULL,NULL),(64,2,12000.00,'cancelled','2025-09-28 04:42:16','pending',NULL,NULL),(65,2,12000.00,'delivered','2025-09-28 05:35:04','pending',NULL,NULL),(66,2,12000.00,'delivered','2025-09-28 06:20:33','pending',NULL,NULL),(67,2,1000.00,'cancelled','2025-09-28 07:08:42','pending',NULL,NULL),(68,1,55000.00,'delivered','2025-09-28 10:34:23','pending',NULL,NULL),(69,1,30000.00,'delivered','2025-09-28 10:42:10','pending',NULL,NULL),(70,1,30000.00,'delivered','2025-09-28 10:58:08','pending',NULL,NULL),(71,1,60000.00,'delivered','2025-09-28 11:05:29','pending',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_text` text,
  `is_verified` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`product_id`,`user_id`,`order_id`),
  KEY `idx_reviews_product_id` (`product_id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `idx_reviews_order_id` (`order_id`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `idx_reviews_created_at` (`created_at`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,2,1,55,5,'',1,0,'2025-09-28 04:23:07','2025-09-28 04:23:07'),(2,2,1,26,5,'So good',1,0,'2025-09-28 04:27:55','2025-09-28 04:27:55'),(3,1,1,14,5,'enak',1,0,'2025-09-28 04:28:33','2025-09-28 04:28:33'),(4,5,1,54,5,'enakkk',1,0,'2025-09-28 04:28:46','2025-09-28 04:28:46'),(5,2,2,57,5,'goodd',1,0,'2025-09-28 04:30:35','2025-09-28 04:30:35'),(6,2,2,58,5,'',1,0,'2025-09-28 04:37:58','2025-09-28 04:37:58'),(7,1,2,58,5,'',1,0,'2025-09-28 04:38:11','2025-09-28 04:38:11'),(8,2,2,59,5,'boleh lah',1,0,'2025-09-28 04:38:52','2025-09-28 04:38:52'),(9,2,2,60,4,'',1,0,'2025-09-28 04:40:19','2025-09-28 04:40:19'),(10,2,2,61,4,'',1,0,'2025-09-28 04:40:52','2025-09-28 04:40:52'),(11,2,2,62,5,'',1,0,'2025-09-28 04:41:37','2025-09-28 04:41:37'),(12,2,2,63,5,'',1,0,'2025-09-28 04:42:03','2025-09-28 04:42:03'),(13,2,2,64,5,'',1,0,'2025-09-28 04:42:33','2025-09-28 04:42:33'),(14,2,2,66,5,'enakkkkkkk',1,0,'2025-09-28 06:47:59','2025-09-28 06:47:59'),(15,9,2,67,5,'enakkkkkkk',1,0,'2025-09-28 07:11:38','2025-09-28 07:11:38'),(16,2,2,65,5,'enakkkkkkkkk',1,0,'2025-09-28 07:22:39','2025-09-28 07:22:39'),(17,1,1,68,5,'enakkkkkkk',1,0,'2025-09-28 10:35:29','2025-09-28 10:35:29'),(18,1,1,7,5,'deliciousssss',1,0,'2025-09-28 10:39:54','2025-09-28 10:39:54'),(19,5,1,68,5,'enaknyooooooo',1,0,'2025-09-28 10:40:34','2025-09-28 10:40:34'),(20,2,1,49,5,'enaknyooooooo',1,0,'2025-09-28 10:52:57','2025-09-28 10:52:57'),(21,2,1,15,5,'enakkkkkkkkkkk',1,0,'2025-09-28 10:53:12','2025-09-28 10:53:12'),(22,2,1,14,5,'gudddddddddddd',1,0,'2025-09-28 10:53:33','2025-09-28 10:53:33'),(23,2,1,7,5,'enakkkkkkaliiii',1,0,'2025-09-28 12:05:21','2025-09-28 12:05:21'),(24,1,1,71,5,'enakkkkkkkkkk',1,0,'2025-09-28 12:06:11','2025-09-28 12:06:11'),(25,1,1,70,5,'enakkkkkkkkkk',1,0,'2025-09-28 12:08:10','2025-09-28 12:08:10');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `description` text,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `low_stock_threshold` int DEFAULT '5',
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `total_sold` int DEFAULT '0',
  `total_reviews` int DEFAULT '0',
  `wilson_score` decimal(5,4) DEFAULT '0.0000',
  `is_best_seller` tinyint(1) DEFAULT '0',
  `best_seller_rank` int DEFAULT NULL,
  `last_rating_update` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_products_wilson_score` (`wilson_score` DESC),
  KEY `idx_products_total_sold` (`total_sold` DESC),
  KEY `idx_products_is_best_seller` (`is_best_seller`),
  KEY `idx_products_best_seller_rank` (`best_seller_rank`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nasi Goreng Spesial',25000.00,42,'https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/07/13073811/Praktis-dengan-Bahan-Sederhana-Ini-Resep-Nasi-Goreng-Special-1.jpg.webp','Nasi goreng dengan telur dan ayam',1,'2025-09-23 08:38:24','2025-09-28 12:08:10',5,5.00,0,11,6,0.0000,0,NULL,'2025-09-28 12:08:10'),(2,'Mie Ayam',12000.00,25,'https://radarmukomuko.bacakoran.co/upload/f6d2189250b95da1710597e75eddef5b.jpg','Kaos polos katun nyaman dipakai',1,'2025-09-23 08:38:24','2025-09-28 12:05:21',5,4.88,0,25,16,0.8064,1,1,'2025-09-28 12:05:21'),(4,'Thai Tea',10000.00,33,'https://thai-foodie.com/wp-content/uploads/2024/09/thai-milk-tea.jpg',NULL,4,'2025-09-24 04:45:09','2025-09-28 11:04:49',5,0.00,0,5,0,0.0000,0,NULL,'2025-09-28 05:12:09'),(5,'Batagor',5000.00,86,'https://asset.kompas.com/crops/_kM5DGB59_JtNIXN5LqJo4231mo=/0x31:1000x698/1200x800/data/photo/2020/09/28/5f71e5f13e054.jpg',NULL,1,'2025-09-24 04:46:41','2025-09-28 11:05:29',5,5.00,0,2,2,0.0000,0,NULL,'2025-09-28 10:40:34'),(8,'Es Goreng',5000.00,3,'https://res.cloudinary.com/dua3ppevs/image/upload/v1758957673/products/m9mq37fbvz3cztu00aac.jpg',NULL,5,'2025-09-27 07:13:56','2025-09-28 05:12:09',5,0.00,0,0,0,0.0000,0,NULL,'2025-09-28 05:12:09'),(9,'Kue Cubit',1000.00,79,'https://sukabumiku.id/wp-content/uploads/2024/11/Resep-Kue-Cubir-Khas-Sukabumi.jpg',NULL,7,'2025-09-28 03:47:45','2025-09-28 08:55:37',5,5.00,0,1,1,0.0000,0,NULL,'2025-09-28 07:11:38'),(10,'Martabak Mini',2000.00,79,'https://radarlampung.disway.id/upload/745b68a6b4545816c9e7d6566a9f68fe.jpg',NULL,7,'2025-09-28 03:48:11','2025-09-28 05:12:09',5,0.00,0,0,0,0.0000,0,NULL,'2025-09-28 05:12:09'),(11,'Gehu Pedas',1500.00,50,'https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/03/20/Gehu-pedas-ala-Devina-Hermawan-3897841120.png',NULL,7,'2025-09-28 05:10:32','2025-09-28 05:12:09',5,0.00,0,0,0,0.0000,0,NULL,'2025-09-28 05:12:09');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  KEY `idx_wishlist_user_id` (`user_id`),
  KEY `idx_wishlist_product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES (5,1,4,'2025-09-28 11:01:34');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 19:13:05
