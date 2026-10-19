import fs from "node:fs";

// Read cleanProducts from scripts/rebuild-clean-products.js
const content = fs.readFileSync("scripts/rebuild-clean-products.js", "utf8");
const arrayMatch = content.match(/const cleanProducts = (\[[\s\S]*?\]);\s*async function/);
if (!arrayMatch) {
  console.error("Could not find cleanProducts array");
  process.exit(1);
}

const cleanProducts = eval(arrayMatch[1]);

let sql = "-- Authoritative Products Rebuild\n";
for (const p of cleanProducts) {
  const imagesJson = JSON.stringify(p.images || []).replace(/'/g, "''");
  const desc = (p.description || "").replace(/'/g, "''");
  const shortDesc = (p.short_description || "").replace(/'/g, "''");
  const title = (p.title || "").replace(/'/g, "''");
  const name = (p.name || p.title || "").replace(/'/g, "''");
  const display = (p.display || "").replace(/'/g, "''");
  const os = (p.operating_system || "").replace(/'/g, "''");
  const proc = (p.processor || "").replace(/'/g, "''");
  const ram = (p.ram || "").replace(/'/g, "''");
  const storage = (p.storage || "").replace(/'/g, "''");
  const camera = (p.camera || "").replace(/'/g, "''");
  const gpu = (p.gpu || "").replace(/'/g, "''");

  sql += `
UPDATE public.products SET
  title = '${title}',
  name = '${name}',
  slug = '${p.slug}',
  category = '${p.category}',
  brand = '${p.brand}',
  sku = '${p.sku}',
  price = ${p.price},
  old_price = ${p.old_price},
  sale_price = ${p.sale_price},
  stock = '${p.stock}',
  stock_quantity = ${p.stock_quantity},
  shipping = '${p.shipping}',
  badge = '${p.badge}',
  rating = ${p.rating},
  reviews = ${p.reviews},
  ram = '${ram}',
  storage = '${storage}',
  processor = '${proc}',
  display = '${display}',
  operating_system = '${os}',
  camera = '${camera}',
  gpu = '${gpu}',
  image = '${p.image}',
  images = '${imagesJson}'::jsonb,
  additional_images = '${imagesJson}'::jsonb,
  short_description = '${shortDesc}',
  description = '${desc}',
  is_new = ${p.is_new},
  is_best_seller = ${p.is_best_seller},
  is_popular = ${p.is_popular},
  is_deal = ${p.is_deal},
  is_featured = ${p.is_featured},
  is_active = true,
  updated_at = now()
WHERE id = ${p.id};
`;
}

fs.writeFileSync("scripts/update-products.sql", sql);
console.log("Generated scripts/update-products.sql with " + cleanProducts.length + " product updates.");
