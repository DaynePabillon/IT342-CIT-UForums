-- Create tables in the correct order to handle foreign key dependencies

-- First create the base tables without foreign key dependencies
CREATE TABLE IF NOT EXISTS `forum_categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS `members` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(50),
    `last_name` VARCHAR(50),
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    `active` BOOLEAN DEFAULT TRUE NOT NULL,
    `admin` BOOLEAN DEFAULT FALSE NOT NULL
);

-- Then create tables that depend on the base tables
CREATE TABLE IF NOT EXISTS `forums` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(1000),
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    `last_activity` DATETIME,
    `category_id` BIGINT NOT NULL,
    `created_by_id` BIGINT NOT NULL,
    FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`),
    FOREIGN KEY (`created_by_id`) REFERENCES `members`(`id`)
);

CREATE TABLE IF NOT EXISTS `threads` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    `last_activity` DATETIME,
    `forum_id` BIGINT NOT NULL,
    `author_id` BIGINT NOT NULL,
    `created_by_id` BIGINT NOT NULL,
    `pinned` BOOLEAN DEFAULT FALSE NOT NULL,
    `locked` BOOLEAN DEFAULT FALSE NOT NULL,
    `view_count` INT DEFAULT 0 NOT NULL,
    FOREIGN KEY (`forum_id`) REFERENCES `forums`(`id`),
    FOREIGN KEY (`author_id`) REFERENCES `members`(`id`),
    FOREIGN KEY (`created_by_id`) REFERENCES `members`(`id`)
);

-- Drop the posts table if it exists to ensure clean state
DROP TABLE IF EXISTS `posts`;

CREATE TABLE IF NOT EXISTS `posts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    `thread_id` BIGINT NOT NULL,
    `author_id` BIGINT NOT NULL,
    `edited` BOOLEAN DEFAULT FALSE NOT NULL,
    `active` BOOLEAN DEFAULT TRUE NOT NULL,
    FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`),
    FOREIGN KEY (`author_id`) REFERENCES `members`(`id`)
);

CREATE TABLE IF NOT EXISTS `comments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `content` VARCHAR(1000) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME,
    `post_id` BIGINT NOT NULL,
    `thread_id` BIGINT,
    `author_id` BIGINT NOT NULL,
    `edited` BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`),
    FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`),
    FOREIGN KEY (`author_id`) REFERENCES `members`(`id`)
); 
 