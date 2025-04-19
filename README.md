🛒 E-Commerce Application
A fully functional e-commerce backend with authentication, product management, cart functionality, order tracking, and admin analytics.

🚀 Features
✅ User Authentication (Signup, Login, JWT-based authentication)
✅ Admin Dashboard (Sales tracking, revenue analytics, order management)
✅ Product Management (CRUD operations, filtering, searching)
✅ Cart & Wishlist (Add to cart, apply discounts, favorites system)
✅ Order & Payment Handling (Stripe integration, order tracking, notifications, refund and cancellation system)
✅ Reviews & Ratings (Users can leave ratings and comments on products)
✅ Security (XSS & CSRF protection, password reset with Redis)

🛠 Installation Guide
1️⃣ Clone the Repository
git clone https://github.com/OmarGhorab20/demo-app-heavenly.git
cd demo-app-heavenly


2️⃣ Install Dependencies
npm install


3️⃣ Set Up Environment Variables
Create a .env file and add the necessary configurations:

PORT=5000
MONGO_URI=mongodb+srv://omarghe...
UPSTASH_REDIS_URL=rediss://default:...
ACCESS_TOKEN_SECRET=access_token_secret
REFRESH_TOKEN_SECRET=refresh_token_secret
NODE_ENV='development'
JWT_RESET_SECRET=your_jwt_reset_secret
JWT_SECRET=eyJhbGciOiJIUzI1NiIsIn...
BCRYPT_SALT_ROUNDS=10
EMAIL=
PASSWORD=auqc ergn nguс ****
CLOUDINARY_CLOUD_NAME=my-e-commerce
CLOUDINARY_API_KEY=968627714778...
CLOUDINARY_API_SECRET=aogztvkF...
CLOUDINARY_DEFAULT_FEMALE=https://...
CLOUDINARY_DEFAULT_MALE=https://...
STRIPE_SECRET_KEY=sk_test_51QAI...
STRIPE_WEBHOOK_SECRET=whsec_def... ====> you also need webhook end point in production in development this works with cli fine
CLIENT_URL=https://heavenly-deno...
SENTRY_DSN=https://f9941e869d6a...
SUPPORTED_CURRENCIES=USD

4️⃣ Start the Server
sh
Copy
Edit
npm run dev
Now, your backend should be running on http://localhost:5000.

🔹 Frontend Setup
1️⃣ Navigate to the Frontend Folder
cd frontend
2️⃣ Install Frontend Dependencies
npm install
3️⃣ Start the Frontend
npm run dev
4️⃣ Set Up Environment Variables .env file 
    VITE_API_BASE_URL= backendURL;
    VITE_API_BASE_URL_API= backendURL/api;
   
📌 API Endpoints (Examples)
POST /api/auth/signup - Register a new user
POST /api/auth/login - Login and get tokens
GET /api/products - Fetch all products
POST /api/cart/add - Add a product to cart
POST /api/orders/create - Create a new order
For a complete list of endpoints, refer to the API documentation.

👨‍💻 Technologies Used
Backend: Node.js with Express.js
Database: MongoDB + Mongoose
Caching & Sessions: Redis
Payments: Stripe (for payment processing)
State Management: Zustand (for frontend)


🙌 Contributing
Feel free to fork the repository, open issues, and submit pull requests!
"# Heavenly-E-commerce" 
"# Heavenly-E-commerce" 
