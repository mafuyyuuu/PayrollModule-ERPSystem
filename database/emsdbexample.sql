-- 1. CRITICAL FIX: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.39 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP DATABASE employeemanagementsystem;
-- Dumping database structure for employee_management_system
CREATE DATABASE IF NOT EXISTS `employee_management_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `employee_management_system`;

-- Dumping structure for table employee_management_system.applicantlogincredentials
CREATE TABLE IF NOT EXISTS `applicantlogincredentials` (
                                                           `login_id` int NOT NULL AUTO_INCREMENT,
                                                           `applicant_id` int NOT NULL,
                                                           `username` varchar(50) NOT NULL,
    `password` varchar(200) NOT NULL,
    `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`login_id`),
    UNIQUE KEY `username` (`username`),
    KEY `applicant_id` (`applicant_id`),
    CONSTRAINT `applicantlogincredentials_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.applicantlogincredentials: ~2 rows (approximately)
INSERT INTO `applicantlogincredentials` (`login_id`, `applicant_id`, `username`, `password`, `last_login`) VALUES
    (1, 1, 'APPLICANT@GMAIL.COM', 'applicant', '2025-11-29 17:45:56');

-- Dumping structure for table employee_management_system.applicants
CREATE TABLE IF NOT EXISTS `applicants` (
                                            `applicant_id` int NOT NULL AUTO_INCREMENT,
                                            `first_name` varchar(30) NOT NULL,
    `middle_name` varchar(30) DEFAULT NULL,
    `last_name` varchar(30) NOT NULL,
    `suffix` varchar(10) DEFAULT NULL,
    `date_of_birth` date DEFAULT NULL,
    `sex` enum('MALE','FEMALE') DEFAULT NULL,
    `address` varchar(100) DEFAULT NULL,
    `contact_number` varchar(11) DEFAULT NULL,
    `marital_status` varchar(25) DEFAULT NULL,
    `email` varchar(100) NOT NULL,
    `role_id` tinyint NOT NULL DEFAULT '3',
    `profile_path` varchar(255) DEFAULT '../../RES/profile.PNG',
    PRIMARY KEY (`applicant_id`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `contact_number` (`contact_number`),
    KEY `role_id` (`role_id`),
    CONSTRAINT `applicants_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.applicants: ~2 rows (approximately)
