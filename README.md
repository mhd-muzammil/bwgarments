# Black & White Garments — Premium Fashion E-Commerce

Full-stack MERN e-commerce platform for a fashion clothing brand. Production-deployed on **Vercel** (client) + **Render** (API).

**Live:** https://bwgarments.vercel.app
**API:** https://bwgarments.onrender.com/api/health

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Recharts, Vite 7 |
| Backend | Node.js, Express 4, Mongoose 9 (MongoDB ODM) |
| Database | MongoDB Atlas (replica set for transactions) |
| Auth | JWT (httpOnly cookies), refresh token rotation |
| Validation | express-validator on all routes |
| Logging | Winston (structured logs, console in prod) |
| Testing | Jest 30, Supertest, mongodb-memory-server (replica set) |
| CI/CD | GitHub Actions (lint, test, build, docker) |
| Deployment | Vercel (client), Render (API), Docker support |

---

## Project Structure

```
bw-garments/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/         # Navbar, Footer, MobileBottomNav
│   │   │   ├── Product/        # ProductCard, QuickView, ImageGallery, SizeSelector
│   │   │   ├── Home/           # CategoryTabs, CustomerReviews
│   │   │   ├── BackToTop.jsx   # Scroll-to-top button
│   │   │   ├── CartDrawer.jsx  # Slide-in cart panel
│   │   │   ├── PageTransition.jsx  # Route animation wrapper
│   │   │   ├── SplashScreen.jsx    # Brand intro animation
│   │   │   └── ProtectedRoute.jsx  # Auth/admin route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Auth state, login/register/logout, session verify
│   │   │   └── CartContext.jsx # Cart state, add/update/remove with mutation lock
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Hero (parallax), featured products, reviews
│   │   │   ├── Products.jsx    # Shop page with filters, search, pagination (URL-synced)
│   │   │   ├── ProductDetail.jsx   # Full product page with image gallery
│   │   │   ├── Cart.jsx        # Full cart page
│   │   │   ├── Checkout.jsx    # Shipping address form, order placement
│   │   │   ├── Orders.jsx      # User order history
│   │   │   ├── Auth.jsx        # Sliding panel login/register animation
│   │   │   ├── NotFound.jsx    # 404 page
│   │   │   └── admin/          # 11 admin pages (lazy-loaded, code-split)
│   │   │       ├── Dashboard.jsx       # Stats overview
│   │   │       ├── Analytics.jsx       # Revenue charts, top products, order breakdown
│   │   │       ├── ProductManager.jsx  # Product CRUD list
│   │   │       ├── ProductForm.jsx     # Create/edit product (1-10 images)
│   │   │       ├── CategoryManager.jsx # Category CRUD with subcategories
│   │   │       ├── Inventory.jsx       # Stock levels, bulk update, CSV export
│   │   │       ├── OrderManager.jsx    # Order list with status filters
│   │   │       ├── OrderDetail.jsx     # Full order view, timeline, admin notes
│   │   │       ├── CustomerManager.jsx # User list, role management
│   │   │       ├── CouponManager.jsx   # Promo codes, flat/percent, expiry
│   │   │       └── ActivityLog.jsx     # Audit trail of admin actions
│   │   ├── utils/
│   │   │   ├── api.js          # Axios instance with cookie auth + refresh interceptor
│   │   │   ├── formatPrice.js  # Currency formatting helpers
│   │   │   └── customToast.jsx # Rich toast notifications with product thumbnails
│   │   ├── App.jsx             # Router, providers, layout, splash screen
│   │   └── index.css           # Tailwind theme, custom animations, global styles
│   ├── vercel.json             # Vercel SPA rewrite config
│   └── vite.config.js          # Vite + Tailwind + dev proxy
│
├── server/                     # Express API
│   ├── config/
│   │   ├── db.js               # MongoDB connection with error handling
│   │   ├── logger.js           # Winston logger (console in prod, file in dev)
│   │   └── cloudinary.js       # Cloudinary config (optional image uploads)
│   ├── models/
│   │   ├── User.js             # name, email, password (bcrypt), role, refreshToken
│   │   ├── Product.js          # title, images[1-10], sizes[S-XXL], price/discount, SKU
│   │   ├── Category.js         # name, slug, subcategories[]
│   │   ├── Cart.js             # user ref, items[{product, size, quantity}]
│   │   ├── Order.js            # items, shipping, payment/order status, notes, history
│   │   ├── Coupon.js           # code, type, value, limits, expiry, usage tracking
│   │   └── ActivityLog.js      # action, actor, target, description, metadata
│   ├── controllers/
│   │   ├── authController.js   # register, login, refresh, logout, me
│   │   ├── productController.js # CRUD, bulk stock update, CSV export, inventory
│   │   ├── categoryController.js # CRUD with product count aggregation
│   │   ├── cartController.js   # get, add, update, remove, clear
│   │   ├── orderController.js  # checkout (Mongo transaction), status, notes, detail
│   │   ├── couponController.js # CRUD, validate (checks expiry, limits, per-user)
│   │   ├── adminController.js  # dashboard stats, analytics, activity log
│   │   └── userController.js   # list users, get user, update role
│   ├── middleware/
│   │   ├── auth.js             # JWT verify from cookie or Bearer header
│   │   ├── role.js             # Role-based authorization (admin/user)
│   │   ├── validate.js         # express-validator rules for all routes
│   │   ├── errorHandler.js     # Centralized error handler (never leaks stack traces)
│   │   └── activityLog.js      # Audit log helper (non-blocking)
│   ├── routes/                 # 7 route files mapping to controllers
│   ├── seed/
│   │   ├── seed.js             # Seed products + users (secure random passwords)
│   │   └── seedCategories.js   # Seed Men/Women/Kids categories
│   ├── __tests__/
│   │   ├── setup.js            # In-memory MongoDB replica set for tests
│   │   ├── auth.test.js        # 12 tests: register, login, refresh, me, logout
│   │   └── checkout.test.js    # 10 tests: cart CRUD, checkout, stock, edge cases
│   └── server.js               # Express app setup, CORS, security, route mounting
│
├── .github/workflows/ci.yml   # GitHub Actions: lint, test, build, docker
├── Dockerfile                  # Multi-stage: client build + production server
├── docker-compose.yml          # API + MongoDB 7 for local Docker development
├── render.yaml                 # Render deployment blueprint
└── .env.example                # All env vars documented for both Vercel + Render
```

