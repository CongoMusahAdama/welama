const Product = require('../models/Product');
const { hasVariants, totalStock, normalizeSize, colorName } = require('./productStock');

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

const syncStatus = (product) => {
    const remaining = totalStock(product);
    product.stock = remaining;
    if (remaining <= 0) {
        product.status = 'Sold Out';
        product.soldOutAt = product.soldOutAt || new Date();
    } else if (product.status === 'Sold Out') {
        product.status = 'Active';
        product.soldOutAt = null;
    }
};

const decrementStock = async (items = [], session) => {
    for (const item of items) {
        if (!item?.productId || !isMongoId(item.productId) || item.qty <= 0) continue;

        const product = await Product.findById(item.productId).session(session);
        if (!product) {
            const err = new Error(`Product not found for ${item.name || 'item'}`);
            err.status = 409;
            throw err;
        }

        if (hasVariants(product)) {
            const color = colorName(item.color);
            const size = normalizeSize(item.size);
            const variant = product.variants.find(
                (row) => same(row.color, color) && same(normalizeSize(row.size), size)
            );
            if (!variant || Number(variant.stock) < item.qty) {
                const label = [color, size].filter(Boolean).join(' / ') || item.name || 'product';
                const err = new Error(`Insufficient stock for ${label}`);
                err.status = 409;
                throw err;
            }
            variant.stock = Number(variant.stock) - item.qty;
            syncStatus(product);
            await product.save({ session });
            continue;
        }

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
        if (!item?.productId || !isMongoId(item.productId) || item.qty <= 0) continue;

        const product = await Product.findById(item.productId).session(session);
        if (!product) continue;

        if (hasVariants(product)) {
            const color = colorName(item.color);
            const size = normalizeSize(item.size);
            const variant = product.variants.find(
                (row) => same(row.color, color) && same(normalizeSize(row.size), size)
            );
            if (variant) {
                variant.stock = Number(variant.stock || 0) + item.qty;
            } else {
                product.variants.push({ color, size, stock: item.qty });
            }
            syncStatus(product);
            await product.save({ session });
            continue;
        }

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
