const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

const backfillSkus = async () => {
    try {
        await connectDB();
        
        const products = await Product.find({ sku: { $exists: false } });
        console.log(`Found ${products.length} products without SKUs.`);

        for (const product of products) {
            // Saving will trigger the pre-save hook in the model which generates SKU
            await product.save();
            console.log(`Backfilled SKU for: ${product.name}`);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

backfillSkus();
