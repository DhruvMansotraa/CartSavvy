CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'My Cart',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`logoUrl` varchar(512),
	`avgDeliveryTime` int NOT NULL,
	`baseDeliveryFee` int NOT NULL,
	`minOrderValue` int NOT NULL,
	`apiEndpoint` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `platforms_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `price_drop_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`platformId` int NOT NULL,
	`previousPrice` int NOT NULL,
	`newPrice` int NOT NULL,
	`savings` int NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_drop_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productPricingId` int NOT NULL,
	`price` int NOT NULL,
	`discountPercent` int NOT NULL,
	`finalPrice` int NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`platformId` int NOT NULL,
	`price` int NOT NULL,
	`discountPercent` int NOT NULL DEFAULT 0,
	`finalPrice` int NOT NULL,
	`stockStatus` enum('in_stock','low_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
	`platformProductId` varchar(255),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_pricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`standardQuantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`imageUrl` varchar(512),
	`keywords` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`notifyOnPriceDrop` boolean NOT NULL DEFAULT true,
	`lastKnownPrice` int,
	`preferredPlatformId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredCategories` text,
	`preferredPlatforms` text,
	`budgetPreference` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`showRecommendations` boolean NOT NULL DEFAULT true,
	`enablePriceAlerts` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `cart_id_idx` ON `cart_items` (`cartId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `cart_items` (`productId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `carts` (`userId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `price_drop_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `price_drop_notifications` (`productId`);--> statement-breakpoint
CREATE INDEX `product_pricing_idx` ON `price_history` (`productPricingId`);--> statement-breakpoint
CREATE INDEX `recorded_at_idx` ON `price_history` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `product_platform_idx` ON `product_pricing` (`productId`,`platformId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `products` (`name`);--> statement-breakpoint
CREATE INDEX `user_product_idx` ON `saved_products` (`userId`,`productId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_preferences` (`userId`);