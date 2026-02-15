-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: testdb
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `province_id` int DEFAULT NULL,
  `province_name` varchar(50) COLLATE utf8mb3_bin DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `district_name` varchar(50) COLLATE utf8mb3_bin DEFAULT NULL,
  `ward_id` int DEFAULT NULL,
  `ward_name` varchar(50) COLLATE utf8mb3_bin DEFAULT NULL,
  `address_detail` text COLLATE utf8mb3_bin,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_address_customer` (`customer_id`),
  CONSTRAINT `FK_address_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,1,227,'Hà Giang',2053,'Huyện Yên Minh',50416,'Xã Sủng Thài','123',0),(2,9,265,'Điện Biên',2123,'Huyện Điện Biên Đông',620711,'Xã Pú Hồng','123',0),(3,1,266,'Sơn La',2267,'Huyện Yên Châu',140813,'Xã Tú Nang','123',0);
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_brand_name` (`brand_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (1,'Nike',1),(2,'Adidas',1),(3,'Puma',1),(4,'Reebok',1),(5,'Under Armour',1),(6,'New Balance',1);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `product_detail_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cart_customer` (`customer_id`),
  KEY `FK_cart_product_detail` (`product_detail_id`),
  CONSTRAINT `FK_cart_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_cart_product_detail` FOREIGN KEY (`product_detail_id`) REFERENCES `product_detail` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (2,9,10,1);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Áo thun',1),(2,'Áo sơ mi',1),(3,'Áo khoác',1),(4,'Áo hoodie',1),(5,'Áo len',1),(6,'Áo polo',1);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collar`
--

