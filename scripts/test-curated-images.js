import { checkUrl } from "./check-images.js";

const images = [
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
  "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
  "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80",
  "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555e5?w=800&q=80",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
];

async function run() {
  console.log("Checking " + images.length + " URLs...");
  for (let i = 0; i < images.length; i++) {
    const ok = await checkUrl(images[i]);
    console.log(`[${i + 1}/${images.length}] ${ok ? "✅ OK" : "❌ FAIL"}: ${images[i]}`);
  }
}
run();
