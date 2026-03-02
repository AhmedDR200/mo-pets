const axios = require("axios");
const cheerio = require("cheerio");
const Category = require("../models/Category.model");
const SubCategory = require("../models/SubCategory.model");
const Product = require("../models/Product.model");

const BASE_URL = "https://the-petshop.com";
const HOMEPAGE_URL = `${BASE_URL}/ar`;
const REQUEST_DELAY_MS = 1500;
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 20000;

const ARABIC_DIGIT_MAP = {
  "\u0660": "0", "\u0661": "1", "\u0662": "2", "\u0663": "3", "\u0664": "4",
  "\u0665": "5", "\u0666": "6", "\u0667": "7", "\u0668": "8", "\u0669": "9",
};

let lastScrapeResult = null;

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function convertArabicNumerals(text) {
  return text
    .replace(/[\u0660-\u0669]/g, (ch) => ARABIC_DIGIT_MAP[ch] || ch)
    .replace(/\u066C/g, ",");
}

function parsePrice(raw) {
  if (!raw) return 0;
  let text = convertArabicNumerals(raw);
  text = text
    .replace(/ج\.م\.?/g, "")
    .replace(/\u200F/g, "")
    .replace(/\u200E/g, "")
    .replace(/[٬,]/g, "")
    .replace(/\s+/g, "")
    .trim();
  const num = parseFloat(text);
  return Number.isFinite(num) ? num : 0;
}

function normalizeUrl(href) {
  if (!href) return null;
  try {
    return new URL(href, BASE_URL).href;
  } catch {
    return null;
  }
}

async function fetchHtml(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "ar,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      return data;
    } catch (err) {
      console.error(
        `  [fetch] attempt ${attempt}/${retries} failed for ${url}: ${err.message}`,
      );
      if (attempt === retries) throw err;
      await delay(2000 * attempt);
    }
  }
}

// ---------------------------------------------------------------------------
// Homepage parsing – discover categories & subcategory links
// ---------------------------------------------------------------------------

function discoverCategories(html) {
  const $ = cheerio.load(html);
  const catGroups = [
    { key: "cats", name: "Cats", description: "مستلزمات القطط - Cat products and supplies" },
    { key: "dogs", name: "Dogs", description: "مستلزمات الكلاب - Dog products and supplies" },
  ];

  const results = catGroups.map((g) => ({
    ...g,
    subCategories: [],
  }));

  const allLinks = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const full = normalizeUrl(href);
    if (!full) return;
    const path = new URL(full).pathname;
    if (!path.startsWith("/ar/product/")) return;
    const segments = path
      .replace("/ar/product/", "")
      .split("/")
      .filter(Boolean);
    if (segments.length !== 1) return;
    const text = $(el).text().trim();
    if (!text) return;
    allLinks.push({ el, href: full, text, slug: decodeURIComponent(segments[0]) });
  });

  const seenUrls = new Set();

  allLinks.forEach((link) => {
    if (seenUrls.has(link.href)) return;
    seenUrls.add(link.href);

    const name = link.text
      .replace(/[\u0660-\u0669]+\s*المنتجات/g, "")
      .replace(/\d+\s*المنتجات/g, "")
      .trim();
    if (!name) return;

    const countMatch = convertArabicNumerals(link.text).match(/(\d+)\s*المنتجات/);
    const productCount = countMatch ? parseInt(countMatch[1], 10) : 0;

    const sub = { name, url: link.href, slug: link.slug, productCount };

    const slugLower = link.slug.toLowerCase();
    if (
      slugLower.includes("dog") ||
      slugLower.includes("كلب") ||
      slugLower.includes("كلاب")
    ) {
      results[1].subCategories.push(sub);
    } else if (
      slugLower.includes("cat") ||
      slugLower.includes("قط") ||
      slugLower.includes("litter") ||
      slugLower.includes("رمل") ||
      slugLower.includes("snack") ||
      slugLower.includes("مكاف")
    ) {
      results[0].subCategories.push(sub);
    } else {
      // Shared categories (PET CARE, accessories) → put under Cats
      results[0].subCategories.push(sub);
    }
  });

  return results;
}

// ---------------------------------------------------------------------------
// Category / subcategory page parsing – extract products
// ---------------------------------------------------------------------------

