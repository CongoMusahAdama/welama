const Product = require('../models/Product');

const decrementStock = async (items = [], session) => {
    for (const item of items) {
        if (!item?.productId || item.qty <= 0) continue;

        const updated = await Product.findOneAndUpdate(
            { _id: item.productId, stock: { $gte: item.qty } },
            { $inc: { stock: -item.qty } },
            { new: true, session, runValidators: true }
        );

        if (!updated) {
            const err = new Error(`Insufficient stock for ${item.name || 'product'}`);
            err.status = 409;
            throw err;
        }

        if (updated.stock === 0 && updated.status !== 'Sold Out') {
            updated.status = 'Sold Out';
            updated.soldOutAt = new Date();
            await updated.save({ session });
        }
    }
};

const restoreStock = async (items = [], session) => {
    for (const item of items) {
        if (!item?.productId || item.qty <= 0) continue;

        const updated = await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.qty } },
            { new: true, session }
        );

        if (updated && updated.stock > 0 && updated.status === 'Sold Out') {
            updated.status = 'Active';
            updated.soldOutAt = null;
            await updated.save({ session });
        }
    }
};

module.exports = { decrementStock, restoreStock };
