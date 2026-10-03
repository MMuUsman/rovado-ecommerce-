import CategoryProductsPage from "./CategoryProductsPage";

export default function CellphonesPage() {
  return (
    <CategoryProductsPage
      categoryKey="cellphones-tablets"
      pageTitle="Top Cell Phones & Tablets"
      breadcrumbLabel="Top Cell Phones & Tablets"
      sidebarTitle="Cell Phones & Tablets"
      heroBanner={{
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=864&q=80",
        title: "Noise Cancelling Headphone",
        subtitle: "Boso Over-Ear Headphone",
        cta: "Buy Now",
      }}
      sideBanner={{
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=428&q=80",
        title: "Redmi Note 12 Pro+ 5G",
        subtitle: "Rise to the challenge",
        cta: "Shop Now",
      }}
      popularCategories={[
        {
          name: "iPhone (iOS)",
          items: 74,
          sub: "iphone",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80",
        },
        {
          name: "Samsung",
          items: 35,
          brand: "Samsung",
          image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&q=80",
        },
        {
          name: "Xiaomi",
          items: 52,
          brand: "Xiaomi",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80",
        },
        {
          name: "Google",
          items: 12,
          brand: "Google",
          image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&q=80",
        },
        {
          name: "OnePlus",
          items: 8,
          brand: "OnePlus",
          image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=100&q=80",
        },
        {
          name: "Tablets",
          items: 29,
          sub: "tablet",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&q=80",
        },
        {
          name: "iPad",
          items: 22,
          sub: "ipad",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&q=80",
        },
        {
          name: "5G Support",
          items: 12,
          sub: "5g",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80",
        },
        {
          name: "Accessories",
          items: 33,
          sub: "accessor",
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80",
        },
        {
          name: "eReader",
          items: 5,
          sub: "reader",
          image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&q=80",
        },
      ]}
      sidebarCategories={[
  { name: "iPhone (iOS)", keyword: "iphone" },
  { name: "Samsung", keyword: "samsung" },
  { name: "Xiaomi", keyword: "xiaomi" },
  { name: "Google", keyword: "google" },
  { name: "OnePlus", keyword: "oneplus" },
  { name: "Tablets", keyword: "tablet" },
  { name: "iPad", keyword: "ipad" },
  { name: "5G Support", keyword: "5g" },
  { name: "Accessories", keyword: "accessor" },
]}
    />
  );
}