# Global Agriculture — Frontend

A React + Vite storefront for the `global-agriculture-backend` Spring Boot API — browse
produce, manage a cart, place orders, track shipments, and (for admins) manage listings,
in the spirit of Swiggy/Zomato but for farm produce.

## Stack

- React 19 + React Router 6
- Axios for API calls
- lucide-react for icons
- Hand-built CSS design system (`src/styles/tokens.css` + `layout.css`) — no UI framework
- No token-based auth — the backend doesn't issue one, so the logged-in user object is kept
  in `localStorage` after `/api/auth/login`

## Getting started

```bash
npm install
npm run dev
```

The app runs at **http://localhost:5173**. Vite's dev proxy (see `vite.config.js`) forwards
every backend path (`/api/**`, `/cart`, `/orders`, `/categories`, `/reviews`, `/admin`,
`/payments`, `/shipping`, `/users`, etc.) to your Spring Boot backend at
**http://localhost:8080**, so make sure that's running first:

```bash
cd global-agriculture-backend
mvn spring-boot:run
```

## One backend fix worth making

Because the dev proxy forwards requests server-side, most CORS restrictions never come into
play during development. But `CategoryController`, `ReviewController`,
`ContactMessageController`, `FarmerCertificateController`, and `InventoryController` have no
`@CrossOrigin` annotation at all, and the global `CorsConfig` only allows
`http://localhost:3000` (not Vite's `5173`). This only bites if the backend is ever called
directly from a browser without a proxy in front of it (e.g. a production deploy) — worth
fixing now so it isn't a surprise later:

```java
@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:5173") // add this line
public class CategoryController { ... }
```

Do the same for `ReviewController`, `ContactMessageController`, `FarmerCertificateController`,
and `InventoryController`, and update `CorsConfig.java`'s `allowedOrigins` to `5173` as well.

## What's implemented

- **Auth** — sign up (buyer accounts only, matching `AuthService`), sign in, session kept in
  `localStorage`
- **Browse** — category rail, search, product grid with a "freshness ring" on every card
  (a small ring computed from each product's `harvest_date`/`expiry_date`)
- **Product detail** — full listing, buyer reviews, add-to-cart / wishlist
- **Cart & checkout** — quantity steppers, address form (prefilled from your profile),
  cash-on-delivery or card/UPI, places an order then a matching payment record
- **Orders** — expandable list showing items, shipping status, and payment status
- **Wishlist**, **Notifications** (mark read/unread, delete), **Profile**
- **Admin dashboard** (visible only to `role: ADMIN` accounts) — stats overview, product
  CRUD, all-orders table, all-users table

## Notes on backend behavior this frontend adapts to

- Every signup is created with `role = "BUYER"` server-side — there's no self-service farmer
  or admin signup. Use the seeded `admin@globalagriculture.com` account (set its password via
  the bcrypt hash placeholder in your SQL) to reach `/admin`.
- There's no "update profile" endpoint, so the Profile page is read-only for address/phone.
- Reviews are read-only (`GET /reviews` only) — there's no create-review endpoint yet, so the
  product page shows existing reviews but has no "write a review" form.