---

## Architecture Decisions

### Authentication Flow

```
Client                          Server
  │                               │
  ├── POST /auth/login ──────────>│ Verify credentials
  │                               │ Generate access + refresh JWT
  │<── Set-Cookie (httpOnly) ─────│ accessToken (15m), refreshToken (7d)
  │                               │
  ├── GET /api/cart ─────────────>│ Read accessToken from cookie
  │    (cookie sent automatically) │ Verify JWT, attach req.user
  │<── 200 cart data ─────────────│
  │                               │
  ├── GET /api/cart ─────────────>│ accessToken expired
  │<── 401 { expired: true } ─────│
  │                               │
  ├── POST /auth/refresh ────────>│ Read refreshToken from cookie
  │                               │ Verify, rotate both tokens
  │<── Set-Cookie (new tokens) ───│
  │                               │
  ├── GET /api/cart (retry) ─────>│ New accessToken works
  │<── 200 cart data ─────────────│
```

**Why httpOnly cookies instead of localStorage?**
Tokens in localStorage are vulnerable to XSS — any injected script can steal them. httpOnly cookies are inaccessible to JavaScript, so even if XSS occurs, tokens can't be exfiltrated.

**Why `sameSite: 'none'` in production?**
Client (Vercel) and API (Render) are on different domains. Cookies with `sameSite: 'strict'` or `'lax'` are blocked on cross-origin requests. `sameSite: 'none'` with `secure: true` allows cross-domain cookie sending over HTTPS.

### Checkout with Atomic Stock Decrement

```javascript
// Uses $elemMatch to ensure the SAME array element matches both size AND stock
const updated = await Product.findOneAndUpdate(
  {
    _id: product._id,
    sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } },
  },
  { $inc: { 'sizes.$.stock': -item.quantity } },
  { new: true, session }  // Within MongoDB transaction
);
```

The entire checkout runs inside a MongoDB transaction:
1. Validate all cart items exist and are available
2. Atomically decrement stock for each item (fails if stock changed between validate and decrement)
3. Create the order
4. Clear the cart
5. If ANY step fails, the entire transaction rolls back — no partial stock decrements

