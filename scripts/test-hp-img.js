import { checkUrl } from "./check-images.js";
const testUrls = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
  "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80"
];
for (const u of testUrls) {
  console.log(u, "->", await checkUrl(u));
}
