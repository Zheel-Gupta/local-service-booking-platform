# 🛠️ ServiceHub — Local Service Booking Platform

A full-stack web application connecting local service providers (electricians, plumbers, cleaners, salons, etc.) with customers who need to book their services — built with the PERN stack.

🔗 **Live Demo:** [https://local-service-booking-platform.vercel.app/]  
📂 **GitHub Repo:** [https://github.com/Zheel-Gupta/local-service-booking-platform]

## 📸 Screenshots

![Home Page](screenshot-link-here)
![Provider Dashboard](screenshot-link-here)
![Booking Flow](screenshot-link-here)

## ✨ Features

### For Customers
- Browse and search services by category, price range, and rating
- View detailed provider profiles with reviews and ratings
- Select from multiple sub-services with individual pricing (e.g., Salon: Haircut, Facial)
- Book services with date/time slot selection
- Real-time conflict prevention (no double-booking)
- Apply promotional coupons (e.g., first-booking discount) at checkout
- Track bookings (pending, confirmed, completed, cancelled)
- Leave ratings and reviews after service completion
- AI-powered chat assistant for platform help

### For Providers
- Create and manage service listings (CRUD), including multi-option services with sub-service pricing
- Dashboard with booking stats and analytics
- Accept, confirm, or cancel booking requests
- View customer reviews and average ratings

### Platform-wide
- Role-based authentication (JWT) for Customers and Providers
- Secure password hashing with bcrypt
- Location-based search with live geolocation support
- AI chatbot (OpenAI-powered) for user assistance
- Fully responsive, modern UI

## 🧰 Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (Neon), Sequelize ORM  
**Authentication:** JWT, bcrypt  
**AI Integration:** OpenAI API (GPT-4o-mini)  
**Deployment:** [Vercel/Netlify] (Frontend), [Render/Railway] (Backend)

## 🏗️ Architecture

- RESTful API design with role-based access control
- Booking conflict-prevention logic to avoid double-booking the same provider/time slot
- Sequelize associations modeling a two-sided marketplace (Users, Services, Bookings, Reviews)
- Flexible service pricing model supporting both single-price and multi-option (sub-service) listings via JSONB
- Aggregation queries for average provider ratings
- Rate-limited AI chatbot endpoint to prevent API abuse

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (or a Neon account)
- OpenAI API key (for chatbot feature)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Zheel-Gupta/local-service-booking-platform.git
cd local-service-booking-platform
```

2. Backend setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
OPENAI_API_KEY=your_openai_api_key
```
```bash
npm run dev
```

3. Frontend setup (from project root)
```bash
npm install
npm run dev
```

4. Open `http://localhost:5173` in your browser

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/services | Get all services (search/filter/pagination) |
| POST | /api/services | Create service (provider only) |
| PUT | /api/services/:id | Update service (owner only) |
| DELETE | /api/services/:id | Delete service (owner only) |
| POST | /api/bookings | Create booking (conflict-checked) |
| GET | /api/bookings/my-bookings | Customer's bookings |
| GET | /api/bookings/provider-bookings | Provider's bookings |
| PUT | /api/bookings/:id/status | Update booking status |
| POST | /api/reviews | Submit review |
| GET | /api/reviews/provider/:id | Get provider's reviews |
| POST | /api/chatbot/message | AI chatbot conversation |

## 🎯 Key Technical Highlights

- **Booking conflict prevention:** Before confirming a booking, the system checks if the provider already has a pending/confirmed booking for the same date and time slot, preventing double-bookings.
- **Role-based access control:** Middleware restricts routes based on user role (customer vs provider), enforced at both the API and UI level.
- **Search & filter:** Dynamic query building with Sequelize operators (search, category, price range, rating, sorting, pagination).
- **Flexible pricing:** Services support either a single price or multiple sub-services with individual pricing, stored as JSONB for schema flexibility without extra tables.
- **AI Assistant:** Integrated OpenAI-powered chatbot with rate limiting to guide users through the platform.

## 👤 Author

[ZHEEL GUPTA]  
[https://www.linkedin.com/in/zheel-gupta-447797316] | [https://github.com/Zheel-Gupta] | [jheelgupta1031@gmal.com]