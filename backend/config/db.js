const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            retryWrites: true,
            writeConcern: { w: 'majority', j: true },
            readConcern: { level: 'majority' }
        });

        console.log(`MongoDB Connected: ${conn.connection.host} (majority write concern)`);

        try {
            const Order = require('../models/Order');
            await Order.collection.dropIndex('paystackReference_1').catch(() => {});
            await Order.updateMany({ paystackReference: null }, { $unset: { paystackReference: 1 } }).catch(() => {});

            const models = [
                require('../models/Product'),
                Order,
                require('../models/Admin'),
                require('../models/Category'),
                require('../models/Review'),
                require('../models/GalleryItem'),
                require('../models/Setting'),
                require('../models/Brand')
            ];
            await Promise.all(models.map((model) => model.createIndexes()));
            console.log('MongoDB indexes ensured');
        } catch (indexError) {
            console.warn(`Index ensure skipped: ${indexError.message}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
