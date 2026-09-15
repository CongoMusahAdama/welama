const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const INITIAL_PRODUCTS = [
  {
    name: "WELAMA Signature Silk Robe Kaftan",
    category: "Dresses",
    price: 520,
    image: "/WELAMA.png",
    images: ["/WELAMA.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Royal Gold", hex: "#D4AF37" },
      { name: "Midnight Black", hex: "#0A0A0A" },
      { name: "Ivory White", hex: "#F8F9FA" },
    ],
    stock: 12,
    status: "Active",
    sku: "WLM-CLT001",
    description: "Handcrafted from pure flowing luxury fabric, designed for effortlessly regal elegance and bespoke tailoring.",
  },
  {
    name: "WELAMA Emerald Luxe Silhouette Gown",
    category: "Dresses",
    price: 480,
    image: "/WELAMA1.png",
    images: ["/WELAMA1.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Emerald Luxe", hex: "#1B5E20" },
      { name: "Onyx Black", hex: "#0A0A0A" },
      { name: "Deep Ruby", hex: "#800020" },
    ],
    stock: 10,
    status: "Active",
    sku: "WLM-CLT002",
    description: "An iconic structured evening silhouette combining traditional African luxury heritage with modern tailored lines.",
  },
  {
    name: "WELAMA Draped Elegance Wrap Dress",
    category: "Dresses",
    price: 450,
    image: "/WALAMA2.png",
    images: ["/WALAMA2.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Earthy Terracotta", hex: "#C77B5D" },
      { name: "Warm Camel", hex: "#B08050" },
      { name: "Classic Noir", hex: "#0A0A0A" },
    ],
    stock: 8,
    status: "Active",
    sku: "WLM-CLT003",
    description: "Flawlessly contoured wrap dress tailored for celebratory galas, daytime luxury outings, and timeless poise.",
  },
  {
    name: "Golden Hour Tote",
    category: "Bags",
    price: 450,
    image: "/bag6.png",
    images: ["/bag6.png"],
    sizes: [],
    colors: [
      { name: "Mustard", hex: "#D4A017" },
      { name: "Black", hex: "#0A0A0A" },
      { name: "Camel", hex: "#B08050" },
    ],
    stock: 8,
    status: "Active",
    sku: "WLM-BAG001",
  },
  {
    name: "Fuchsia Statement Bag",
    category: "Bags",
    price: 420,
    image: "/bag7.png",
    images: ["/bag7.png"],
    sizes: [],
    colors: [
      { name: "Fuchsia", hex: "#C2185B" },
      { name: "Black", hex: "#0A0A0A" },
    ],
    stock: 6,
    status: "Active",
    sku: "WLM-BAG002",
  },
  {
    name: "Emerald Quilted Tote",
    category: "Bags",
    price: 480,
    image: "/bag8.png",
    images: ["/bag8.png"],
    sizes: [],
    colors: [
      { name: "Emerald", hex: "#1B5E20" },
      { name: "Black", hex: "#0A0A0A" },
      { name: "Camel", hex: "#B08050" },
    ],
    stock: 5,
    status: "Active",
    sku: "WLM-BAG003",
  },
  {
    name: "Forest Charm Satchel",
    category: "Bags",
    price: 390,
    image: "/bag9.png",
    images: ["/bag9.png"],
    sizes: [],
    colors: [
      { name: "Forest Green", hex: "#1B4332" },
      { name: "Camel", hex: "#B08050" },
    ],
    stock: 7,
    status: "Active",
    sku: "WLM-BAG004",
  },
  {
    name: "Camel Charm Satchel",
    category: "Bags",
    price: 390,
    image: "/bag10.png",
    images: ["/bag10.png"],
    sizes: [],
    colors: [
      { name: "Camel", hex: "#B08050" },
      { name: "Black", hex: "#0A0A0A" },
    ],
    stock: 7,
    status: "Active",
    sku: "WLM-BAG005",
  },
  {
    name: "Emerald Swirl Midi Dress",
    category: "Dresses",
    price: 320,
    image: "/cloth.png",
    images: ["/cloth.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Emerald Swirl", hex: "#1B5E20" }],
    stock: 10,
    status: "Active",
    sku: "WLM-DRS001",
  },
  {
    name: "Leaf Print Belted Shirt Dress",
    category: "Dresses",
    price: 280,
    image: "/cloth1.png",
    images: ["/cloth1.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Black & White", hex: "#111111" }],
    stock: 9,
    status: "Active",
    sku: "WLM-DRS002",
  },
  {
    name: "Cobalt Bloom Puff-Sleeve Dress",
    category: "Dresses",
    price: 300,
    image: "/cloth3.png",
    images: ["/cloth3.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Cobalt Bloom", hex: "#1E3A8A" }],
    stock: 8,
    status: "Active",
    sku: "WLM-DRS003",
  },
  {
    name: "Marigold Bloom Slit Dress",
    category: "Dresses",
    price: 300,
    image: "/cloth4.png",
    images: ["/cloth4.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Marigold", hex: "#E5A21A" }],
    stock: 8,
    status: "Active",
    sku: "WLM-DRS004",
  },
  {
    name: "Noir Bloom Tie-Shoulder Dress",
    category: "Dresses",
    price: 310,
    image: "/cloth5.png",
    images: ["/cloth5.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Noir Bloom", hex: "#111111" }],
    stock: 8,
    status: "Active",
    sku: "WLM-DRS005",
  },
  {
    name: "Cocoa Tiered Mini Dress",
    category: "Dresses",
    price: 260,
    image: "/cloth6.png",
    images: ["/cloth6.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Cocoa", hex: "#6F4E37" },
      { name: "Black", hex: "#0A0A0A" },
    ],
    stock: 10,
    status: "Active",
    sku: "WLM-DRS006",
  },
  {
    name: "Meadow Ditsy Floral Dress",
    category: "Dresses",
    price: 270,
    image: "/cloth7.png",
    images: ["/cloth7.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Meadow Green", hex: "#588157" }],
    stock: 9,
    status: "Active",
    sku: "WLM-DRS007",
  },
  {
    name: "Sage Smocked Tiered Dress",
    category: "Dresses",
    price: 310,
    image: "/cloth8.png",
    images: ["/cloth8.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Sage Green", hex: "#3A5A40" }],
    stock: 4,
    status: "Active",
    sku: "WLM-DRS008",
  },
  {
    name: "Terracotta Smocked Midi Dress",
    category: "Dresses",
    price: 280,
    image: "/cloth9.png",
    images: ["/cloth9.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Terracotta", hex: "#C77B5D" },
      { name: "Sage Green", hex: "#3A5A40" },
    ],
    stock: 9,
    status: "Active",
    sku: "WLM-DRS009",
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not configured');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Product.countDocuments();
    console.log(`Current DB Product Count: ${count}`);

    if (count === 0) {
      console.log('Seeding initial products into MongoDB...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`Successfully seeded ${INITIAL_PRODUCTS.length} products to MongoDB.`);
    } else {
      console.log('Products already exist in DB. Checking if new WELAMA cloths need to be inserted...');
      for (const item of INITIAL_PRODUCTS) {
        const exists = await Product.findOne({ sku: item.sku });
        if (!exists) {
          await Product.create(item);
          console.log(`+ Added missing product: ${item.name} (${item.sku})`);
        }
      }
    }

    console.log('Product sync completed.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedProducts();
