CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(10) NOT NULL,
	`state` varchar(100) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_name_unique` UNIQUE(`name`),
	CONSTRAINT `cities_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`areaName` varchar(255) NOT NULL,
	`deliveryTimeMinutes` int NOT NULL,
	`isServiceable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productPricingId` int NOT NULL,
	`deliveryZoneId` int NOT NULL,
	`priceMultiplier` decimal(4,2) NOT NULL DEFAULT '1.00',
	`adjustedPrice` int NOT NULL,
	`stockStatus` enum('in_stock','low_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `location_pricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_coverage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platformId` int NOT NULL,
	`deliveryZoneId` int NOT NULL,
	`deliveryFee` int NOT NULL,
	`freeDeliveryThreshold` int,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_coverage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cityId` int NOT NULL,
	`deliveryZoneId` int NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`address` text,
	`isPrimary` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_locations_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `state_idx` ON `cities` (`state`);--> statement-breakpoint
CREATE INDEX `city_name_idx` ON `cities` (`name`);--> statement-breakpoint
CREATE INDEX `city_id_idx` ON `delivery_zones` (`cityId`);--> statement-breakpoint
CREATE INDEX `pincode_idx` ON `delivery_zones` (`pincode`);--> statement-breakpoint
CREATE INDEX `product_zone_idx` ON `location_pricing` (`productPricingId`,`deliveryZoneId`);--> statement-breakpoint
CREATE INDEX `platform_zone_idx` ON `platform_coverage` (`platformId`,`deliveryZoneId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_locations` (`userId`);--> statement-breakpoint
CREATE INDEX `city_id_idx` ON `user_locations` (`cityId`);--> statement-breakpoint
CREATE INDEX `pincode_idx` ON `user_locations` (`pincode`);