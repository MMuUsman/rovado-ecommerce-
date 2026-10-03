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
        { name: "Macbook", items: 24, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&q=80" },
        { name: "Gaming PC", items: 15, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&q=80" },
        { name: "Laptop Office", items: 32, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
        { name: "M1 2023", items: 18, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&q=80" },
        { name: "Dell XPS", items: 9, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
        { name: "Asus ROG", items: 12, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=100&q=80" },
        { name: "HP Spectre", items: 6, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555e5?w=100&q=80" },
        { name: "Accessories", items: 28, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80" },
        { name: "Monitors", items: 22, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80" },
        { name: "Secondhand", items: 14, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
      ]}
      sidebarCategories={[
        "MacBook",
        "Dell",
        "HP",
        "Asus",
        "Lenovo",
        "Acer",
        "Gaming",
        "Monitors",
      ]}
    />
  );
}