### Code Splitting

Admin pages are lazy-loaded with `React.lazy()`:
```javascript
const Analytics = lazy(() => import('./pages/admin/Analytics'));
```

This keeps the main bundle at ~390KB. Admin code (~70KB total across 11 pages) is only downloaded when an admin actually navigates to the dashboard.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login, sets cookies |
| POST | `/api/auth/refresh` | Cookie | Rotate tokens |
| GET | `/api/auth/me` | Cookie | Get current user |
| POST | `/api/auth/logout` | Cookie | Clear tokens |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | - | List products (paginated, filterable, searchable) |
| GET | `/api/products/:id` | - | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete (deactivate) |
| PATCH | `/api/products/:id/soldout` | Admin | Toggle sold out |
| GET | `/api/products/admin/all` | Admin | All products including inactive |
| GET | `/api/products/admin/inventory` | Admin | Stock levels with alerts |
| GET | `/api/products/admin/export` | Admin | CSV export |
| PUT | `/api/products/admin/bulk-stock` | Admin | Bulk stock update |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | - | All categories (add `?withCounts=true` for product counts) |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete (blocked if products use it) |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart` | User | Add item (validates stock) |
| PUT | `/api/cart/:itemId` | User | Update quantity |
| DELETE | `/api/cart/:itemId` | User | Remove item |
| DELETE | `/api/cart/clear` | User | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/checkout` | User | Place order (atomic transaction) |
| GET | `/api/orders` | User | My orders (paginated) |
| GET | `/api/orders/:id` | User/Admin | Single order |
| GET | `/api/orders/admin/all` | Admin | All orders (filterable) |
| PUT | `/api/orders/:id/status` | Admin | Update order/payment status |
| POST | `/api/orders/:id/notes` | Admin | Add admin note |
| GET | `/api/orders/:id/detail` | Admin | Full detail with timeline |

### Coupons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/coupons/validate` | User | Validate coupon code against order |
| GET | `/api/coupons` | Admin | List coupons |
| POST | `/api/coupons` | Admin | Create coupon |
| PUT | `/api/coupons/:id` | Admin | Update coupon |
| DELETE | `/api/coupons/:id` | Admin | Delete coupon |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard summary |
| GET | `/api/admin/analytics` | Admin | Revenue timeline, top products, comparisons |
| GET | `/api/admin/activity` | Admin | Audit log (filterable by type/actor) |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/role` | Admin | Change user role |

---

## Environment Variables

### Render (Server)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | 64+ char random string |
| `JWT_REFRESH_SECRET` | Yes | 64+ char random string (different from JWT_SECRET) |
| `JWT_EXPIRE` | No | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRE` | No | Refresh token TTL (default: `7d`) |
| `CLIENT_URL` | Yes | Vercel URL, e.g. `https://bwgarments.vercel.app` |

### Vercel (Client)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Render URL, e.g. `https://bwgarments.onrender.com` |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/mhd-muzammil/bwgarments.git
cd bwgarments

# 2. Install all dependencies
npm run install:all

# 3. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 4. Seed database
npm run seed
npm run seed:categories

# 5. Start dev server (API + Client in parallel)
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:5173
```

### Docker Development

```bash
docker-compose up
# API: http://localhost:5000
# MongoDB: localhost:27017
```

---

## Testing

```bash
cd server
npm test
```

Runs 22 integration tests against an in-memory MongoDB replica set:
- **Auth tests (12):** register, login with validation, duplicate email, weak password, invalid email, refresh token flow, session verification, logout
- **Checkout tests (10):** cart CRUD, stock validation, atomic checkout, empty cart, insufficient stock (simulated concurrent purchase), order retrieval

---

## Security

- **httpOnly cookies** for JWT tokens (XSS-safe)
- **bcrypt** password hashing (12 rounds)
- **express-validator** on all input routes
- **Helmet** security headers
- **Rate limiting** (200 req/15min general, 30 req/15min auth)
- **MongoDB sanitization** (NoSQL injection prevention)
- **XSS protection** middleware
- **Error handler** never leaks stack traces to clients
- **CORS** with explicit origin allowlist
- **Refresh token rotation** (old token invalidated on each refresh)
- **Atomic stock operations** (prevent overselling under concurrency)

---

## License

ISC
