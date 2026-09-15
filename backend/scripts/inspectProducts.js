const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const emptySkus = await Product.find({ sku: "" });
        console.log(`Products with empty string SKU: ${emptySkus.length}`);
        
        const nullSkus = await Product.find({ sku: null });
        console.log(`Products with null SKU: ${nullSkus.length}`);
        
        const noSkus = await Product.find({ sku: { $exists: false } });
        console.log(`Products without SKU field: ${noSkus.length}`);

        if (emptySkus.length > 0) {
            console.log('Sample empty SKU products:', emptySkus.map(p => p.name));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

inspect();