function extractProductsFromPage(html) {
  const $ = cheerio.load(html);
  const products = [];
  const productLinks = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const full = normalizeUrl(href);
    if (!full) return;
    const path = new URL(full).pathname;
    if (!path.startsWith("/ar/product/")) return;
    const segments = path
      .replace("/ar/product/", "")
      .split("/")
      .filter(Boolean);
    if (segments.length !== 2) return;
    const text = $(el).text().trim();
    if (
      !text ||
      text === "خصم" ||
      text === "نفدت الكمية" ||
      text === "اشتري الآن" ||
      text === "حدد اختيارك" ||
      text === "مجاني"
    ) {
      return;
    }
    if (productLinks.find((p) => p.href === full)) return;
    productLinks.push({ el, href: full, name: text });
  });

  productLinks.forEach(({ el, href, name }) => {
    const $el = $(el);
    const $container =
      $el.closest("li").length ? $el.closest("li") :
      $el.closest("article").length ? $el.closest("article") :
      $el.closest('[class*="product"]').length ? $el.closest('[class*="product"]') :
      $el.closest('[class*="card"]').length ? $el.closest('[class*="card"]') :
      $el.parent().parent().parent();

    const containerText = convertArabicNumerals($container.text());
    const containerHtml = $container.html() || "";

    // Extract image
    let image = null;
    const $img = $container.find("img").first();
    if ($img.length) {
      image = $img.attr("src") || $img.attr("data-src") || $img.attr("srcset")?.split(" ")[0] || null;
      if (image) image = normalizeUrl(image);
    }

    // Extract prices – only match numbers directly followed by "ج.م."
    // to avoid false positives from product names ("20kg") or ratings ("0/5")
    const priceRegex = /([\d,]+(?:\.\d+)?)\s*ج\.م\./g;
    const priceMatches = [];
    let match;
    while ((match = priceRegex.exec(containerText)) !== null) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (Number.isFinite(val) && val > 0) priceMatches.push(val);
    }

    const uniquePrices = priceMatches.filter(
      (v, i, arr) => i === 0 || v !== arr[i - 1],
    );

    let retailPrice = 0;
    let originalPrice = null;
    if (uniquePrices.length >= 2) {
      // First is original (higher), second is sale price
      originalPrice = uniquePrices[0];
      retailPrice = uniquePrices[1];
    } else if (uniquePrices.length === 1) {
      retailPrice = uniquePrices[0];
    }

    const outOfStock =
      containerHtml.includes("نفدت الكمية") ||
      containerHtml.includes("out-of-stock") ||
      containerHtml.includes("sold-out");

    const hasDiscount =
      containerHtml.includes("خصم") ||
      containerHtml.includes("sale") ||
      originalPrice != null;

    products.push({
      name: name.trim(),
      url: href,
      image,
      retailPrice,
      originalPrice,
      outOfStock,
      hasDiscount,
    });
  });

  return products;
}

function detectMaxPage(html) {
  const $ = cheerio.load(html);
  let maxPage = 1;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/[?&]page=(\d+)/);
    if (match) {
      const p = parseInt(match[1], 10);
      if (p > maxPage) maxPage = p;
    }
  });

  return maxPage;
}

async function scrapeAllProductsForSubCategory(subCatUrl) {
  console.log(`  [scrape] fetching first page: ${subCatUrl}`);
  const firstPageHtml = await fetchHtml(subCatUrl);
  const maxPage = detectMaxPage(firstPageHtml);
  console.log(`  [scrape] detected ${maxPage} page(s)`);

  let allProducts = extractProductsFromPage(firstPageHtml);
  console.log(`  [scrape] page 1: ${allProducts.length} products`);

  for (let page = 2; page <= maxPage; page++) {
    await delay(REQUEST_DELAY_MS);
    const separator = subCatUrl.includes("?") ? "&" : "?";
    const pageUrl = `${subCatUrl}${separator}page=${page}`;
    console.log(`  [scrape] fetching page ${page}: ${pageUrl}`);
    try {
      const html = await fetchHtml(pageUrl);
      const products = extractProductsFromPage(html);
      console.log(`  [scrape] page ${page}: ${products.length} products`);
      if (products.length === 0) break;
      allProducts = allProducts.concat(products);
    } catch (err) {
      console.error(`  [scrape] failed to fetch page ${page}: ${err.message}`);
    }
  }

  return allProducts;
}

// ---------------------------------------------------------------------------
// Database persistence – upsert scraped data into MongoDB
// ---------------------------------------------------------------------------

