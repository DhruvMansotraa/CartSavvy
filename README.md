# 🛒 CartSavvy

**CartSavvy** is a smart price comparison mobile app that helps users find the cheapest way to buy groceries across multiple quick-commerce platforms like Blinkit, Zepto, and Swiggy Instamart.

> 💡 Built to solve a real problem: *“Where can I get my entire cart for the lowest price?”*

---

## 🚀 Features

### 🔍 Product Search

* Search and browse grocery items
* Normalized product listings across platforms

### 🧺 Smart Cart System

* Add multiple items to cart
* Handles quantity and unit normalization (kg, litre, etc.)

### 💸 Price Comparison Engine

* Compare total cart price across platforms
* Identify the cheapest platform instantly
* View per-item price differences

### 🧠 Smart Cart Optimization (AI-Assisted)

* Suggest cheaper alternatives
* Recommend switching platforms to save money
* Highlight total savings (₹)

### 📍 Location-Aware Pricing

* Prices adapt based on user location (city/pincode)
* Simulates real-world availability and pricing differences

---

## 🏗️ Tech Stack

### Frontend

* React Native (TypeScript)

### Backend

* Node.js + Express

### Database

* MongoDB / PostgreSQL (depending on setup)

### Architecture Highlights

* Modular **platform adapter layer** (Blinkit, Zepto, Instamart)
* Replaceable mock data system → ready for real API integrations
* Clean separation between frontend and backend

---

## ⚙️ How It Works

1. User enters location
2. Searches for products
3. Adds items to cart
4. Cart is evaluated across multiple platforms
5. App shows:

   * Cheapest platform
   * Total savings
   * Optimization suggestions

---

## 🧪 Data Strategy (MVP)

* Uses structured mock data (300–500 products)
* Simulates:

  * Platform-based pricing differences
  * Location-based availability
* Designed to plug in real APIs in future

---

## 🔐 Authentication

* Secure login using OAuth (Manus Auth)
* Session-based authentication (JWT)

---

## 📱 Screens

* Location Input
* Product Search
* Cart
* Comparison Results

---

## 📌 Roadmap

* [ ] Real API integration (Blinkit / Zepto / Instamart)
* [ ] Push notifications for price drops
* [ ] Advanced AI optimization
* [ ] Order redirection to platforms
* [ ] User analytics dashboard

---

## ⚠️ Disclaimer

This project currently uses **mock data** and does not fetch real-time prices from external platforms.
It is designed as a scalable MVP with future integration capabilities.

---

## 🧠 Why CartSavvy?

Most users manually compare prices across apps.

CartSavvy automates this by:

* Aggregating product data
* Comparing full cart costs
* Suggesting smarter purchase decisions

---

## 🛠️ Setup Instructions

```bash
# Clone repository
git clone https://github.com/DhruvMansotraa/CartSavvy.git

# Navigate into project
cd CartSavvy

# Install dependencies
npm install

# Start backend
npm run server

# Start mobile app
npm run android
```

---

## 📈 Future Vision

CartSavvy aims to become a **real-time price intelligence engine** for quick commerce in India and globally.

---

## 👤 Author

**Dhruv Sharma**

|Aspiring Developer | Building real-world products

---

## ⭐ Support

If you like this project, consider giving it a star ⭐
