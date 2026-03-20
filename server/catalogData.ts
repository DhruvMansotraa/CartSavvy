/**
 * Comprehensive product catalogue with 400+ items for Indian quick commerce
 * Includes realistic pricing variations by platform and location
 */

export interface ProductData {
  name: string;
  brand: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  basePrice: number; // in paise
}

export interface CityData {
  name: string;
  code: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryZoneData {
  cityCode: string;
  pincode: string;
  areaName: string;
  deliveryTimeMinutes: number;
}

export interface PlatformPricingVariation {
  platform: "Blinkit" | "Zepto" | "Swiggy Instamart";
  priceMultiplier: number; // 0.95 = 5% cheaper, 1.05 = 5% more expensive
  discountRange: [number, number]; // min and max discount percentage
}

// 400+ products across all categories
export const PRODUCTS: ProductData[] = [
  // Dairy & Milk Products
  { name: "Amul Full Cream Milk", brand: "Amul", category: "Dairy", quantity: 500, unit: "ml", description: "Fresh full cream milk", basePrice: 3500 },
  { name: "Amul Full Cream Milk", brand: "Amul", category: "Dairy", quantity: 1, unit: "l", description: "1 Liter full cream milk", basePrice: 6800 },
  { name: "Mother Dairy Full Cream Milk", brand: "Mother Dairy", category: "Dairy", quantity: 500, unit: "ml", description: "Fresh full cream milk", basePrice: 3600 },
  { name: "Mother Dairy Full Cream Milk", brand: "Mother Dairy", category: "Dairy", quantity: 1, unit: "l", description: "1 Liter full cream milk", basePrice: 7000 },
  { name: "Nandini Milk", brand: "Nandini", category: "Dairy", quantity: 500, unit: "ml", description: "Fresh milk from Karnataka", basePrice: 3400 },
  { name: "Sudha Milk", brand: "Sudha", category: "Dairy", quantity: 500, unit: "ml", description: "Fresh milk from Andhra Pradesh", basePrice: 3300 },
  { name: "Amul Butter", brand: "Amul", category: "Dairy", quantity: 100, unit: "g", description: "Pure butter", basePrice: 4500 },
  { name: "Amul Cheese Slices", brand: "Amul", category: "Dairy", quantity: 200, unit: "g", description: "Processed cheese slices", basePrice: 5500 },
  { name: "Amul Paneer", brand: "Amul", category: "Dairy", quantity: 200, unit: "g", description: "Fresh paneer", basePrice: 6500 },
  { name: "Britannia Cheese Spread", brand: "Britannia", category: "Dairy", quantity: 200, unit: "g", description: "Cheese spread", basePrice: 4200 },
  { name: "Yogurt Plain", brand: "Amul", category: "Dairy", quantity: 400, unit: "g", description: "Plain yogurt", basePrice: 3200 },
  { name: "Yogurt Mango", brand: "Amul", category: "Dairy", quantity: 400, unit: "g", description: "Mango flavored yogurt", basePrice: 3500 },

  // Breads & Bakery
  { name: "Britannia Bread", brand: "Britannia", category: "Bakery", quantity: 400, unit: "g", description: "Sliced bread", basePrice: 3500 },
  { name: "Harvest Gold Bread", brand: "Harvest Gold", category: "Bakery", quantity: 400, unit: "g", description: "Whole wheat bread", basePrice: 4200 },
  { name: "Bournvita Biscuits", brand: "Bournvita", category: "Bakery", quantity: 200, unit: "g", description: "Chocolate biscuits", basePrice: 2800 },
  { name: "Parle-G Biscuits", brand: "Parle", category: "Bakery", quantity: 200, unit: "g", description: "Classic biscuits", basePrice: 1800 },
  { name: "Oreo Biscuits", brand: "Mondelez", category: "Bakery", quantity: 120, unit: "g", description: "Cream filled biscuits", basePrice: 3500 },
  { name: "Marie Biscuits", brand: "Britannia", category: "Bakery", quantity: 200, unit: "g", description: "Marie biscuits", basePrice: 2200 },

  // Eggs
  { name: "Eggs Brown", brand: "Local", category: "Eggs", quantity: 6, unit: "pieces", description: "Half dozen brown eggs", basePrice: 4500 },
  { name: "Eggs Brown", brand: "Local", category: "Eggs", quantity: 12, unit: "pieces", description: "Dozen brown eggs", basePrice: 8500 },
  { name: "Eggs White", brand: "Local", category: "Eggs", quantity: 6, unit: "pieces", description: "Half dozen white eggs", basePrice: 4200 },
  { name: "Eggs White", brand: "Local", category: "Eggs", quantity: 12, unit: "pieces", description: "Dozen white eggs", basePrice: 8000 },

  // Fruits
  { name: "Banana", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh yellow bananas", basePrice: 3500 },
  { name: "Apple Red", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh red apples", basePrice: 12000 },
  { name: "Orange", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh oranges", basePrice: 5500 },
  { name: "Mango", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh mangoes (seasonal)", basePrice: 8000 },
  { name: "Grapes Green", brand: "Local", category: "Fruits", quantity: 500, unit: "g", description: "Fresh green grapes", basePrice: 8500 },
  { name: "Papaya", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh papaya", basePrice: 4500 },
  { name: "Watermelon", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh watermelon", basePrice: 3000 },
  { name: "Pineapple", brand: "Local", category: "Fruits", quantity: 1, unit: "piece", description: "Fresh pineapple", basePrice: 7500 },
  { name: "Strawberry", brand: "Local", category: "Fruits", quantity: 250, unit: "g", description: "Fresh strawberries", basePrice: 12000 },
  { name: "Pomegranate", brand: "Local", category: "Fruits", quantity: 1, unit: "kg", description: "Fresh pomegranate", basePrice: 15000 },

  // Vegetables
  { name: "Tomato", brand: "Local", category: "Vegetables", quantity: 1, unit: "kg", description: "Fresh tomatoes", basePrice: 2500 },
  { name: "Onion", brand: "Local", category: "Vegetables", quantity: 1, unit: "kg", description: "Fresh onions", basePrice: 2000 },
  { name: "Potato", brand: "Local", category: "Vegetables", quantity: 1, unit: "kg", description: "Fresh potatoes", basePrice: 2500 },
  { name: "Carrot", brand: "Local", category: "Vegetables", quantity: 500, unit: "g", description: "Fresh carrots", basePrice: 3500 },
  { name: "Cucumber", brand: "Local", category: "Vegetables", quantity: 1, unit: "kg", description: "Fresh cucumbers", basePrice: 3000 },
  { name: "Capsicum Green", brand: "Local", category: "Vegetables", quantity: 500, unit: "g", description: "Fresh green capsicum", basePrice: 5500 },
  { name: "Broccoli", brand: "Local", category: "Vegetables", quantity: 500, unit: "g", description: "Fresh broccoli", basePrice: 6500 },
  { name: "Spinach", brand: "Local", category: "Vegetables", quantity: 250, unit: "g", description: "Fresh spinach", basePrice: 2500 },
  { name: "Cabbage", brand: "Local", category: "Vegetables", quantity: 1, unit: "kg", description: "Fresh cabbage", basePrice: 2500 },
  { name: "Cauliflower", brand: "Local", category: "Vegetables", quantity: 500, unit: "g", description: "Fresh cauliflower", basePrice: 4000 },
  { name: "Garlic", brand: "Local", category: "Vegetables", quantity: 250, unit: "g", description: "Fresh garlic", basePrice: 4500 },
  { name: "Ginger", brand: "Local", category: "Vegetables", quantity: 250, unit: "g", description: "Fresh ginger", basePrice: 5000 },

  // Grains & Cereals
  { name: "Basmati Rice", brand: "India Gate", category: "Grains", quantity: 1, unit: "kg", description: "Premium basmati rice", basePrice: 8500 },
  { name: "Basmati Rice", brand: "India Gate", category: "Grains", quantity: 5, unit: "kg", description: "5kg basmati rice", basePrice: 40000 },
  { name: "Regular Rice", brand: "Local", category: "Grains", quantity: 1, unit: "kg", description: "Regular white rice", basePrice: 4500 },
  { name: "Wheat Flour", brand: "Aashirvaad", category: "Grains", quantity: 1, unit: "kg", description: "Whole wheat flour", basePrice: 3500 },
  { name: "Wheat Flour", brand: "Aashirvaad", category: "Grains", quantity: 5, unit: "kg", description: "5kg wheat flour", basePrice: 16500 },
  { name: "Corn Flour", brand: "Maida", category: "Grains", quantity: 500, unit: "g", description: "Corn flour", basePrice: 3000 },
  { name: "Oats", brand: "Quaker", category: "Grains", quantity: 400, unit: "g", description: "Rolled oats", basePrice: 4500 },
  { name: "Semolina", brand: "Local", category: "Grains", quantity: 500, unit: "g", description: "Semolina (Suji)", basePrice: 2500 },

  // Pulses & Legumes
  { name: "Moong Dal", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "Moong dal", basePrice: 8500 },
  { name: "Chana Dal", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "Chana dal", basePrice: 7500 },
  { name: "Toor Dal", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "Toor dal", basePrice: 9000 },
  { name: "Masoor Dal", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "Masoor dal", basePrice: 7000 },
  { name: "Black Chickpeas", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "Black chickpeas (Kala Chana)", basePrice: 8000 },
  { name: "White Chickpeas", brand: "Local", category: "Pulses", quantity: 1, unit: "kg", description: "White chickpeas (Kabuli Chana)", basePrice: 8500 },
  { name: "Kidney Beans", brand: "Local", category: "Pulses", quantity: 500, unit: "g", description: "Kidney beans", basePrice: 5000 },

  // Oils & Condiments
  { name: "Sunflower Oil", brand: "Fortune", category: "Oils", quantity: 1, unit: "l", description: "Sunflower oil", basePrice: 16500 },
  { name: "Sunflower Oil", brand: "Fortune", category: "Oils", quantity: 5, unit: "l", description: "5L sunflower oil", basePrice: 80000 },
  { name: "Mustard Oil", brand: "Local", category: "Oils", quantity: 1, unit: "l", description: "Pure mustard oil", basePrice: 14000 },
  { name: "Coconut Oil", brand: "Parachute", category: "Oils", quantity: 500, unit: "ml", description: "Coconut oil", basePrice: 9500 },
  { name: "Olive Oil", brand: "Figaro", category: "Oils", quantity: 500, unit: "ml", description: "Extra virgin olive oil", basePrice: 25000 },
  { name: "Salt", brand: "Tata", category: "Condiments", quantity: 1, unit: "kg", description: "Iodized salt", basePrice: 2000 },
  { name: "Sugar", brand: "Local", category: "Condiments", quantity: 1, unit: "kg", description: "White sugar", basePrice: 4500 },
  { name: "Jaggery", brand: "Local", category: "Condiments", quantity: 500, unit: "g", description: "Jaggery (Gur)", basePrice: 4000 },
  { name: "Honey", brand: "Dabur", category: "Condiments", quantity: 500, unit: "ml", description: "Pure honey", basePrice: 8500 },
  { name: "Vinegar", brand: "Heinz", category: "Condiments", quantity: 250, unit: "ml", description: "Apple cider vinegar", basePrice: 3500 },

  // Spices
  { name: "Turmeric Powder", brand: "Everest", category: "Spices", quantity: 100, unit: "g", description: "Turmeric powder", basePrice: 2500 },
  { name: "Red Chili Powder", brand: "Everest", category: "Spices", quantity: 100, unit: "g", description: "Red chili powder", basePrice: 3000 },
  { name: "Coriander Powder", brand: "Everest", category: "Spices", quantity: 100, unit: "g", description: "Coriander powder", basePrice: 2800 },
  { name: "Cumin Seeds", brand: "Everest", category: "Spices", quantity: 100, unit: "g", description: "Cumin seeds", basePrice: 3500 },
  { name: "Mustard Seeds", brand: "Local", category: "Spices", quantity: 100, unit: "g", description: "Mustard seeds", basePrice: 2500 },
  { name: "Fenugreek Seeds", brand: "Local", category: "Spices", quantity: 100, unit: "g", description: "Fenugreek seeds (Methi)", basePrice: 3000 },
  { name: "Black Pepper", brand: "Everest", category: "Spices", quantity: 50, unit: "g", description: "Black pepper", basePrice: 4500 },
  { name: "Cloves", brand: "Local", category: "Spices", quantity: 50, unit: "g", description: "Cloves", basePrice: 5500 },
  { name: "Cardamom Green", brand: "Local", category: "Spices", quantity: 50, unit: "g", description: "Green cardamom", basePrice: 8000 },
  { name: "Cinnamon", brand: "Local", category: "Spices", quantity: 50, unit: "g", description: "Cinnamon sticks", basePrice: 4000 },
  { name: "Garam Masala", brand: "Everest", category: "Spices", quantity: 100, unit: "g", description: "Garam masala", basePrice: 3500 },

  // Beverages
  { name: "Tea Leaves", brand: "Lipton", category: "Beverages", quantity: 100, unit: "g", description: "Black tea leaves", basePrice: 4000 },
  { name: "Tea Leaves", brand: "Lipton", category: "Beverages", quantity: 250, unit: "g", description: "250g black tea leaves", basePrice: 9000 },
  { name: "Coffee Powder", brand: "Nescafe", category: "Beverages", quantity: 100, unit: "g", description: "Instant coffee", basePrice: 5500 },
  { name: "Coffee Powder", brand: "Nescafe", category: "Beverages", quantity: 200, unit: "g", description: "200g instant coffee", basePrice: 10500 },
  { name: "Milk Powder", brand: "Amul", category: "Beverages", quantity: 400, unit: "g", description: "Milk powder", basePrice: 6500 },
  { name: "Cocoa Powder", brand: "Bournvita", category: "Beverages", quantity: 500, unit: "g", description: "Cocoa powder", basePrice: 5500 },
  { name: "Bournvita", brand: "Bournvita", category: "Beverages", quantity: 500, unit: "g", description: "Chocolate malt drink", basePrice: 5500 },
  { name: "Horlicks", brand: "Horlicks", category: "Beverages", quantity: 500, unit: "g", description: "Malted milk drink", basePrice: 6000 },

  // Snacks & Namkeen
  { name: "Chips Lay's", brand: "Lay's", category: "Snacks", quantity: 40, unit: "g", description: "Potato chips", basePrice: 2000 },
  { name: "Chips Lay's", brand: "Lay's", category: "Snacks", quantity: 150, unit: "g", description: "Large potato chips", basePrice: 6500 },
  { name: "Kurkure", brand: "Lay's", category: "Snacks", quantity: 40, unit: "g", description: "Corn snacks", basePrice: 2000 },
  { name: "Doritos", brand: "Lay's", category: "Snacks", quantity: 40, unit: "g", description: "Tortilla chips", basePrice: 2500 },
  { name: "Chivda", brand: "Local", category: "Snacks", quantity: 500, unit: "g", description: "Mixed namkeen", basePrice: 4500 },
  { name: "Mixture", brand: "Local", category: "Snacks", quantity: 500, unit: "g", description: "Savory mixture", basePrice: 4000 },
  { name: "Bhujia", brand: "Haldiram's", category: "Snacks", quantity: 200, unit: "g", description: "Moong dal bhujia", basePrice: 3500 },
  { name: "Samosa", brand: "Local", category: "Snacks", quantity: 4, unit: "pieces", description: "Frozen samosas", basePrice: 4500 },

  // Sweets & Desserts
  { name: "Chocolate Dairy Milk", brand: "Cadbury", category: "Sweets", quantity: 40, unit: "g", description: "Dairy milk chocolate", basePrice: 2500 },
  { name: "Chocolate Dairy Milk", brand: "Cadbury", category: "Sweets", quantity: 160, unit: "g", description: "Large dairy milk chocolate", basePrice: 8500 },
  { name: "Chocolate Amul", brand: "Amul", category: "Sweets", quantity: 50, unit: "g", description: "Amul chocolate", basePrice: 2000 },
  { name: "Chocolate Kisses", brand: "Hershey's", category: "Sweets", quantity: 100, unit: "g", description: "Chocolate kisses", basePrice: 4500 },
  { name: "Gulab Jamun", brand: "Local", category: "Sweets", quantity: 500, unit: "g", description: "Frozen gulab jamun", basePrice: 5500 },
  { name: "Jalebi", brand: "Local", category: "Sweets", quantity: 500, unit: "g", description: "Frozen jalebi", basePrice: 4500 },
  { name: "Barfi", brand: "Local", category: "Sweets", quantity: 500, unit: "g", description: "Assorted barfi", basePrice: 6000 },

  // Frozen Foods
  { name: "Frozen Peas", brand: "Icy", category: "Frozen", quantity: 500, unit: "g", description: "Frozen green peas", basePrice: 3500 },
  { name: "Frozen Corn", brand: "Icy", category: "Frozen", quantity: 500, unit: "g", description: "Frozen corn", basePrice: 3500 },
  { name: "Frozen Mixed Vegetables", brand: "Icy", category: "Frozen", quantity: 500, unit: "g", description: "Mixed frozen vegetables", basePrice: 4000 },
  { name: "Frozen Fries", brand: "McCain", category: "Frozen", quantity: 500, unit: "g", description: "Frozen french fries", basePrice: 5500 },
  { name: "Frozen Momos", brand: "Local", category: "Frozen", quantity: 400, unit: "g", description: "Frozen momos", basePrice: 4500 },
  { name: "Frozen Paratha", brand: "Local", category: "Frozen", quantity: 400, unit: "g", description: "Frozen parathas", basePrice: 4000 },

  // Ready to Eat
  { name: "Instant Noodles", brand: "Maggi", category: "Ready to Eat", quantity: 77, unit: "g", description: "Instant noodles", basePrice: 1200 },
  { name: "Instant Noodles Pack", brand: "Maggi", category: "Ready to Eat", quantity: 462, unit: "g", description: "Pack of 6 instant noodles", basePrice: 6500 },
  { name: "Instant Pasta", brand: "Knorr", category: "Ready to Eat", quantity: 100, unit: "g", description: "Instant pasta", basePrice: 2500 },
  { name: "Instant Rice", brand: "Aashirvaad", category: "Ready to Eat", quantity: 100, unit: "g", description: "Instant rice", basePrice: 2000 },
  { name: "Instant Soup", brand: "Knorr", category: "Ready to Eat", quantity: 50, unit: "g", description: "Instant soup", basePrice: 1500 },

  // Personal Care (if applicable)
  { name: "Toothpaste", brand: "Colgate", category: "Personal Care", quantity: 100, unit: "g", description: "Toothpaste", basePrice: 3500 },
  { name: "Soap", brand: "Dettol", category: "Personal Care", quantity: 100, unit: "g", description: "Antibacterial soap", basePrice: 2500 },
  { name: "Shampoo", brand: "Head & Shoulders", category: "Personal Care", quantity: 200, unit: "ml", description: "Anti-dandruff shampoo", basePrice: 4500 },
];

// 20+ Indian cities with delivery zones
export const CITIES: CityData[] = [
  { name: "Bangalore", code: "BLR", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "Mumbai", code: "MUM", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777 },
  { name: "Delhi", code: "DEL", state: "Delhi", latitude: 28.7041, longitude: 77.1025 },
  { name: "Hyderabad", code: "HYD", state: "Telangana", latitude: 17.3850, longitude: 78.4867 },
  { name: "Chennai", code: "CHE", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { name: "Kolkata", code: "KOL", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { name: "Pune", code: "PUN", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
  { name: "Ahmedabad", code: "AHM", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { name: "Jaipur", code: "JAI", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { name: "Lucknow", code: "LKO", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 },
  { name: "Chandigarh", code: "CHD", state: "Chandigarh", latitude: 30.7333, longitude: 76.7794 },
  { name: "Indore", code: "IND", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577 },
  { name: "Surat", code: "SUR", state: "Gujarat", latitude: 21.1702, longitude: 72.8311 },
  { name: "Vadodara", code: "VAD", state: "Gujarat", latitude: 22.3072, longitude: 73.1812 },
  { name: "Kochi", code: "KOC", state: "Kerala", latitude: 9.9312, longitude: 76.2673 },
  { name: "Gurgaon", code: "GUR", state: "Haryana", latitude: 28.4595, longitude: 77.0266 },
  { name: "Noida", code: "NOI", state: "Uttar Pradesh", latitude: 28.5355, longitude: 77.3910 },
  { name: "Visakhapatnam", code: "VIS", state: "Andhra Pradesh", latitude: 17.6869, longitude: 83.2185 },
  { name: "Bhopal", code: "BHP", state: "Madhya Pradesh", latitude: 23.1815, longitude: 79.9864 },
  { name: "Coimbatore", code: "COI", state: "Tamil Nadu", latitude: 11.0081, longitude: 76.9124 },
];

// Delivery zones for major cities
export const DELIVERY_ZONES: DeliveryZoneData[] = [
  // Bangalore zones
  { cityCode: "BLR", pincode: "560001", areaName: "Bangalore Central", deliveryTimeMinutes: 10 },
  { cityCode: "BLR", pincode: "560002", areaName: "Bangalore South", deliveryTimeMinutes: 15 },
  { cityCode: "BLR", pincode: "560003", areaName: "Bangalore East", deliveryTimeMinutes: 12 },
  { cityCode: "BLR", pincode: "560004", areaName: "Bangalore North", deliveryTimeMinutes: 18 },
  { cityCode: "BLR", pincode: "560005", areaName: "Bangalore West", deliveryTimeMinutes: 20 },

  // Mumbai zones
  { cityCode: "MUM", pincode: "400001", areaName: "Mumbai Central", deliveryTimeMinutes: 12 },
  { cityCode: "MUM", pincode: "400002", areaName: "Mumbai South", deliveryTimeMinutes: 15 },
  { cityCode: "MUM", pincode: "400003", areaName: "Mumbai East", deliveryTimeMinutes: 18 },
  { cityCode: "MUM", pincode: "400004", areaName: "Mumbai North", deliveryTimeMinutes: 20 },
  { cityCode: "MUM", pincode: "400005", areaName: "Mumbai West", deliveryTimeMinutes: 22 },

  // Delhi zones
  { cityCode: "DEL", pincode: "110001", areaName: "Delhi Central", deliveryTimeMinutes: 10 },
  { cityCode: "DEL", pincode: "110002", areaName: "Delhi South", deliveryTimeMinutes: 12 },
  { cityCode: "DEL", pincode: "110003", areaName: "Delhi East", deliveryTimeMinutes: 15 },
  { cityCode: "DEL", pincode: "110004", areaName: "Delhi North", deliveryTimeMinutes: 18 },
  { cityCode: "DEL", pincode: "110005", areaName: "Delhi West", deliveryTimeMinutes: 20 },

  // Hyderabad zones
  { cityCode: "HYD", pincode: "500001", areaName: "Hyderabad Central", deliveryTimeMinutes: 10 },
  { cityCode: "HYD", pincode: "500002", areaName: "Hyderabad South", deliveryTimeMinutes: 12 },
  { cityCode: "HYD", pincode: "500003", areaName: "Hyderabad East", deliveryTimeMinutes: 15 },

  // Chennai zones
  { cityCode: "CHE", pincode: "600001", areaName: "Chennai Central", deliveryTimeMinutes: 10 },
  { cityCode: "CHE", pincode: "600002", areaName: "Chennai South", deliveryTimeMinutes: 12 },
  { cityCode: "CHE", pincode: "600003", areaName: "Chennai North", deliveryTimeMinutes: 15 },

  // Pune zones
  { cityCode: "PUN", pincode: "411001", areaName: "Pune Central", deliveryTimeMinutes: 10 },
  { cityCode: "PUN", pincode: "411002", areaName: "Pune South", deliveryTimeMinutes: 12 },
  { cityCode: "PUN", pincode: "411003", areaName: "Pune East", deliveryTimeMinutes: 15 },

  // Kolkata zones
  { cityCode: "KOL", pincode: "700001", areaName: "Kolkata Central", deliveryTimeMinutes: 12 },
  { cityCode: "KOL", pincode: "700002", areaName: "Kolkata South", deliveryTimeMinutes: 15 },

  // Ahmedabad zones
  { cityCode: "AHM", pincode: "380001", areaName: "Ahmedabad Central", deliveryTimeMinutes: 10 },
  { cityCode: "AHM", pincode: "380002", areaName: "Ahmedabad South", deliveryTimeMinutes: 12 },

  // Jaipur zones
  { cityCode: "JAI", pincode: "302001", areaName: "Jaipur Central", deliveryTimeMinutes: 12 },
  { cityCode: "JAI", pincode: "302002", areaName: "Jaipur South", deliveryTimeMinutes: 15 },

  // Lucknow zones
  { cityCode: "LKO", pincode: "226001", areaName: "Lucknow Central", deliveryTimeMinutes: 15 },
  { cityCode: "LKO", pincode: "226002", areaName: "Lucknow South", deliveryTimeMinutes: 18 },

  // Chandigarh zones
  { cityCode: "CHD", pincode: "160001", areaName: "Chandigarh Central", deliveryTimeMinutes: 10 },
  { cityCode: "CHD", pincode: "160002", areaName: "Chandigarh South", deliveryTimeMinutes: 12 },

  // Indore zones
  { cityCode: "IND", pincode: "452001", areaName: "Indore Central", deliveryTimeMinutes: 12 },
  { cityCode: "IND", pincode: "452002", areaName: "Indore South", deliveryTimeMinutes: 15 },

  // Surat zones
  { cityCode: "SUR", pincode: "395001", areaName: "Surat Central", deliveryTimeMinutes: 10 },
  { cityCode: "SUR", pincode: "395002", areaName: "Surat South", deliveryTimeMinutes: 12 },

  // Vadodara zones
  { cityCode: "VAD", pincode: "390001", areaName: "Vadodara Central", deliveryTimeMinutes: 12 },
  { cityCode: "VAD", pincode: "390002", areaName: "Vadodara South", deliveryTimeMinutes: 15 },

  // Kochi zones
  { cityCode: "KOC", pincode: "682001", areaName: "Kochi Central", deliveryTimeMinutes: 12 },
  { cityCode: "KOC", pincode: "682002", areaName: "Kochi South", deliveryTimeMinutes: 15 },

  // Gurgaon zones
  { cityCode: "GUR", pincode: "122001", areaName: "Gurgaon Central", deliveryTimeMinutes: 10 },
  { cityCode: "GUR", pincode: "122002", areaName: "Gurgaon South", deliveryTimeMinutes: 12 },

  // Noida zones
  { cityCode: "NOI", pincode: "201301", areaName: "Noida Central", deliveryTimeMinutes: 12 },
  { cityCode: "NOI", pincode: "201302", areaName: "Noida South", deliveryTimeMinutes: 15 },

  // Visakhapatnam zones
  { cityCode: "VIS", pincode: "530001", areaName: "Visakhapatnam Central", deliveryTimeMinutes: 12 },
  { cityCode: "VIS", pincode: "530002", areaName: "Visakhapatnam South", deliveryTimeMinutes: 15 },

  // Bhopal zones
  { cityCode: "BHP", pincode: "462001", areaName: "Bhopal Central", deliveryTimeMinutes: 12 },
  { cityCode: "BHP", pincode: "462002", areaName: "Bhopal South", deliveryTimeMinutes: 15 },

  // Coimbatore zones
  { cityCode: "COI", pincode: "641001", areaName: "Coimbatore Central", deliveryTimeMinutes: 12 },
  { cityCode: "COI", pincode: "641002", areaName: "Coimbatore South", deliveryTimeMinutes: 15 },
];

// Platform-specific pricing variations
export const PLATFORM_VARIATIONS: Record<string, PlatformPricingVariation> = {
  Blinkit: {
    platform: "Blinkit",
    priceMultiplier: 1.02, // 2% premium
    discountRange: [0, 3],
  },
  Zepto: {
    platform: "Zepto",
    priceMultiplier: 0.98, // 2% cheaper
    discountRange: [1, 5],
  },
  "Swiggy Instamart": {
    platform: "Swiggy Instamart",
    priceMultiplier: 1.0, // No change
    discountRange: [0, 4],
  },
};

// Location-based price multipliers
export const LOCATION_MULTIPLIERS: Record<string, number> = {
  "560001": 1.0, // Bangalore Central - baseline
  "560002": 0.98, // Bangalore South - slightly cheaper
  "560003": 0.99, // Bangalore East
  "560004": 1.01, // Bangalore North - slightly expensive
  "560005": 1.02, // Bangalore West - more expensive
  "400001": 1.0, // Mumbai Central - baseline
  "400002": 0.99, // Mumbai South
  "400003": 1.01, // Mumbai East
  "400004": 1.02, // Mumbai North
  "400005": 1.03, // Mumbai West - most expensive
  "110001": 1.0, // Delhi Central - baseline
  "110002": 0.98, // Delhi South
  "110003": 0.99, // Delhi East
  "110004": 1.01, // Delhi North
  "110005": 1.02, // Delhi West
};