async function saveToDatabase(categoriesData) {
  const summary = {
    categories: 0,
    subCategories: 0,
    products: 0,
    errors: [],
  };

  for (const catData of categoriesData) {
    try {
      const category = await Category.findOneAndUpdate(
        { name: catData.name },
        {
          name: catData.name,
          description: catData.description,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      summary.categories++;
      console.log(`[db] category upserted: ${category.name} (${category._id})`);

      for (const subData of catData.subCategories) {
        try {
          const subCategory = await SubCategory.findOneAndUpdate(
            { name: subData.name, category: category._id },
            {
              name: subData.name,
              description: `${subData.name} - Scraped from the-petshop.com`,
              category: category._id,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
          summary.subCategories++;
          console.log(`  [db] subcategory upserted: ${subCategory.name} (${subCategory._id})`);

          await Category.updateOne(
            { _id: category._id },
            { $addToSet: { subCategories: subCategory._id } },
          );

          const productIds = [];

          for (const prodData of subData.products) {
            try {
              if (prodData.retailPrice <= 0) continue;
              const wholesalePrice = Math.round(prodData.retailPrice * 0.8);

              const product = await Product.findOneAndUpdate(
                {
                  name: prodData.name,
                  category: category._id,
                  subCategory: subCategory._id,
                },
                {
                  name: prodData.name,
                  retailPrice: prodData.retailPrice,
                  wholesalePrice,
                  originalRetailPrice: prodData.originalPrice || prodData.retailPrice,
                  originalWholesalePrice: Math.round(
                    (prodData.originalPrice || prodData.retailPrice) * 0.8,
                  ),
                  hasActiveOffer: prodData.hasDiscount && prodData.originalPrice != null,
                  stock: prodData.outOfStock ? 0 : 1,
                  image: prodData.image || undefined,
                  description: prodData.name,
                  category: category._id,
                  subCategory: subCategory._id,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true },
              );
              productIds.push(product._id);
              summary.products++;
            } catch (err) {
              summary.errors.push(`Product "${prodData.name}": ${err.message}`);
            }
          }

          if (productIds.length > 0) {
            await SubCategory.updateOne(
              { _id: subCategory._id },
              { $addToSet: { products: { $each: productIds } } },
            );
            await Category.updateOne(
              { _id: category._id },
              { $addToSet: { products: { $each: productIds } } },
            );
          }
        } catch (err) {
          summary.errors.push(`SubCategory "${subData.name}": ${err.message}`);
        }
      }
    } catch (err) {
      summary.errors.push(`Category "${catData.name}": ${err.message}`);
    }
  }

  return summary;
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

async function runFullScrape() {
  const startTime = Date.now();
  console.log("=== Pet Shop Scraper: Starting ===");

  // Step 1: Discover categories from homepage
  console.log("[step 1] Fetching homepage...");
  const homepageHtml = await fetchHtml(HOMEPAGE_URL);
  const categories = discoverCategories(homepageHtml);

  const totalSubs = categories.reduce((s, c) => s + c.subCategories.length, 0);
  console.log(
    `[step 1] Discovered ${categories.length} categories, ${totalSubs} subcategories`,
  );
  categories.forEach((cat) => {
    console.log(`  ${cat.name}: ${cat.subCategories.map((s) => s.name).join(", ")}`);
  });

  // Step 2: Scrape products for each subcategory
  console.log("\n[step 2] Scraping products...");
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      console.log(`\n--- ${cat.name} > ${sub.name} (${sub.url}) ---`);
      try {
        await delay(REQUEST_DELAY_MS);
        const products = await scrapeAllProductsForSubCategory(sub.url);
        sub.products = products;
        console.log(`  => total: ${products.length} products scraped`);
      } catch (err) {
        console.error(`  => FAILED: ${err.message}`);
        sub.products = [];
      }
    }
  }

  // Step 3: Save to database
  console.log("\n[step 3] Saving to database...");
  const dbSummary = await saveToDatabase(categories);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const result = {
    status: "completed",
    elapsed: `${elapsed}s`,
    timestamp: new Date().toISOString(),
    summary: dbSummary,
    categories: categories.map((c) => ({
      name: c.name,
      subCategories: c.subCategories.map((s) => ({
        name: s.name,
        productsScraped: s.products?.length || 0,
      })),
    })),
  };

  lastScrapeResult = result;
  console.log("\n=== Pet Shop Scraper: Complete ===");
  console.log(`  Time: ${elapsed}s`);
  console.log(`  Categories: ${dbSummary.categories}`);
  console.log(`  SubCategories: ${dbSummary.subCategories}`);
  console.log(`  Products: ${dbSummary.products}`);
  if (dbSummary.errors.length > 0) {
    console.log(`  Errors: ${dbSummary.errors.length}`);
  }

  return result;
}

function getLastScrapeResult() {
  return lastScrapeResult;
}

module.exports = {
  runFullScrape,
  getLastScrapeResult,
  discoverCategories,
  extractProductsFromPage,
  parsePrice,
  convertArabicNumerals,
};
