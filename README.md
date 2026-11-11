# E-Commerce Store — Frontend

React (Vite) single-page app for the store: product catalog, ticket booking (country →
airline/bus/train → company → tickets), cart, checkout with real payment gateways, payment
status, order history, wishlist, product reviews and an admin dashboard.

The API lives in a separate folder (`ecommerce-backend`) with its own README. **Start the
backend first.**

## Tech stack

- React 18 + React Router 6
- Vite 5
- Axios (with a JWT auth interceptor)
- Plain CSS (no framework) in `src/styles/index.css`

## Project structure

```
ecommerce-frontend/
├── index.html
├── vite.config.js
├── package.json
├── vercel.json               single-page-app rewrite for Vercel
├── DEPLOYMENT.md             Vercel guide
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx              entry point, wraps the app in providers
    ├── App.jsx               routes
    ├── api/
    │   └── api.js            axios instance + auth header
    ├── context/
    │   ├── AuthContext.jsx       login / register / logout
    │   ├── CartContext.jsx       cart, synced with the API
    │   └── WishlistContext.jsx   saved products
    ├── components/
    │   ├── Navbar.jsx
    │   ├── ProductCard.jsx       image, rating, wishlist heart
    │   ├── Stars.jsx             star rating display
    │   ├── Reviews.jsx           list + write/edit/delete reviews
    │   ├── StatusBadge.jsx
    │   ├── ProtectedRoute.jsx    RequireAuth / RequireAdmin
    │   └── admin/
    │       ├── AdminStats.jsx
    │       ├── AdminProducts.jsx     CRUD + image upload
    │       ├── AdminTickets.jsx
    │       └── AdminOrders.jsx
    ├── pages/
    │   ├── Home.jsx              catalog with search + category filter
    │   ├── ProductDetail.jsx     details, rating, reviews, save for later
    │   ├── Tickets.jsx           country → transport → company → tickets
    │   ├── Wishlist.jsx
    │   ├── Login.jsx / Register.jsx
    │   ├── Cart.jsx
    │   ├── Checkout.jsx          address + payment method
    │   ├── PaymentStatus.jsx     redirects to the gateway, shows the result
    │   ├── Orders.jsx            history with payment/order status
    │   ├── AdminDashboard.jsx    tabs: Overview / Products / Tickets / Orders
    │   └── NotFound.jsx
    └── styles/index.css
```

## Setup

1. **Start the backend** (see its README). It must be running at `http://localhost:5000`.

2. **Install dependencies**
   ```bash
   cd ecommerce-frontend
   npm install
   ```

3. **Create your `.env`** (copy `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open the link it prints, usually `http://localhost:5173`. Don't open `index.html`
   directly from your disk; it only works through Vite.

5. **Production build**
   ```bash
   npm run build      # output in dist/
   npm run preview    # try the build locally
   ```

### npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Pages

| Route | Page | Access |
|---|---|---|
| `/` | Shop: search, category filter | public |
| `/products/:id` | Product details, reviews, save for later | public |
| `/tickets` | Ticket booking wizard | public (login to add to cart) |
| `/login`, `/register` | Account | public |
| `/cart` | Cart | login |
| `/checkout` | Address + payment method | login |
| `/payment/:orderId` | Payment status / redirect to gateway | login |
| `/orders` | My orders | login |
| `/wishlist` | Saved products | login |
| `/admin` | Admin dashboard | admin only |

## How it works

### Shopping and payment
1. **Shop** — search and filter products, open one for details.
2. **Cart** — add items (login required), change quantities.
3. **Checkout** — enter a shipping address and choose a payment method. Only the methods the
   backend has keys for are shown: card (Stripe), SSLCommerz, bKash, cash on delivery, and a
   demo **Test payment** (development only, no real money).
4. **Payment** — you're sent to the provider, then back to `/payment/:orderId`, which shows
   success, failed or cancelled, and lets you retry. Cash on delivery shows "Order placed".
5. **My Orders** — history with payment and order status. Unpaid orders have a "Complete
   payment" link.

### Ticket booking
Open **Tickets** in the navbar:
1. Pick a **country**
2. Pick **Airline, Bus or Train** (only the types that country has)
3. Pick the **company** (for example Hanif Paribahan, Biman Bangladesh Airlines, Bangladesh Railway)
4. Pick a **ticket** (route, times, class, price, seats left) and add it to the cart

Tickets then follow the normal cart → checkout → payment → My Orders flow. Operator names are
real; routes, times and prices are sample data you can edit in the admin panel.

### Wishlist and reviews
- Tap the heart on a product card, or "Save for later" on its page. See them all in **Wishlist**.
- Logged-in customers can rate a product 1–5 and write a comment (one review each, editable).
  "Verified purchase" appears if they paid for that product.

### Admin dashboard
Log in as admin (`admin@example.com` / `Admin@123` after running the backend seed) and open
**Admin**:
- **Overview** — revenue, orders by payment status, product and customer counts, low stock
- **Products** — add, edit, delete; upload a photo or paste an image URL
- **Tickets** — add and delete tickets by country, transport type and company
- **Orders** — see every order; change payment status and order status (shipping, delivery or
  cancelling sends an email; cancelling returns stock)

## Notes

- The login token and user are kept in `localStorage`. `src/api/api.js` adds the
  `Authorization: Bearer <token>` header automatically.
- If a saved login becomes invalid (for example after the server secret changes), the app logs
  you out automatically.
- `VITE_` variables are baked in when the app is built. After changing `VITE_API_BASE_URL`,
  restart `npm run dev` or rebuild.
- Products without an image show a colored category tile.

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page, error mentions `file:///` | You opened `index.html` directly. Run `npm run dev` and use the printed `http://localhost:5173` link |
| `ERR_CONNECTION_REFUSED` on port 5000, "Could not load products" | The backend isn't running. Start it (`npm run dev` in `ecommerce-backend`) |
| `React is not defined` | Make sure `vite.config.js` sits next to `package.json`, run `npm install`, then `npm run dev -- --force` |
| `401 Unauthorized` on `/api/cart` | Stale login. Clear Local Storage (F12 → Application) or log out and in |
| CORS error | Backend `CLIENT_ORIGIN` must exactly match the URL in your address bar |
| A payment method is missing at checkout | Its keys aren't set in the backend `.env` |
| Page refresh gives 404 after deploying | Keep `vercel.json` (single-page-app rewrite) |
| `favicon.ico 404` and React Router future-flag warnings | Harmless; ignore |

## Deployment

See `DEPLOYMENT.md` (Vercel). Set `VITE_API_BASE_URL` to your backend URL ending in `/api`,
then put the Vercel URL into the backend's `CLIENT_ORIGIN`.