DROP TABLE IF EXISTS `collar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collar_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_collar_name` (`collar_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collar`
--

LOCK TABLES `collar` WRITE;
/*!40000 ALTER TABLE `collar` DISABLE KEYS */;
INSERT INTO `collar` VALUES (1,'Cổ tròn',1),(2,'Cổ bẻ',1),(3,'Cổ tim',1);
/*!40000 ALTER TABLE `collar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `color`
--

DROP TABLE IF EXISTS `color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_color_name` (`color_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color`
--

LOCK TABLES `color` WRITE;
/*!40000 ALTER TABLE `color` DISABLE KEYS */;
INSERT INTO `color` VALUES (1,'Đen',1),(2,'Trắng',1),(3,'Xám',1),(4,'Xanh dương',1),(5,'Xanh lá',1),(6,'Đỏ',1),(7,'Vàng',1),(8,'Cam',1),(9,'Tím',1),(10,'Nâu',1);
/*!40000 ALTER TABLE `color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_code` varchar(50) COLLATE utf8mb3_bin DEFAULT NULL,
  `fullname` text COLLATE utf8mb3_bin,
  `username` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `password` text COLLATE utf8mb3_bin,
  `email` text COLLATE utf8mb3_bin,
  `phone` varchar(20) COLLATE utf8mb3_bin DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `forget_password` tinyint(1) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_customer_code` (`customer_code`),
  UNIQUE KEY `UQ_customer_phone` (`phone`),
  UNIQUE KEY `UQ_customer_username` (`username`),
  UNIQUE KEY `UQ_customer_email` (`email`(255))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (-1,'GUEST','Khách vãng lai',NULL,NULL,NULL,NULL,'2025-08-26 17:24:08','2025-08-26 17:24:08',0,1),(1,'USER','Nguyễn Hoàng A','user','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','hoangxuanhieu0301@gmail.com','0912345678','2025-02-17 00:00:00','2025-08-26 11:41:55',0,1),(2,'CUST002','Nguyễn Thị B','nguyenthithb','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','nguyenthithb@example.com','0912345679','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(3,'CUST003','Phạm Minh C','phamminhc_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','phamminhc@example.com','0912345680','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(4,'CUST004','Lê Quang D','lequangd_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','lequangd@example.com','0912345681','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(5,'CUST005','Vũ Minh E','vuminhe_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','vuminhe@example.com','0912345682','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(6,'CUST006','Trần Thi F','tranthif_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','tranthif@example.com','0912345683','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(7,'CUST007','Hồ Hoàng G','hohoangg_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','hohoangg@example.com','0912345684','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(8,'CUST008','Ngô Minh H','ngominhh_c','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','ngominhh@example.com','0912345685','2025-02-17 00:00:00','2025-02-17 00:00:00',0,1),(9,'CUSMEX2K9HCQG','Lê Phong','phonglk4321','$2a$10$O4lX9NmbT5vC.DNU5dhwee2viEcq.Kb3bWm/lGcMvzyE6bxfSX4.G','phonglk4321@gmail.com','0977115888','2025-08-29 16:50:51','2025-08-31 16:32:36',0,1);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(50) COLLATE utf8mb3_bin NOT NULL,
  `role_id` int DEFAULT NULL,
  `fullname` text COLLATE utf8mb3_bin,
  `username` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `password` text COLLATE utf8mb3_bin,
  `email` text COLLATE utf8mb3_bin,
  `phone` varchar(20) COLLATE utf8mb3_bin DEFAULT NULL,
  `photo` varchar(250) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `address` text COLLATE utf8mb3_bin,
  `forget_password` tinyint(1) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_employee_code` (`employee_code`),
  KEY `FK_employee_role` (`role_id`),
  CONSTRAINT `FK_employee_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'ADMIN',1,'Nguyễn Văn A','admin','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','nguyenvana@example.com','0912345678','photo1.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Hà Nội',0,1),(2,'STAFF',2,'Nguyễn Thị B','staff','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','nguyenthitha@example.com','0912345679','photo2.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Hà Nam',0,0),(3,'EMP003',2,'Phạm Minh C','phamminhc','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','phamminhc@example.com','0912345680','photo3.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Hà Nội',0,1),(4,'EMP004',2,'Lê Quang D','lequangd','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','lequangd@example.com','0912345681','photo4.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Tây Ninh',0,1),(5,'EMP005',2,'Vũ Minh E','vuminhE','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','vuminhE@example.com','0912345682','photo5.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Phú Thọ',0,0),(6,'EMP006',2,'Trần Thi F','tranthif','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','tranthif@example.com','0912345683','photo6.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Hà Nội',0,0),(7,'EMP007',1,'Hồ Hoàng G','hohoangg','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','hohoangg@example.com','0912345684','photo7.jpg',1,'2025-02-17 00:00:00','2025-02-17 00:00:00','Hà Nam',0,1),(8,'EMP008',2,'Ngô Minh H','ngominhh','$2a$10$x5pEVObkBXddpSxqwnfwpuQa4HFxKlLTgiZCoUx27ikCNTh/.07RO','ngominhh@example.com','0912345685','photo8.jpg',1,'2025-02-17 00:00:00','2025-08-26 11:33:02','Nam Định',0,0);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_store`
--

DROP TABLE IF EXISTS `history_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_store` (
  `timemark` timestamp NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `pk_date_src` varchar(400) NOT NULL,
  `pk_date_dest` varchar(400) NOT NULL,
  `record_state` int NOT NULL,
  PRIMARY KEY (`table_name`,`pk_date_dest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_store`
--

LOCK TABLES `history_store` WRITE;
/*!40000 ALTER TABLE `history_store` DISABLE KEYS */;
/*!40000 ALTER TABLE `history_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_material_name` (`material_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
INSERT INTO `material` VALUES (1,'Cotton',1),(2,'Polyester',1),(3,'Len',1),(4,'Jean',1),(5,'Nỉ',1),(6,'Vải thun lạnh',1);
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `voucher_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `order_code` varchar(50) COLLATE utf8mb3_bin NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `total_amount` int DEFAULT NULL,
  `original_total` decimal(18,2) DEFAULT NULL,
  `total_bill` decimal(18,2) DEFAULT NULL,
  `payment_method` int DEFAULT NULL,
  `kind_of_order` tinyint(1) DEFAULT NULL,
  `status_order` int DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb3_bin DEFAULT NULL,
  `address` text COLLATE utf8mb3_bin,
  `shipfee` decimal(18,2) DEFAULT NULL,
  `discount` decimal(18,2) DEFAULT NULL,
  `note` text COLLATE utf8mb3_bin,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ__order__99D12D3FADEA2BC7` (`order_code`),
  UNIQUE KEY `UQ_order_code` (`order_code`),
  KEY `FK_order_employee` (`employee_id`),
  KEY `FK_order_voucher` (`voucher_id`),
  KEY `FK_order_customer` (`customer_id`),
  CONSTRAINT `FK_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_order_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_order_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,1,NULL,-1,'ORD-48020B7B','2025-08-26 18:34:32',1,120000.00,120000.00,1,1,5,NULL,NULL,NULL,NULL,NULL),(2,4,NULL,-1,'ORD-78F347CC','2025-08-26 18:38:48',0,0.00,0.00,0,1,-1,NULL,NULL,NULL,NULL,NULL),(3,NULL,NULL,1,'INVMESH98OK1S','2025-08-26 18:43:20',210000,NULL,251001.00,2,0,5,'0912345678','123, Xã Sủng Thài, Huyện Yên Minh, Hà Giang',41001.00,NULL,'ok'),(4,1,NULL,-1,'ORD-3C649668','2025-08-26 18:58:02',0,0.00,0.00,0,1,1,NULL,NULL,NULL,NULL,NULL),(5,NULL,7,9,'INVMEX2TEQMLC','2025-08-29 23:57:58',150000,NULL,166501.00,2,0,-1,'0977115888','123, Xã Vị Trung, Huyện Vị Thuỷ, Hậu Giang',31501.00,NULL,'ok'),(6,NULL,7,9,'INVMEX2VV72OZ','2025-08-29 23:59:53',150000,NULL,176001.00,2,0,-1,'0977115888','123, Thị Trấn Ba Hàng Đồi, Huyện Lạc Thủy, Hòa Bình',41001.00,NULL,'ok'),(7,NULL,7,9,'INVMEX2X4D6EF','2025-08-30 00:00:51',180000,NULL,203001.00,1,0,0,'0977115888','123, Thị Trấn Ba Hàng Đồi, Huyện Lạc Thủy, Hòa Bình',41001.00,NULL,NULL),(8,NULL,7,9,'INVMEX2XYJBZ7','2025-08-30 00:01:30',140000,NULL,167001.00,2,0,0,'0977115888','123, Xã Tú Nang, Huyện Yên Châu, Sơn La',41001.00,NULL,NULL),(9,NULL,7,9,'INVMEX3J95XGV','2025-08-30 00:18:04',140000,NULL,167001.00,2,0,0,'0977115888','123, Xã Pú Hồng, Huyện Điện Biên Đông, Điện Biên',41001.00,NULL,NULL),(10,NULL,7,9,'INVMEX4WV84A9','2025-08-30 00:56:39',140000,NULL,167001.00,2,0,0,'0977115888','123, Xã Pú Hồng, Huyện Điện Biên Đông, Điện Biên',41001.00,NULL,NULL),(11,1,NULL,-1,'ORD-6CA61E60','2025-08-30 01:31:18',0,0.00,0.00,0,1,1,NULL,NULL,NULL,NULL,NULL),(12,NULL,7,9,'INVMEX69VGG6Q','2025-08-30 01:34:45',140000,NULL,167001.00,2,0,0,'0977115888','123, Xã Pú Hồng, Huyện Điện Biên Đông, Điện Biên',41001.00,NULL,NULL),(13,1,NULL,-1,'ORD-E63257FF','2025-08-31 23:17:55',0,0.00,0.00,0,1,1,NULL,NULL,NULL,NULL,NULL),(14,NULL,7,9,'INVMEZWSW99KB','2025-08-31 23:32:55',180000,NULL,203001.00,2,0,0,'0977115888','123, Xã Pú Hồng, Huyện Điện Biên Đông, Điện Biên',41001.00,NULL,NULL),(15,NULL,NULL,1,'INVML3OF01FI7','2026-02-01 18:47:28',150000,NULL,191001.00,2,0,0,'0912345678','123, Xã Sủng Thài, Huyện Yên Minh, Hà Giang',41001.00,NULL,NULL),(16,1,NULL,-1,'ORD-83C6B1A0','2026-02-02 00:56:29',0,0.00,0.00,0,1,1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_detail_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_order_detail_order` (`order_id`),
  KEY `FK_order_detail_product_detail` (`product_detail_id`),
  CONSTRAINT `FK_order_detail_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_order_detail_product_detail` FOREIGN KEY (`product_detail_id`) REFERENCES `product_detail` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,1,1,1,120000.00),(2,3,10,1,210000.00),(3,5,39,1,150000.00),(4,6,39,1,150000.00),(5,7,2,1,180000.00),(6,8,3,1,140000.00),(7,9,3,1,140000.00),(8,10,3,1,140000.00),(9,12,3,1,140000.00),(10,14,2,1,180000.00),(11,15,15,1,150000.00);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `material_id` int DEFAULT NULL,
  `product_code` varchar(10) COLLATE utf8mb3_bin NOT NULL,
  `product_name` text COLLATE utf8mb3_bin,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_product_code` (`product_code`),
  KEY `FK_product_brand` (`brand_id`),
  KEY `FK_product_category` (`category_id`),
  KEY `FK_product_material` (`material_id`),
  CONSTRAINT `FK_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_material` FOREIGN KEY (`material_id`) REFERENCES `material` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,1,1,1,'PR001','Áo thun cổ tròn Nike',1),(2,1,1,2,'PR002','Áo thun thể thao Nike Dri-FIT',1),(3,2,2,1,'PR003','Áo sơ mi tay dài Adidas',1),(4,2,2,3,'PR004','Áo sơ mi họa tiết Adidas',1),(5,3,3,4,'PR005','Áo khoác jeans Puma',1),(6,3,3,5,'PR006','Áo khoác nỉ Puma',1),(7,4,4,6,'PR007','Áo hoodie nỉ Reebok',1),(8,4,4,2,'PR008','Áo hoodie thể thao Reebok',1),(9,5,5,1,'PR009','Áo len cao cổ Under Armour',1),(10,6,6,2,'PR0010','Áo polo thể thao New Balance',1),(11,3,1,5,'PROCS86I2','Áo nỉ Puma',1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_detail`
--

DROP TABLE IF EXISTS `product_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `size_id` int DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `promotion_id` int DEFAULT NULL,
  `collar_id` int DEFAULT NULL,
  `sleeve_id` int DEFAULT NULL,
  `photo` varchar(250) COLLATE utf8mb3_bin DEFAULT NULL,
  `product_detail_code` varchar(50) COLLATE utf8mb3_bin NOT NULL,
  `import_price` decimal(18,2) DEFAULT NULL,
  `sale_price` decimal(18,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `description` text COLLATE utf8mb3_bin,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_product_detail_code` (`product_detail_code`),
  KEY `FK_product_detail_product` (`product_id`),
  KEY `FK_product_detail_size` (`size_id`),
  KEY `FK_product_detail_color` (`color_id`),
  KEY `FK_product_detail_promotion` (`promotion_id`),
  KEY `FK_product_detail_collar` (`collar_id`),
  KEY `FK_product_detail_sleeve` (`sleeve_id`),
  CONSTRAINT `FK_product_detail_collar` FOREIGN KEY (`collar_id`) REFERENCES `collar` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_detail_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_detail_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_detail_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_detail_size` FOREIGN KEY (`size_id`) REFERENCES `size` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_product_detail_sleeve` FOREIGN KEY (`sleeve_id`) REFERENCES `sleeve` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_detail`
--

LOCK TABLES `product_detail` WRITE;
/*!40000 ALTER TABLE `product_detail` DISABLE KEYS */;
INSERT INTO `product_detail` VALUES (1,1,1,1,NULL,1,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT001',100000.00,120000.00,49,'Áo thun cổ tròn màu đen, kích thước XS, giảm giá 20%',1),(2,2,2,2,NULL,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT002',150000.00,180000.00,30,'Áo thun thể thao màu trắng, kích thước S, giảm giá 50%',1),(3,3,3,3,NULL,3,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT003',120000.00,140000.00,40,'Áo sơ mi tay dài màu xám, kích thước M, giảm giá 15%',1),(4,4,4,4,NULL,1,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT004',130000.00,160000.00,35,'Áo sơ mi họa tiết màu xanh, kích thước L, giảm giá 10%',1),(5,5,5,5,NULL,2,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT005',200000.00,250000.00,25,'Áo khoác jeans màu đỏ, kích thước XL, giảm giá 20%',1),(6,6,6,6,NULL,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT006',250000.00,300000.00,20,'Áo khoác nỉ màu cam, kích thước XXL, giảm giá 30%',1),(7,7,1,7,NULL,1,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT007',120000.00,150000.00,45,'Áo hoodie cổ tròn màu tím, kích thước XS, giảm giá 20%',1),(8,8,2,8,NULL,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT008',170000.00,200000.00,30,'Áo hoodie thể thao màu xanh lá, kích thước S, giảm giá 50%',1),(9,9,3,9,NULL,3,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT009',140000.00,160000.00,40,'Áo len cao cổ màu nâu, kích thước M, giảm giá 15%',1),(10,10,4,10,NULL,1,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT010',180000.00,210000.00,29,'Áo len họa tiết màu vàng, kích thước L, giảm giá 10%',1),(11,1,5,1,NULL,2,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT011',190000.00,240000.00,35,'Áo polo thể thao màu đen, kích thước XL, giảm giá 20%',1),(12,2,6,2,NULL,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT012',220000.00,270000.00,20,'Áo polo thể thao màu trắng, kích thước XXL, giảm giá 30%',1),(13,3,1,3,NULL,1,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT013',110000.00,130000.00,50,'Áo thun cổ tròn màu đỏ, kích thước XS, giảm giá 20%',1),(14,4,2,4,NULL,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT014',160000.00,190000.00,40,'Áo thun thể thao màu cam, kích thước S, giảm giá 50%',1),(15,5,3,5,NULL,3,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT015',130000.00,150000.00,45,'Áo sơ mi tay dài màu xám, kích thước M, giảm giá 15%',1),(16,6,4,6,NULL,1,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT016',140000.00,170000.00,30,'Áo sơ mi họa tiết màu xanh, kích thước L, giảm giá 10%',1),(17,7,5,7,NULL,2,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT017',200000.00,240000.00,25,'Áo khoác jeans màu vàng, kích thước XL, giảm giá 20%',1),(18,8,6,8,NULL,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT018',210000.00,250000.00,20,'Áo khoác nỉ màu tím, kích thước XXL, giảm giá 30%',1),(19,9,1,9,NULL,1,1,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT019',110000.00,130000.00,50,'Áo thun cổ tròn màu xanh, kích thước XS, giảm giá 20%',1),(20,10,2,10,NULL,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PDT020',150000.00,180000.00,30,'Áo thun thể thao màu đỏ, kích thước S, giảm giá 50%',1),(21,10,2,2,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S2C2CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(22,10,2,2,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S2C2CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(23,10,2,2,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S2C2CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(24,10,2,2,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S2C2CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(25,10,3,2,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S3C2CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(26,10,3,2,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S3C2CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(27,10,3,2,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S3C2CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(28,10,3,2,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206412288_1701705416077_IMG_3145.PNG?alt=media&token=1279d150-470b-4b45-bd99-4c929cba37a4','PD10S3C2CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(29,10,2,3,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S2C3CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(30,10,2,3,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S2C3CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(31,10,2,3,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S2C3CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(32,10,2,3,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S2C3CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(33,10,3,3,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S3C3CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(34,10,3,3,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S3C3CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(35,10,3,3,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S3C3CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(36,10,3,3,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206415840_1701705900994_IMG_3148.PNG?alt=media&token=a5114293-c8bf-4b49-85b7-0fa8756bf6f6','PD10S3C3CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(37,10,2,5,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S2C5CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(38,10,2,5,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S2C5CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(39,10,2,5,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S2C5CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(40,10,2,5,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S2C5CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(41,10,3,5,6,3,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S3C5CL3SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(42,10,3,5,6,3,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S3C5CL3SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(43,10,3,5,6,2,2,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S3C5CL2SL2',120000.00,150000.00,20,'Chưa có mô tả',1),(44,10,3,5,6,2,3,'https://firebasestorage.googleapis.com/v0/b/endlesstechstoreecommerce.appspot.com/o/Account%2F1756206425089_1701706441644_IMG_3152.PNG?alt=media&token=28b7f567-23c3-46c5-9c16-0c49aa739c10','PD10S3C5CL2SL3',120000.00,150000.00,20,'Chưa có mô tả',1),(45,2,2,4,NULL,3,3,'https://firebasestorage.googleapis.com/v0/b/datn-anh-7449e.firebasestorage.app/o/Account%2F1769980444214_1701705416083_IMG_3146.PNG?alt=media&token=f1fb0df7-4cff-4bfd-8bb8-4e68867a8f28','PD2S2C4CL3SL3',15000.00,200000.00,10,'Chưa có mô tả',1),(46,2,4,4,NULL,3,3,'https://firebasestorage.googleapis.com/v0/b/datn-anh-7449e.firebasestorage.app/o/Account%2F1769980444214_1701705416083_IMG_3146.PNG?alt=media&token=f1fb0df7-4cff-4bfd-8bb8-4e68867a8f28','PD2S4C4CL3SL3',15000.00,200000.00,10,'Chưa có mô tả',1);
/*!40000 ALTER TABLE `product_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion`
--

DROP TABLE IF EXISTS `promotion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `promotion_name` text COLLATE utf8mb3_bin,
  `promotion_percent` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `description` text COLLATE utf8mb3_bin,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion`
--

LOCK TABLES `promotion` WRITE;
/*!40000 ALTER TABLE `promotion` DISABLE KEYS */;
INSERT INTO `promotion` VALUES (1,'Khuyến mãi Tết Nguyên Đán',20,'2025-01-15 00:00:00','2025-02-15 00:00:00','Giảm 20% toàn bộ sản phẩm nhân dịp Tết Nguyên Đán.',1),(2,'Black Friday Sale',50,'2025-11-25 00:00:00','2025-11-30 00:00:00','Giảm giá cực sốc 50% cho tất cả sản phẩm trong tuần lễ Black Friday.',1),(3,'Khuyến mãi 8/3',15,'2025-03-01 00:00:00','2025-03-08 00:00:00','Giảm 15% dành cho khách hàng nữ nhân dịp Quốc tế Phụ nữ.',1),(4,'Back to School',10,'2025-08-15 00:00:00','2025-09-05 00:00:00','Giảm 10% cho các sản phẩm áo sơ mi và áo thun chào đón năm học mới.',1),(5,'Giảm giá hè sôi động',30,'2025-06-01 00:00:00','2025-06-30 00:00:00','Ưu đãi lên đến 30% cho các sản phẩm áo khoác và hoodie.',1),(6,'Sale cuối năm',40,'2025-12-20 00:00:00','2025-12-31 00:00:00','Giảm sốc 40% cho các sản phẩm trong dịp lễ Giáng Sinh và năm mới.',1);
/*!40000 ALTER TABLE `promotion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb3_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ADMIN'),(2,'STAFF');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size`
--

DROP TABLE IF EXISTS `size`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_size_name` (`size_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size`
--

LOCK TABLES `size` WRITE;
/*!40000 ALTER TABLE `size` DISABLE KEYS */;
INSERT INTO `size` VALUES (1,'XS',1),(2,'S',1),(3,'M',1),(4,'L',1),(5,'XL',1),(6,'XXL',1);
/*!40000 ALTER TABLE `size` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sleeve`
--

DROP TABLE IF EXISTS `sleeve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sleeve` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sleeve_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_sleeve_name` (`sleeve_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sleeve`
--

LOCK TABLES `sleeve` WRITE;
/*!40000 ALTER TABLE `sleeve` DISABLE KEYS */;
INSERT INTO `sleeve` VALUES (1,'Tay ngắn',1),(2,'Tay dài',1),(3,'Sát nách',1);
/*!40000 ALTER TABLE `sleeve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voucher_code` varchar(50) COLLATE utf8mb3_bin NOT NULL,
  `voucher_name` varchar(250) COLLATE utf8mb3_bin DEFAULT NULL,
  `description` text COLLATE utf8mb3_bin,
  `min_condition` decimal(18,2) DEFAULT NULL,
  `max_discount` decimal(18,2) DEFAULT NULL,
  `reduced_percent` double DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_voucher_code` (`voucher_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
INSERT INTO `voucher` VALUES (1,'VOUCHER01','Giảm giá mùa xuân','Giảm giá 10% cho đơn hàng từ 500.000đ',500000.00,100000.00,10,'2025-02-20 00:00:00','2025-03-31 00:00:00',0),(2,'VOUCHER02','Giảm giá cho khách mới','Giảm giá 15% cho khách hàng lần đầu mua sắm',300000.00,50000.00,15,'2025-02-15 00:00:00','2025-02-28 00:00:00',0),(3,'VOUCHER03','Giảm giá nhân dịp lễ','Giảm giá 20% cho đơn hàng từ 1.000.000đ',1000000.00,200000.00,20,'2025-03-01 00:00:00','2025-03-15 00:00:00',0),(4,'VOUCHER04','Khuyến mãi sinh nhật','Giảm giá 25% cho tất cả các sản phẩm',0.00,300000.00,25,'2025-03-10 00:00:00','2025-03-20 00:00:00',0),(5,'VOUCHER05','Giảm giá cho khách hàng VIP','Giảm giá 30% cho khách hàng VIP trên 1.500.000đ',1500000.00,450000.00,30,'2025-04-01 00:00:00','2025-04-30 00:00:00',0),(6,'VOUCHER06','Giảm giá cuối mùa','Giảm giá 50% cho tất cả các sản phẩm còn lại',0.00,500000.00,50,'2025-04-05 00:00:00','2025-04-15 00:00:00',0),(7,'VOUCHER-651AF0','GIAM10%','Giảm giá 10% cho toàn bộ sản phẩm',1.00,100000.00,10,'2025-08-26 18:53:00','2025-09-11 18:53:00',0);
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-04 14:11:40
