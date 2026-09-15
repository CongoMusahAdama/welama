const Brand = require('../models/Brand');

const sanitizeBrand = (body = {}) => {
    const name = String(body.name || '').trim();
    const logoUrl = String(body.logoUrl || '').trim();
    const sortOrder = Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : undefined;

    return { name, logoUrl, sortOrder };
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ sortOrder: 1, createdAt: 1 });
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name, logoUrl, sortOrder } = sanitizeBrand(req.body);
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide a brand name' });
        }
        if (!logoUrl) {
            return res.status(400).json({ success: false, message: 'Please upload a brand logo' });
        }

        const last = await Brand.findOne().sort({ sortOrder: -1 });
        const brand = await Brand.create({
            name,
            logoUrl,
            sortOrder: sortOrder ?? ((last?.sortOrder ?? -1) + 1)
        });
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A brand with that name already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { name, logoUrl, sortOrder } = sanitizeBrand(req.body);
        const updates = {};
        if (name) updates.name = name;
        if (logoUrl) updates.logoUrl = logoUrl;
        if (sortOrder !== undefined) updates.sortOrder = sortOrder;

        const brand = await Brand.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A brand with that name already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        await brand.deleteOne();
        res.status(200).json({ success: true, message: 'Brand removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
