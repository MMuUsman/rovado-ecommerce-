import CategoryProductsPage from "./CategoryProductsPage";

export default function LaptopsPage() {
  return (
    <CategoryProductsPage
      categoryKey="laptops-computers"
      pageTitle="Best Laptops & Computers"
      breadcrumbLabel="Best Laptops & Computers"
      sidebarTitle="Laptops & Computers"
      heroBanner={{
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=864&q=80",
        title: "MacBook Pro M3 Max",
        subtitle: "Power meets performance",
        cta: "Explore Now",
      }}
      sideBanner={{
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=428&q=80",
        title: "Gaming Laptops",
        subtitle: "RTX 40 Series",
        cta: "Buy Now",
      }}
      popularCategories={[
        {
          name: "MacBook",
          items: 24,
          brand: "Apple",
          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&q=80",
        },
        {
          name: "Dell",
          items: 12,
          brand: "Dell",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80",
        },
        {
          name: "HP",
          items: 9,
          brand: "HP",
          image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555e5?w=100&q=80",
        },
        {
          name: "Asus",
          items: 15,
          brand: "Asus",
          image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=100&q=80",
        },
        {
          name: "Lenovo",
          items: 11,
          brand: "Lenovo",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80",
        },
        {
          name: "Gaming",
          items: 18,
          sub: "gaming",
          image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&q=80",
        },
        {
          name: "Monitors",
          items: 22,
          sub: "monitor",
          image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80",
        },
        {
          name: "Accessories",
          items: 28,
          sub: "accessor",
          image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80",
        },
        {
          name: "Secondhand",
          items: 14,
          sub: "secondhand",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80",
        },
        {
          name: "Gaming PC",
          items: 8,
          sub: "gaming pc",
          image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&q=80",
        },
      ]}
      sidebarCategories={[
        { name: "All", keyword: "all" },
        { name: "MacBook", keyword: "macbook" },
        { name: "Dell", keyword: "dell" },
        { name: "HP", keyword: "hp" },
        { name: "Asus", keyword: "asus" },
        { name: "Lenovo", keyword: "lenovo" },
        { name: "Acer", keyword: "acer" },
        { name: "Gaming", keyword: "gaming" },
        { name: "Monitors", keyword: "monitor" },
        { name: "Accessories", keyword: "accessor" },
      ]}
    />
  );
}