INSERT INTO `applicants` (`applicant_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `sex`, `address`, `contact_number`, `marital_status`, `email`, `role_id`, `profile_path`) VALUES
                                                                                                                                                                                                             (1, 'A', 'A', 'A', NULL, NULL, NULL, NULL, NULL, NULL, 'APPLICANT@GMAIL.COM', 3, '../../RES/profile.PNG'),
                                                                                                                                                                                                             (2, 'CHESTER NEMUEL', '', 'DELA CRUZ', NULL, NULL, 'MALE', '123 HOME ADDRESS ST. CITY NAME', '09123456789', 'SINGLE', 'REBADULLA_LANCEPATRICK@PLPASIG.EDU.PH', 3, '../../RES/Applicant-Profiles/applicant_2_1764479656.jpg');

-- Dumping structure for table employee_management_system.applicantskills
CREATE TABLE IF NOT EXISTS `applicantskills` (
                                                 `applicant_skills_id` bigint NOT NULL AUTO_INCREMENT,
                                                 `skills_list_id` int NOT NULL,
                                                 `applicant_id` int NOT NULL,
                                                 PRIMARY KEY (`applicant_skills_id`),
    KEY `applicant_id` (`applicant_id`),
    KEY `skills_list_id` (`skills_list_id`),
    CONSTRAINT `applicantskills_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`),
    CONSTRAINT `applicantskills_ibfk_2` FOREIGN KEY (`skills_list_id`) REFERENCES `skillslist` (`skills_list_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.applicantskills: ~5 rows (approximately)
INSERT INTO `applicantskills` (`applicant_skills_id`, `skills_list_id`, `applicant_id`) VALUES
                                                                                            (6, 2, 2),
                                                                                            (7, 4, 2),
                                                                                            (8, 1, 2),
                                                                                            (9, 3, 2),
                                                                                            (10, 5, 2);

-- Dumping structure for table employee_management_system.applications
CREATE TABLE IF NOT EXISTS `applications` (
                                              `application_id` bigint NOT NULL AUTO_INCREMENT,
                                              `applicant_id` int NOT NULL,
                                              `position_opening_id` int NOT NULL,
                                              `application_status` enum('ACCEPTED','REJECTED','ONGOING') NOT NULL,
    `score` decimal(4,2) DEFAULT '0.00',
    PRIMARY KEY (`application_id`),
    KEY `applicant_id` (`applicant_id`),
    KEY `position_opening_id` (`position_opening_id`),
    CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
    CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`position_opening_id`) REFERENCES `positionopening` (`position_opening_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.applications: ~0 rows (approximately)
INSERT INTO `applications` (`application_id`, `applicant_id`, `position_opening_id`, `application_status`, `score`) VALUES
    (2, 2, 1, 'ACCEPTED', 0.76);

-- Dumping structure for table employee_management_system.departments
CREATE TABLE IF NOT EXISTS `departments` (
                                             `department_id` tinyint NOT NULL AUTO_INCREMENT,
                                             `department_name` varchar(50) NOT NULL,
    PRIMARY KEY (`department_id`),
    UNIQUE KEY `department_name` (`department_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.departments: ~2 rows (approximately)
INSERT INTO `departments` (`department_id`, `department_name`) VALUES
                                                                   (1, 'HR'),
                                                                   (2, 'IT');

-- Dumping structure for table employee_management_system.documents
CREATE TABLE IF NOT EXISTS `documents` (
                                           `document_id` bigint NOT NULL AUTO_INCREMENT,
                                           `employee_id` int NOT NULL,
                                           `document_type_id` tinyint NOT NULL,
                                           `file_path` varchar(255) NOT NULL,
    `document_number` varchar(50) DEFAULT NULL,
    `upload_date` datetime NOT NULL,
    PRIMARY KEY (`document_id`),
    KEY `employee_id` (`employee_id`),
    KEY `document_type_id` (`document_type_id`),
    CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
    CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`document_type_id`) REFERENCES `documenttype` (`document_type_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.documents: ~0 rows (approximately)
INSERT INTO `documents` (`document_id`, `employee_id`, `document_type_id`, `file_path`, `document_number`, `upload_date`) VALUES
    (1, 2, 1, '../../RES/Employee-Documents/employee_2_philhealth_1764493968.jpg', '11-111111111-1', '2025-11-30 17:12:46');

-- Dumping structure for table employee_management_system.documenttype
CREATE TABLE IF NOT EXISTS `documenttype` (
                                              `document_type_id` tinyint NOT NULL AUTO_INCREMENT,
                                              `document_type` varchar(50) NOT NULL,
    `document_id_format` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`document_type_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.documenttype: ~6 rows (approximately)
INSERT INTO `documenttype` (`document_type_id`, `document_type`, `document_id_format`) VALUES
                                                                                           (1, 'PHILHEALTH', '##-#########-#'),
                                                                                           (2, 'DIPLOMA', NULL),
                                                                                           (3, 'SSS', '##-#######-#'),
                                                                                           (4, 'RESUME', NULL),
                                                                                           (5, 'PAGIBIG', '####-####-####'),
                                                                                           (6, 'TIN', '###-###-###-###');

-- Dumping structure for table employee_management_system.educationalattainmentlist
CREATE TABLE IF NOT EXISTS `educationalattainmentlist` (
                                                           `educational_attainment_id` tinyint NOT NULL AUTO_INCREMENT,
                                                           `educational_attainment_name` varchar(100) NOT NULL,
    PRIMARY KEY (`educational_attainment_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.educationalattainmentlist: ~8 rows (approximately)
INSERT INTO `educationalattainmentlist` (`educational_attainment_id`, `educational_attainment_name`) VALUES
                                                                                                         (1, 'ELEMENTARY UNDERGRADUATE'),
                                                                                                         (2, 'ELEMENTARY GRADUATE'),
                                                                                                         (3, 'JUNIOR HIGH SCHOOL UNDERGRADUATE'),
                                                                                                         (4, 'JUNIOR HIGH SCHOOL GRADUATE'),
                                                                                                         (5, 'SENIOR HIGH SCHOOL UNDERGRADUATE'),
                                                                                                         (6, 'SENIOR HIGH SCHOOL GRADUATE'),
                                                                                                         (7, 'COLLEGE UNDERGRADUATE'),
                                                                                                         (8, 'COLLEGE GRADUATE');

-- Dumping structure for table employee_management_system.educationalbackground
CREATE TABLE IF NOT EXISTS `educationalbackground` (
                                                       `ed_bg_id` bigint NOT NULL AUTO_INCREMENT,
                                                       `applicant_id` int NOT NULL,
                                                       `school_name` varchar(100) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `educational_attainment_id` tinyint NOT NULL,
    PRIMARY KEY (`ed_bg_id`),
    KEY `applicant_id` (`applicant_id`),
    KEY `educational_attainment_id` (`educational_attainment_id`),
    CONSTRAINT `educationalbackground_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
    CONSTRAINT `educationalbackground_ibfk_2` FOREIGN KEY (`educational_attainment_id`) REFERENCES `educationalattainmentlist` (`educational_attainment_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.educationalbackground: ~1 rows (approximately)
INSERT INTO `educationalbackground` (`ed_bg_id`, `applicant_id`, `school_name`, `start_date`, `end_date`, `educational_attainment_id`) VALUES
    (2, 2, 'PAMANTASAN NG LUNGSOD NG PASIG', '2023-08-28', '2025-09-29', 8);

-- Dumping structure for table employee_management_system.emergencycontacts
CREATE TABLE IF NOT EXISTS `emergencycontacts` (
                                                   `emergency_contact_id` int NOT NULL AUTO_INCREMENT,
                                                   `employee_id` int NOT NULL,
                                                   `contact_name` varchar(100) NOT NULL,
    `contact_number` varchar(11) NOT NULL,
    `relationship` varchar(50) NOT NULL,
    PRIMARY KEY (`emergency_contact_id`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `emergencycontacts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.emergencycontacts: ~0 rows (approximately)
INSERT INTO `emergencycontacts` (`emergency_contact_id`, `employee_id`, `contact_name`, `contact_number`, `relationship`) VALUES
    (1, 2, 'Edlan', '09132464444', 'Sibling');

-- Dumping structure for table employee_management_system.employees
CREATE TABLE IF NOT EXISTS `employees` (
                                           `employee_id` int NOT NULL,
                                           `first_name` varchar(30) NOT NULL,
    `middle_name` varchar(30) DEFAULT NULL,
    `last_name` varchar(30) NOT NULL,
    `suffix` varchar(10) DEFAULT NULL,
    `date_of_birth` date DEFAULT NULL,
    `sex` enum('MALE','FEMALE') DEFAULT NULL,
    `address` varchar(100) DEFAULT NULL,
    `contact_number` varchar(11) DEFAULT NULL,
    `marital_status` varchar(25) DEFAULT NULL,
    `email` varchar(100) NOT NULL,
    `salary` int NOT NULL,
    `department_id` tinyint NOT NULL,
    `position_id` tinyint NOT NULL,
    `role_id` tinyint NOT NULL,
    `employee_type_id` tinyint NOT NULL,
    `employee_schedule_id` int NOT NULL,
    `onboarding_stage_id` int NOT NULL,
    `profile_path` varchar(255) DEFAULT '../../RES/profile.PNG',
    PRIMARY KEY (`employee_id`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `contact_number` (`contact_number`),
    KEY `department_id` (`department_id`),
    KEY `position_id` (`position_id`),
    KEY `role_id` (`role_id`),
    KEY `employee_type_id` (`employee_type_id`),
    KEY `employee_schedule_id` (`employee_schedule_id`),
    KEY `onboarding_stage_id` (`onboarding_stage_id`),
    CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT,
    CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON DELETE RESTRICT,
    CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT,
    CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`employee_type_id`) REFERENCES `employeetype` (`employee_type_id`) ON DELETE RESTRICT,
    CONSTRAINT `employees_ibfk_5` FOREIGN KEY (`employee_schedule_id`) REFERENCES `employeeschedule` (`employee_schedule_id`),
    CONSTRAINT `employees_ibfk_6` FOREIGN KEY (`onboarding_stage_id`) REFERENCES `onboardingstage` (`onboarding_stage_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.employees: ~5 rows (approximately)
INSERT INTO `employees` (`employee_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `sex`, `address`, `contact_number`, `marital_status`, `email`, `salary`, `department_id`, `position_id`, `role_id`, `employee_type_id`, `employee_schedule_id`, `onboarding_stage_id`, `profile_path`) VALUES
                                                                                                                                                                                                                                                                                                                        (2, 'CHESTER NEMUEL', '', 'DELA CRUZ', NULL, NULL, 'MALE', '123 HOME ADDRESS ST. CITY NAME', '09123456789', 'SINGLE', 'REBADULLA_LANCEPATRICK@PLPASIG.EDU.PH', 7500, 1, 1, 2, 1, 1, 6, '../../RES/Applicant-Profiles/applicant_2_1764479656.jpg'),
                                                                                                                                                                                                                                                                                                                        (100, 'JERICO', 'A', 'MARQUEZ', NULL, '2000-10-26', 'MALE', 'Sa kanto', '09184429401', 'SINGLE', 'EMPLOYEE@GMAIL.COM', 50000, 2, 2, 2, 1, 1, 1, '../../RES/profile.PNG'),
                                                                                                                                                                                                                                                                                                                        (110, 'LANCE', 'A', 'REBADULLA', NULL, '1886-05-12', 'MALE', 'Sa kabilang kanto', '09588201401', 'SINGLE', 'HR@GMAIL.COM', 100000, 1, 1, 1, 1, 2, 2, '../../RES/profile.PNG'),
                                                                                                                                                                                                                                                                                                                        (120, 'JOMS', 'D', 'RODERICK', NULL, '1900-06-15', 'FEMALE', 'KATABI NI LANCE', '0947221192', 'SINGLE', 'TL@GMAIL.COM', 5, 1, 1, 4, 1, 3, 5, '../../RES/Employee-Profiles/employee_120_1764495774.png'),
                                                                                                                                                                                                                                                                                                                        (130, 'JOMS', 'D', 'RODERICK', NULL, '1900-06-15', 'FEMALE', 'KATABI NI LANCE', '0947285192', 'SINGLE', 'TL2@GMAIL.COM', 50, 2, 2, 4, 1, 4, 5, '../../RES/profile.PNG');

-- Dumping structure for table employee_management_system.employeeschedule
CREATE TABLE IF NOT EXISTS `employeeschedule` (
                                                  `employee_schedule_id` int NOT NULL AUTO_INCREMENT,
                                                  `schedule_time_id` tinyint NOT NULL,
                                                  `schedule_days_id` tinyint NOT NULL,
                                                  `schedule_hours` tinyint NOT NULL,
                                                  PRIMARY KEY (`employee_schedule_id`),
    KEY `schedule_time_id` (`schedule_time_id`),
    KEY `schedule_days_id` (`schedule_days_id`),
    CONSTRAINT `employeeschedule_ibfk_1` FOREIGN KEY (`schedule_time_id`) REFERENCES `scheduletimes` (`schedule_time_id`) ON DELETE RESTRICT,
    CONSTRAINT `employeeschedule_ibfk_2` FOREIGN KEY (`schedule_days_id`) REFERENCES `scheduledays` (`schedule_days_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.employeeschedule: ~4 rows (approximately)
INSERT INTO `employeeschedule` (`employee_schedule_id`, `schedule_time_id`, `schedule_days_id`, `schedule_hours`) VALUES
                                                                                                                      (1, 1, 1, 8),
                                                                                                                      (2, 1, 1, 8),
                                                                                                                      (3, 1, 1, 8),
                                                                                                                      (4, 2, 3, 8);

-- Dumping structure for table employee_management_system.employeestatus
CREATE TABLE IF NOT EXISTS `employeestatus` (
                                                `employee_status_id` bigint NOT NULL AUTO_INCREMENT,
                                                `employee_id` int NOT NULL,
                                                `status_name` varchar(100) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `description` varchar(1000) DEFAULT NULL,
    PRIMARY KEY (`employee_status_id`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `employeestatus_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.employeestatus: ~0 rows (approximately)

-- Dumping structure for table employee_management_system.employeetype
CREATE TABLE IF NOT EXISTS `employeetype` (
                                              `employee_type_id` tinyint NOT NULL AUTO_INCREMENT,
                                              `employee_type_name` varchar(100) NOT NULL,
    PRIMARY KEY (`employee_type_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.employeetype: ~3 rows (approximately)
INSERT INTO `employeetype` (`employee_type_id`, `employee_type_name`) VALUES
                                                                          (1, 'FULL TIME'),
                                                                          (2, 'CONTRACT'),
                                                                          (3, 'PROBATIONARY');

-- Dumping structure for table employee_management_system.feedback
CREATE TABLE IF NOT EXISTS `feedback` (
                                          `feedback_id` bigint NOT NULL AUTO_INCREMENT,
                                          `team_leader_id` int NOT NULL,
                                          `employee_id` int NOT NULL,
                                          `general_comments` text,
                                          `date_submitted` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                          PRIMARY KEY (`feedback_id`),
    KEY `team_leader_id` (`team_leader_id`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`team_leader_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
    CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.feedback: ~0 rows (approximately)
INSERT INTO `feedback` (`feedback_id`, `team_leader_id`, `employee_id`, `general_comments`, `date_submitted`) VALUES
    (1, 120, 2, 'goodjob!', '2025-11-30 17:28:34');

-- Dumping structure for table employee_management_system.feedbacktraitlist
CREATE TABLE IF NOT EXISTS `feedbacktraitlist` (
                                                   `trait_id` int NOT NULL AUTO_INCREMENT,
                                                   `trait_name` varchar(100) NOT NULL,
    PRIMARY KEY (`trait_id`),
    UNIQUE KEY `trait_name` (`trait_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.feedbacktraitlist: ~2 rows (approximately)
INSERT INTO `feedbacktraitlist` (`trait_id`, `trait_name`) VALUES
                                                               (3, 'Fire Aspect'),
                                                               (1, 'Obedience'),
                                                               (2, 'Sharpness');

-- Dumping structure for table employee_management_system.feedbacktraits
CREATE TABLE IF NOT EXISTS `feedbacktraits` (
                                                `feedback_trait_id` bigint NOT NULL AUTO_INCREMENT,
                                                `feedback_id` bigint NOT NULL,
                                                `trait_id` int NOT NULL,
                                                `rating` tinyint NOT NULL,
                                                `comments` text,
                                                PRIMARY KEY (`feedback_trait_id`),
    KEY `feedback_id` (`feedback_id`),
    KEY `trait_id` (`trait_id`),
    CONSTRAINT `feedbacktraits_ibfk_1` FOREIGN KEY (`feedback_id`) REFERENCES `feedback` (`feedback_id`) ON DELETE CASCADE,
    CONSTRAINT `feedbacktraits_ibfk_2` FOREIGN KEY (`trait_id`) REFERENCES `feedbacktraitlist` (`trait_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.feedbacktraits: ~2 rows (approximately)
INSERT INTO `feedbacktraits` (`feedback_trait_id`, `feedback_id`, `trait_id`, `rating`, `comments`) VALUES
                                                                                                        (1, 1, 1, 5, 'always listening to orders like a good dog.'),
                                                                                                        (2, 1, 2, 3, 'Sharpness V'),
                                                                                                        (3, 1, 3, 1, 'Fire Aspect I');

-- Dumping structure for table employee_management_system.interviews
CREATE TABLE IF NOT EXISTS `interviews` (
                                            `interview_id` bigint NOT NULL AUTO_INCREMENT,
                                            `applicant_id` int DEFAULT NULL,
                                            `interviewer_id` int DEFAULT NULL,
                                            `position_opening_id` int DEFAULT NULL,
                                            `interview_count` int DEFAULT '1',
                                            `interview_date` datetime DEFAULT NULL,
                                            `interview_status` enum('ACCEPTED','REJECTED','ONGOING') DEFAULT 'ONGOING',
    PRIMARY KEY (`interview_id`),
    UNIQUE KEY `applicant_id` (`applicant_id`,`position_opening_id`,`interview_date`,`interview_count`),
    KEY `position_opening_id` (`position_opening_id`),
    KEY `interviewer_id` (`interviewer_id`),
    CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`),
    CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`position_opening_id`) REFERENCES `positionopening` (`position_opening_id`),
    CONSTRAINT `interviews_ibfk_3` FOREIGN KEY (`interviewer_id`) REFERENCES `employees` (`employee_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.interviews: ~1 rows (approximately)
INSERT INTO `interviews` (`interview_id`, `applicant_id`, `interviewer_id`, `position_opening_id`, `interview_count`, `interview_date`, `interview_status`) VALUES
    (3, 2, NULL, 1, 4, NULL, 'ACCEPTED');

-- Dumping structure for table employee_management_system.leavetype
CREATE TABLE IF NOT EXISTS `leavetype` (
                                           `leave_type_id` tinyint NOT NULL AUTO_INCREMENT,
                                           `leave_name` varchar(20) NOT NULL,
    `leave_amount` tinyint NOT NULL,
    PRIMARY KEY (`leave_type_id`),
    UNIQUE KEY `leave_name` (`leave_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.leavetype: ~4 rows (approximately)
INSERT INTO `leavetype` (`leave_type_id`, `leave_name`, `leave_amount`) VALUES
                                                                            (1, 'MANDATORY', 10),
                                                                            (2, 'SICK', 10),
                                                                            (3, 'ANNUAL', 12),
                                                                            (4, 'MATERNITY', 1);

-- Dumping structure for table employee_management_system.logincredentials
CREATE TABLE IF NOT EXISTS `logincredentials` (
                                                  `login_id` int NOT NULL AUTO_INCREMENT,
                                                  `employee_id` int NOT NULL,
                                                  `username` varchar(50) NOT NULL,
    `password` varchar(200) NOT NULL,
    `last_login` date NOT NULL,
    PRIMARY KEY (`login_id`),
    UNIQUE KEY `username` (`username`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `logincredentials_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.logincredentials: ~4 rows (approximately)
INSERT INTO `logincredentials` (`login_id`, `employee_id`, `username`, `password`, `last_login`) VALUES
                                                                                                     (1, 100, 'EMPLOYEE@GMAIL.COM', 'employee', '2025-11-30'),
                                                                                                     (2, 110, 'HR@GMAIL.COM', 'hr', '2025-12-01'),
                                                                                                     (3, 120, 'TL@GMAIL.COM', 'tl1', '2025-11-30'),
                                                                                                     (4, 130, 'TL2@GMAIL.COM', 'tl2', '2025-11-29'),
                                                                                                     (5, 2, 'REBADULLA_LANCEPATRICK@PLPASIG.EDU.PH', '$2y$10$SDhrbCNKNk2gI2DuIoQVhu1E7x731ngN2EWFEXyQQQf2n6rq7NXES', '2025-11-30');

-- Dumping structure for table employee_management_system.logs
CREATE TABLE IF NOT EXISTS `logs` (
                                      `logs_id` bigint NOT NULL AUTO_INCREMENT,
                                      `logs_category_id` tinyint NOT NULL,
                                      `description` varchar(500) NOT NULL,
    `date` datetime NOT NULL,
    `employee_id` int NOT NULL,
    PRIMARY KEY (`logs_id`),
    KEY `logs_category_id` (`logs_category_id`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`logs_category_id`) REFERENCES `logscategory` (`logs_category_id`),
    CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.logs: ~29 rows (approximately)
INSERT INTO `logs` (`logs_id`, `logs_category_id`, `description`, `date`, `employee_id`) VALUES
                                                                                             (1, 1, 'User logged into the system', '2025-11-30 13:57:39', 100),
                                                                                             (2, 2, 'User logged out of the system', '2025-11-30 13:59:50', 100),
                                                                                             (3, 1, 'User logged into the system', '2025-11-30 16:49:35', 2),
                                                                                             (4, 1, 'User logged into the system', '2025-11-30 16:49:36', 2),
                                                                                             (5, 2, 'User logged out of the system', '2025-11-30 16:52:27', 2),
                                                                                             (6, 1, 'User logged into the system', '2025-11-30 16:52:35', 2),
                                                                                             (7, 2, 'User logged out of the system', '2025-11-30 17:22:37', 2),
                                                                                             (8, 1, 'User logged into the system', '2025-11-30 17:22:58', 110),
                                                                                             (9, 2, 'User logged out of the system', '2025-11-30 17:23:20', 110),
                                                                                             (10, 1, 'User logged into the system', '2025-11-30 17:23:28', 110),
                                                                                             (11, 2, 'User logged out of the system', '2025-11-30 17:26:10', 110),
                                                                                             (12, 1, 'User logged into the system', '2025-11-30 17:26:15', 110),
                                                                                             (13, 2, 'User logged out of the system', '2025-11-30 17:26:48', 110),
                                                                                             (14, 1, 'User logged into the system', '2025-11-30 17:27:02', 120),
                                                                                             (15, 2, 'User logged out of the system', '2025-11-30 17:28:40', 120),
                                                                                             (16, 1, 'User logged into the system', '2025-11-30 17:28:47', 2),
                                                                                             (17, 2, 'User logged out of the system', '2025-11-30 17:40:41', 2),
                                                                                             (18, 1, 'User logged into the system', '2025-11-30 17:40:50', 110),
                                                                                             (19, 2, 'User logged out of the system', '2025-11-30 17:41:20', 110),
                                                                                             (20, 1, 'User logged into the system', '2025-11-30 17:41:31', 110),
                                                                                             (21, 2, 'User logged out of the system', '2025-11-30 17:41:43', 110),
                                                                                             (22, 1, 'User logged into the system', '2025-11-30 17:41:59', 120),
                                                                                             (23, 2, 'User logged out of the system', '2025-11-30 17:45:33', 120),
                                                                                             (24, 1, 'User logged into the system', '2025-11-30 18:40:47', 2),
                                                                                             (25, 1, 'User logged into the system', '2025-11-30 19:52:32', 2),
                                                                                             (26, 3, 'Added emergency contact information', '2025-11-30 19:52:57', 2),
                                                                                             (27, 4, 'Updated emergency contact information', '2025-11-30 19:52:58', 2),
                                                                                             (28, 4, 'Updated emergency contact information', '2025-11-30 19:53:09', 2),
                                                                                             (29, 4, 'Updated emergency contact information', '2025-11-30 19:57:58', 2);

-- Dumping structure for table employee_management_system.logscategory
CREATE TABLE IF NOT EXISTS `logscategory` (
                                              `logs_category_id` tinyint NOT NULL AUTO_INCREMENT,
                                              `log_type` varchar(10) NOT NULL,
    PRIMARY KEY (`logs_category_id`),
    UNIQUE KEY `log_type` (`log_type`)
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.logscategory: ~4 rows (approximately)
INSERT INTO `logscategory` (`logs_category_id`, `log_type`) VALUES
                                                                (3, 'CREATE'),
                                                                (1, 'LOGIN'),
                                                                (2, 'LOGOUT'),
                                                                (4, 'UPDATE');

-- Dumping structure for table employee_management_system.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
                                               `notification_id` bigint NOT NULL AUTO_INCREMENT,
                                               `employee_id` int DEFAULT NULL,
                                               `applicant_id` int DEFAULT NULL,
                                               `notification_title` varchar(50) NOT NULL,
    `notification_description` varchar(50) NOT NULL,
    `date_sent` datetime DEFAULT NULL,
    `is_read` tinyint(1) NOT NULL DEFAULT '0',
    PRIMARY KEY (`notification_id`),
    KEY `employee_id` (`employee_id`),
    KEY `applicant_id` (`applicant_id`) USING BTREE,
    CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
    CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.notifications: ~8 rows (approximately)
INSERT INTO `notifications` (`notification_id`, `employee_id`, `applicant_id`, `notification_title`, `notification_description`, `date_sent`, `is_read`) VALUES
                                                                                                                                                             (1, NULL, 1, 'Application Submitted', 'Applied for: HR MANAGER', '2025-11-25 13:43:23', 1),
                                                                                                                                                             (2, NULL, 1, 'Application Status Update', 'Your application for HR MANAGER', '2025-11-26 13:43:23', 1),
                                                                                                                                                             (3, NULL, 1, 'Interview Scheduled', 'Interview for HR MANAGER - Round 1', '2025-11-27 13:43:23', 1),
                                                                                                                                                             (4, NULL, 1, 'Interview Result', 'You passed Round 1 for HR MANAGER', '2025-11-28 13:43:23', 0),
                                                                                                                                                             (5, NULL, 1, 'Interview Scheduled', 'Interview for HR MANAGER - Round 2', '2025-11-29 13:43:23', 0),
                                                                                                                                                             (20, NULL, 1, 'Application Status Update', 'Your application is under review', '2025-11-30 07:43:23', 0),
                                                                                                                                                             (21, NULL, 1, 'Interview Rescheduled', 'Interview for HR MANAGER rescheduled', '2025-11-30 10:43:23', 0),
                                                                                                                                                             (22, NULL, 1, 'Interview Result', 'You were not selected for Round 2', '2025-11-30 12:43:23', 0),
                                                                                                                                                             (50, 2, NULL, 'Documents Uploaded', 'PHILHEALTH', '2025-11-30 17:12:46', 1),
                                                                                                                                                             (51, 2, NULL, 'New Feedback Received', 'From: JOMS RODERICK', '2025-11-30 17:28:35', 1);

-- Dumping structure for table employee_management_system.onboardingstage
CREATE TABLE IF NOT EXISTS `onboardingstage` (
                                                 `onboarding_stage_id` int NOT NULL AUTO_INCREMENT,
                                                 `onboarding_stage_type_id` tinyint NOT NULL,
                                                 `onboarding_progress` tinyint NOT NULL,
                                                 PRIMARY KEY (`onboarding_stage_id`),
    KEY `onboarding_stage_type_id` (`onboarding_stage_type_id`),
    CONSTRAINT `onboardingstage_ibfk_1` FOREIGN KEY (`onboarding_stage_type_id`) REFERENCES `onboardingstagetype` (`onboarding_stage_type_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.onboardingstage: ~5 rows (approximately)
INSERT INTO `onboardingstage` (`onboarding_stage_id`, `onboarding_stage_type_id`, `onboarding_progress`) VALUES
                                                                                                             (1, 1, 20),
                                                                                                             (2, 2, 40),
                                                                                                             (3, 3, 60),
                                                                                                             (4, 4, 80),
                                                                                                             (5, 5, 100),
                                                                                                             (6, 1, 0);

-- Dumping structure for table employee_management_system.onboardingstagetype
CREATE TABLE IF NOT EXISTS `onboardingstagetype` (
                                                     `onboarding_stage_type_id` tinyint NOT NULL AUTO_INCREMENT,
                                                     `onboarding_stage_type_name` varchar(50) NOT NULL,
    PRIMARY KEY (`onboarding_stage_type_id`),
    UNIQUE KEY `onboarding_stage_type_name` (`onboarding_stage_type_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.onboardingstagetype: ~5 rows (approximately)
INSERT INTO `onboardingstagetype` (`onboarding_stage_type_id`, `onboarding_stage_type_name`) VALUES
                                                                                                 (5, 'COMPLETED'),
                                                                                                 (3, 'EMPLOYEE TRAINING'),
                                                                                                 (2, 'ORIENTATION'),
                                                                                                 (1, 'REQUIREMENT SUBMISSION'),
                                                                                                 (4, 'SHADOWING');

-- Dumping structure for table employee_management_system.positionopening
CREATE TABLE IF NOT EXISTS `positionopening` (
                                                 `position_opening_id` int NOT NULL AUTO_INCREMENT,
                                                 `position_id` tinyint NOT NULL,
                                                 `start_date` date NOT NULL,
                                                 `end_date` date NOT NULL,
                                                 `is_open` tinyint(1) NOT NULL DEFAULT '0',
    `work_experience` tinyint(1) NOT NULL,
    `educational_attainment_id` tinyint NOT NULL,
    `employee_type_id` tinyint NOT NULL,
    `department_id` tinyint NOT NULL,
    PRIMARY KEY (`position_opening_id`),
    KEY `position_id` (`position_id`),
    KEY `employee_type_id` (`employee_type_id`),
    KEY `department_id` (`department_id`),
    CONSTRAINT `positionopening_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON DELETE CASCADE,
    CONSTRAINT `positionopening_ibfk_2` FOREIGN KEY (`employee_type_id`) REFERENCES `employeetype` (`employee_type_id`) ON DELETE CASCADE,
    CONSTRAINT `positionopening_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.positionopening: ~2 rows (approximately)
INSERT INTO `positionopening` (`position_opening_id`, `position_id`, `start_date`, `end_date`, `is_open`, `work_experience`, `educational_attainment_id`, `employee_type_id`, `department_id`) VALUES
                                                                                                                                                                                                   (1, 1, '2025-11-29', '2025-12-29', 1, 1, 7, 1, 1),
                                                                                                                                                                                                   (2, 2, '2025-11-29', '2025-12-29', 1, 1, 8, 1, 2);

-- Dumping structure for table employee_management_system.positions
CREATE TABLE IF NOT EXISTS `positions` (
                                           `position_id` tinyint NOT NULL AUTO_INCREMENT,
                                           `position_name` varchar(50) NOT NULL,
    `position_description` varchar(1000) NOT NULL,
    `position_min_salary` int NOT NULL,
    `position_max_salary` int NOT NULL,
    PRIMARY KEY (`position_id`),
    UNIQUE KEY `position_name` (`position_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.positions: ~2 rows (approximately)
INSERT INTO `positions` (`position_id`, `position_name`, `position_description`, `position_min_salary`, `position_max_salary`) VALUES
                                                                                                                                   (1, 'HR MANAGER', 'ang batas', 5000, 10000),
                                                                                                                                   (2, 'NETWORK ADMIN', 'mga tulog', 50000, 150000);

-- Dumping structure for table employee_management_system.positionskillsrequired
CREATE TABLE IF NOT EXISTS `positionskillsrequired` (
                                                        `skills_required_id` bigint NOT NULL AUTO_INCREMENT,
                                                        `position_opening_id` int NOT NULL,
                                                        `skills_list_id` int NOT NULL,
                                                        PRIMARY KEY (`skills_required_id`),
    KEY `position_opening_id` (`position_opening_id`),
    KEY `skills_list_id` (`skills_list_id`),
    CONSTRAINT `positionskillsrequired_ibfk_1` FOREIGN KEY (`position_opening_id`) REFERENCES `positionopening` (`position_opening_id`) ON DELETE RESTRICT,
    CONSTRAINT `positionskillsrequired_ibfk_2` FOREIGN KEY (`skills_list_id`) REFERENCES `skillslist` (`skills_list_id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.positionskillsrequired: ~0 rows (approximately)

-- Dumping structure for table employee_management_system.promotionrecords
CREATE TABLE IF NOT EXISTS `promotionrecords` (
                                                  `promotion_records_id` bigint NOT NULL AUTO_INCREMENT,
                                                  `old_position_id` tinyint NOT NULL,
                                                  `new_position_id` tinyint NOT NULL,
                                                  `employee_id` int NOT NULL,
                                                  `date` datetime DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (`promotion_records_id`),
    KEY `old_position_id` (`old_position_id`),
    KEY `new_position_id` (`new_position_id`),
    KEY `employee_id` (`employee_id`),
    CONSTRAINT `promotionrecords_ibfk_1` FOREIGN KEY (`old_position_id`) REFERENCES `positions` (`position_id`),
    CONSTRAINT `promotionrecords_ibfk_2` FOREIGN KEY (`new_position_id`) REFERENCES `positions` (`position_id`),
    CONSTRAINT `promotionrecords_ibfk_3` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.promotionrecords: ~0 rows (approximately)

-- Dumping structure for table employee_management_system.remainingleaves
CREATE TABLE IF NOT EXISTS `remainingleaves` (
                                                 `leave_id` bigint NOT NULL AUTO_INCREMENT,
                                                 `employee_id` int NOT NULL,
                                                 `leave_type_id` tinyint NOT NULL,
                                                 `num_of_leaves` tinyint NOT NULL,
                                                 PRIMARY KEY (`leave_id`),
    UNIQUE KEY `employee_id` (`employee_id`,`leave_type_id`),
    KEY `leave_type_id` (`leave_type_id`),
    CONSTRAINT `remainingleaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
    CONSTRAINT `remainingleaves_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leavetype` (`leave_type_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.remainingleaves: ~19 rows (approximately)
INSERT INTO `remainingleaves` (`leave_id`, `employee_id`, `leave_type_id`, `num_of_leaves`) VALUES
                                                                                                (1, 100, 1, 9),
                                                                                                (2, 100, 2, 10),
                                                                                                (3, 100, 3, 12),
                                                                                                (4, 100, 4, 1),
                                                                                                (5, 110, 1, 10),
                                                                                                (6, 110, 2, 10),
                                                                                                (7, 110, 3, 12),
                                                                                                (8, 110, 4, 1),
                                                                                                (9, 120, 1, 10),
                                                                                                (10, 120, 2, 10),
                                                                                                (11, 120, 3, 12),
                                                                                                (12, 120, 4, 1),
                                                                                                (13, 130, 1, 10),
                                                                                                (14, 130, 2, 10),
                                                                                                (15, 130, 3, 12),
                                                                                                (16, 130, 4, 1),
                                                                                                (17, 2, 1, 10),
                                                                                                (18, 2, 2, 10),
                                                                                                (19, 2, 3, 12),
                                                                                                (20, 2, 4, 1);

-- Dumping structure for table employee_management_system.roles
CREATE TABLE IF NOT EXISTS `roles` (
                                       `role_id` tinyint NOT NULL AUTO_INCREMENT,
                                       `role_name` varchar(50) NOT NULL,
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `role_name` (`role_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.roles: ~4 rows (approximately)
INSERT INTO `roles` (`role_id`, `role_name`) VALUES
                                                 (3, 'APPLICANT'),
                                                 (2, 'EMPLOYEE'),
                                                 (1, 'HR'),
                                                 (4, 'TEAM LEADER');

-- Dumping structure for table employee_management_system.scheduledays
CREATE TABLE IF NOT EXISTS `scheduledays` (
                                              `schedule_days_id` tinyint NOT NULL AUTO_INCREMENT,
                                              `schedule_days_description` varchar(50) NOT NULL,
    PRIMARY KEY (`schedule_days_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.scheduledays: ~4 rows (approximately)
INSERT INTO `scheduledays` (`schedule_days_id`, `schedule_days_description`) VALUES
                                                                                 (1, 'MON - FRI'),
                                                                                 (2, 'TUE - SAT'),
                                                                                 (3, 'MON - SAT'),
                                                                                 (4, 'SUN - THU');

-- Dumping structure for table employee_management_system.scheduletimes
CREATE TABLE IF NOT EXISTS `scheduletimes` (
                                               `schedule_time_id` tinyint NOT NULL AUTO_INCREMENT,
                                               `schedule_time_description` time NOT NULL,
                                               PRIMARY KEY (`schedule_time_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.scheduletimes: ~5 rows (approximately)
INSERT INTO `scheduletimes` (`schedule_time_id`, `schedule_time_description`) VALUES
                                                                                  (1, '08:00:00'),
                                                                                  (2, '07:00:00'),
                                                                                  (3, '09:00:00'),
                                                                                  (4, '10:00:00'),
                                                                                  (5, '22:00:00');

-- Dumping structure for table employee_management_system.skillslist
CREATE TABLE IF NOT EXISTS `skillslist` (
                                            `skills_list_id` int NOT NULL AUTO_INCREMENT,
                                            `skill_name` varchar(30) NOT NULL,
    PRIMARY KEY (`skills_list_id`),
    UNIQUE KEY `skill_name` (`skill_name`)
    ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.skillslist: ~5 rows (approximately)
INSERT INTO `skillslist` (`skills_list_id`, `skill_name`) VALUES
                                                              (2, 'CSS'),
                                                              (4, 'FIGMA'),
                                                              (1, 'HTML'),
                                                              (3, 'JAVASCRIPT'),
                                                              (5, 'WHALE');

-- Dumping structure for table employee_management_system.workexperience
CREATE TABLE IF NOT EXISTS `workexperience` (
                                                `wo_ex_id` bigint NOT NULL AUTO_INCREMENT,
                                                `applicant_id` int NOT NULL,
                                                `company_name` varchar(30) NOT NULL,
    `position` varchar(30) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `duties_responsibilities` varchar(30) NOT NULL,
    PRIMARY KEY (`wo_ex_id`),
    KEY `applicant_id` (`applicant_id`),
    CONSTRAINT `workexperience_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table employee_management_system.workexperience: ~1 rows (approximately)
INSERT INTO `workexperience` (`wo_ex_id`, `applicant_id`, `company_name`, `position`, `start_date`, `end_date`, `duties_responsibilities`) VALUES
    (2, 2, 'ABC COMPANY', 'FRONT ENDER', '2024-01-09', '2025-11-12', 'CREATING PROBLEMS TO FIX');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- 2. RE-ENABLE foreign key checks
SET FOREIGN_KEY_CHECKS = 1;