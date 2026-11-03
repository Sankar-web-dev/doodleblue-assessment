require("dotenv").config();
const connectDB = require("../config/db");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const categories = [
    { name: "Electronics" },
    { name: "Footwear" },
    { name: "Home & Kitchen" },
    { name: "Clothing" },
    { name: "Accessories" },
    { name: "Bags" },
];

const seed = async () => {
    await connectDB();

    await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        Coupon.deleteMany({}),
    ]);
    console.log("Cleared existing categories, products and coupons");

    const createdCategories = await Category.insertMany(categories);
    const cat = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));
    console.log(`Created ${createdCategories.length} categories`);

    const products = [
        {
            name: "Wireless Over-Ear Headphones",
            description: "Over-ear Bluetooth headphones with soft memory-foam cushions, a foldable design and up to 30 hours of battery life.",
            category: cat["Electronics"],
            brand: "Kadai Basics",
            price: 79.99,
            comparePrice: 99.99,
            images: [img("headphones-1"), img("headphones-2"), img("headphones-3"), img("headphones-4")],
            rating: 4.5,
            reviewCount: 128,
            stock: 34,
            tags: ["bluetooth", "wireless", "headphones", "audio"],
            specifications: { "Battery life": "30 hours", "Connectivity": "Bluetooth 5.3", "Weight": "250g", "Noise cancellation": "Active" },
            isFeatured: true,
        },
        {
            name: "Running Shoes",
            description: "Lightweight running shoes with breathable mesh upper and responsive foam cushioning for daily training.",
            category: cat["Footwear"],
            brand: "Kadai Sport",
            price: 64.50,
            images: [img("shoes-1"), img("shoes-2")],
            rating: 4.6,
            reviewCount: 304,
            stock: 42,
            tags: ["running", "shoes", "sport"],
            specifications: { "Upper": "Breathable mesh", "Sole": "EVA foam", "Weight": "240g" },
        },
        {
            name: "Smart Fitness Watch",
            description: "Fitness smartwatch with heart-rate tracking, GPS, sleep monitoring and a 10-day battery life.",
            category: cat["Electronics"],
            brand: "Kadai Tech",
            price: 134.10,
            comparePrice: 149.00,
            images: [img("watch-1"), img("watch-2"), img("watch-3")],
            rating: 4.3,
            reviewCount: 212,
            stock: 18,
            tags: ["smartwatch", "fitness", "wearable"],
            specifications: { "Display": "1.4\" AMOLED", "Battery": "10 days", "Water resistance": "5ATM" },
            isFeatured: true,
        },
        {
            name: "Leather Laptop Backpack",
            description: "Full-grain leather backpack with a padded 15\" laptop compartment and multiple organizer pockets.",
            category: cat["Bags"],
            brand: "Kadai Leather",
            price: 54.00,
            images: [img("backpack-1"), img("backpack-2")],
            rating: 4.7,
            reviewCount: 86,
            stock: 6,
            tags: ["backpack", "leather", "laptop"],
            specifications: { "Material": "Full-grain leather", "Laptop fit": "Up to 15\"", "Capacity": "22L" },
        },
        {
            name: "Ceramic Coffee Mug Set",
            description: "Set of 4 hand-glazed ceramic mugs, 350ml each, dishwasher and microwave safe.",
            category: cat["Home & Kitchen"],
            brand: "Kadai Home",
            price: 24.99,
            images: [img("mugs-1")],
            rating: 4.8,
            reviewCount: 59,
            stock: 25,
            tags: ["mugs", "ceramic", "kitchen"],
            specifications: { "Material": "Ceramic", "Capacity": "350ml", "Count": "4 mugs" },
        },
        {
            name: "LED Desk Lamp",
            description: "Dimmable LED desk lamp with adjustable color temperature, USB charging port and touch controls.",
            category: cat["Home & Kitchen"],
            brand: "Kadai Home",
            price: 32.00,
            comparePrice: 40.00,
            images: [img("lamp-1"), img("lamp-2")],
            rating: 4.4,
            reviewCount: 97,
            stock: 30,
            tags: ["lamp", "led", "desk", "lighting"],
            specifications: { "Brightness": "800 lumens", "Color temperature": "2700K-6500K", "Power": "USB-C" },
        },
        {
            name: "Cotton Crew T-Shirt",
            description: "Classic crew-neck t-shirt in soft combed cotton with a relaxed everyday fit.",
            category: cat["Clothing"],
            brand: "Kadai Wear",
            price: 14.99,
            images: [img("tshirt-1")],
            rating: 4.2,
            reviewCount: 410,
            stock: 120,
            tags: ["t-shirt", "cotton", "clothing"],
            specifications: { "Material": "100% combed cotton", "Fit": "Relaxed", "Care": "Machine wash" },
        },
        {
            name: "Polarized Sunglasses",
            description: "UV400 polarized sunglasses with a lightweight acetate frame and anti-glare lenses.",
            category: cat["Accessories"],
            brand: "Kadai Eyewear",
            price: 28.00,
            images: [img("sunglasses-1"), img("sunglasses-2")],
            rating: 4.5,
            reviewCount: 73,
            stock: 3,
            tags: ["sunglasses", "polarized", "accessories"],
            specifications: { "Lens": "Polarized UV400", "Frame": "Acetate", "Weight": "28g" },
        },
        {
            name: "Bluetooth Speaker",
            description: "Portable Bluetooth speaker with 360-degree sound, IPX7 waterproofing and 20-hour battery life.",
            category: cat["Electronics"],
            brand: "Kadai Audio",
            price: 45.00,
            images: [img("speaker-1"), img("speaker-2")],
            rating: 4.4,
            reviewCount: 150,
            stock: 22,
            tags: ["speaker", "bluetooth", "audio", "portable"],
            specifications: { "Battery": "20 hours", "Waterproof": "IPX7", "Output": "20W" },
        },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    await Coupon.create({ code: "SAVE10", discountPercent: 10 });
    console.log("Created coupon: SAVE10 (10% off)");

    console.log("Seed completed successfully");
    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
