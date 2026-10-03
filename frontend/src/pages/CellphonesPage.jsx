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
        { name: "iPhone (iOS)", items: 74, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80" },
        { name: "Android", items: 35, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&q=80" },
        { name: "5G Support", items: 12, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80" },
        { name: "Apple Tablets", items: 22, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&q=80" },
        { name: "Smartphone Chargers", items: 33, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80" },
        { name: "Gaming", items: 9, image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&q=80" },
        { name: "Xiaomi", items: 52, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&q=80" },
        { name: "Accessories", items: 29, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80" },
        { name: "Samsung Tablets", items: 26, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&q=80" },
        { name: "eReader", items: 5, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&q=80" },
      ]}
      sidebarCategories={[
        "iPhone (iOS)",
        "Android",
        "Samsung",
        "Xiaomi",
        "OnePlus",
        "Google",
        "Tablets",
        "Accessories",
      ]}
    />
  );
}