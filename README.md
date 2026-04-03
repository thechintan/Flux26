# 🌾 Smart Agri Marketplace

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-success)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-yellowgreen)
![Python](https://img.shields.io/badge/ML-Python%20%2B%20Flask-blueviolet)

**Smart Agri Marketplace** is a full-stack, AI-powered web application designed to connect farmers directly with buyers, streamlining the agricultural supply chain. 

By eliminating the middleman, the platform ensures fair pricing, seamless negotiation, and transparent logistics. It leverages machine learning to provide accurate crop price predictions and demand forecasting, helping both farmers and buyers make data-driven decisions.

## ✨ Key Features

- **🧑‍🌾 Role-Based Authentication:** Distinct and tailored dashboards for *Farmers* and *Buyers*.
- **🤖 AI-Powered Price Recommendations:** A built-in ML microservice predicts the optimal price per kilogram based on crop categories and market trends.
- **💬 Real-Time Negotiation Chat:** Seamless communication channel between farmers and buyers to securely negotiate and confirm deals.
- **📦 Order & Logistics Tracking:** End-to-end tracking of produce from farm coordinates to buyer destination.
- **📸 Photo-Verified Dispute Reporting:** A reliable, image-backed reporting mechanism for order discrepancies.
- **📊 Farmer-Centric "Sold History" Dashboard:** Intuitive data visualization allowing farmers to track revenue and historical sales.
- **🌐 Open Browsing:** Non-authenticated view allowing public users to seamlessly browse available product listings.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router v7
- **HTTP Client:** Axios

### Backend Core
- **Framework:** Node.js + Express
- **Database:** MongoDB (via Mongoose + MongoDB Memory Server)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer

### Machine Learning API
- **Language/Framework:** Python 3 + Flask
- **Model format:** Scikit-Learn (`joblib`)
- **Data handling:** NumPy & Pandas

---

## 📂 Project Structure

```text
├── backend/
│   ├── middleware/        # Express custom logic & verifications
│   ├── models/            # Mongoose schema definitions
│   ├── routes/            # API endpoints
│   ├── uploads/           # Static asset storage for product images
│   ├── ml_api.py          # Python Flask app serving the price-prediction Model
│   ├── server.js          # Core Node backend implementation
│   └── *.pkl              # ML Models and Label Encoders
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page-level React routing
│   │   └── index.css      # Core Tailwind directives
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend Dependencies
└── README.md              # Project Documentation
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone <repository_url>
cd <repository_folder>
```

### 2. Set up the Backend (Node.js)
Open a new terminal and run:
```bash
cd backend
npm install

# Rename .env.example to .env and configure your environment variables (e.g. PORT, MONGO_URI, JWT_SECRET)
# Then start the server:
npm run dev  # or node server.js
```
*The Node.js API will typically run on `http://localhost:5000` (or as defined in your `.env`).*

### 3. Set up the Machine Learning API (Python Flask)
Open another terminal:
```bash
cd backend

# Recommend creating a virtual environment first:
# python -m venv venv
# source venv/bin/activate  (or `venv\Scripts\activate` on Windows)

pip install flask flask-cors numpy joblib
python ml_api.py
```
*The Flask server runs independently on `http://localhost:8000`.*

### 4. Set up the Frontend (React + Vite)
Open a third terminal:
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
*The React UI will run on `http://localhost:5173`.*

---

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/MyAwesomeFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/MyAwesomeFeature`)
5. Open a Pull Request
