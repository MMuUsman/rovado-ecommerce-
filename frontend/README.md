# Rovado E-commerce (Responsive React + Tailwind)

Ye project Figma se export hui absolute-positioned (1920px fixed) HTML/JSX ko
mukammal **responsive** React + Tailwind app mein rebuild karta hai — content,
sections, aur design same rakha gaya hai, sirf layout responsive (mobile,
tablet, desktop) banaya gaya hai.

## Pages

| Route         | File                              | Content                                                   |
|---------------|------------------------------------|------------------------------------------------------------|
| `/`           | `src/pages/Home.jsx`              | Header, hero carousel, deals, best sellers, categories, footer |
| `/category`   | `src/pages/CategoryListing.jsx`   | Filter sidebar + product grid + pagination                |
| `/product`    | `src/pages/ProductDetail.jsx`     | Gallery, options, tabs, related products, frequently bought together |
| `/cart`       | `src/pages/Cart.jsx`              | Cart items, quantity controls, order summary               |
| `/checkout`   | `src/pages/Checkout.jsx`          | Billing form, payment method, order summary                |
| `/login`      | `src/pages/Login.jsx`             | Login form                                                  |
| `/register`   | `src/pages/Register.jsx`          | Register form                                               |
| `/profile`    | `src/pages/Profile.jsx`           | Account info sidebar + editable form                        |

Shared: `src/components/Layout.jsx` (Header, PromoBar, Footer, Breadcrumb, PageShell)
and `src/components/Product.jsx` (ProductCard, ProductGridCard, ProductRail, StarRating).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Responsive approach

- Original design tha fixed `w-[1920px]` with `absolute` positioned divs (Figma
  auto-export) — sirf desktop 1920px pe kaam karta tha.
- Rebuild mein har section ko Tailwind `flex` / `grid` + responsive breakpoints
  (`sm:`, `lg:`) diye gaye hain, taake mobile (1 column), tablet, aur desktop
  sab pe layout theek dikhe.
- Sidebar categories mobile pe horizontal-scroll chip list ban jati hain.
- Header pe mobile hamburger menu hai.
- Product grids `grid-cols-2` (mobile) → `grid-cols-3/4` (desktop) tak scale
  hote hain.
- Horizontally-scrolling product rails (best seller, related products) touch
  devices pe swipe-friendly hain.
