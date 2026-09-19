const colorName = (value) => {
    if (value && typeof value === 'object') return String(value.name || '').trim();
    return String(value || '').trim();
};

const normalizeSize = (value) => {
    const size = String(value || '').trim();
    if (!size || /^standard$/i.test(size)) return '';
    return size;
};

const normalizeColor = (value) => colorName(value);

const hasVariants = (product) => Array.isArray(product?.variants) && product.variants.length > 0;

const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

const totalStock = (product) => {
    if (hasVariants(product)) {
        return product.variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);
    }
    return Number(product?.stock) || 0;
};

const variantStock = (product, color, size) => {
    if (!hasVariants(product)) return Number(product?.stock) || 0;
    const colorKey = normalizeColor(color);
    const sizeKey = normalizeSize(size);
    const match = product.variants.find(
        (row) => same(row.color, colorKey) && same(normalizeSize(row.size), sizeKey)
    );
    return Number(match?.stock) || 0;
};

const colorAvailable = (product, color, selectedSize) => {
    if (!hasVariants(product)) return totalStock(product) > 0;
    const colorKey = normalizeColor(color);
    const sizeKey = normalizeSize(selectedSize);
    return product.variants.some((row) => {
        if (!same(row.color, colorKey)) return false;
        if (sizeKey && !same(normalizeSize(row.size), sizeKey)) return false;
        return (Number(row.stock) || 0) > 0;
    });
};

const sizeAvailable = (product, size, selectedColor) => {
    if (!hasVariants(product)) return totalStock(product) > 0;
    const colorKey = normalizeColor(selectedColor);
    const sizeKey = normalizeSize(size);
    return product.variants.some((row) => {
        if (!same(normalizeSize(row.size), sizeKey)) return false;
        if (colorKey && !same(row.color, colorKey)) return false;
        return (Number(row.stock) || 0) > 0;
    });
};

const productFullySoldOut = (product) => totalStock(product) <= 0;

const buildVariantGrid = (colors = [], sizes = [], existing = [], fallbackStock = 0) => {
    const colorNames = (Array.isArray(colors) && colors.length ? colors : ['']).map(colorName);
    const sizeNames = Array.isArray(sizes) && sizes.length ? sizes : [''];
    const previous = new Map();
    (existing || []).forEach((row) => {
        previous.set(
            `${normalizeColor(row.color).toLowerCase()}|${normalizeSize(row.size).toLowerCase()}`,
            Number(row.stock) || 0
        );
    });
    const variants = [];
    colorNames.forEach((color) => {
        sizeNames.forEach((size) => {
            const key = `${String(color).toLowerCase()}|${normalizeSize(size).toLowerCase()}`;
            variants.push({
                color,
                size: normalizeSize(size),
                stock: previous.has(key) ? previous.get(key) : 0
            });
        });
    });
    const hasQty = variants.some((row) => (Number(row.stock) || 0) > 0);
    const leftover = Math.max(0, parseInt(fallbackStock, 10) || 0);
    if (!hasQty && leftover > 0 && variants.length) {
        const each = Math.floor(leftover / variants.length);
        let extra = leftover - each * variants.length;
        return variants.map((row) => {
            const add = extra > 0 ? 1 : 0;
            extra -= add;
            return { ...row, stock: each + add };
        });
    }
    return variants;
};

module.exports = {
    colorName,
    normalizeSize,
    normalizeColor,
    hasVariants,
    totalStock,
    variantStock,
    colorAvailable,
    sizeAvailable,
    productFullySoldOut,
    buildVariantGrid
};
