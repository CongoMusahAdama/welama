export const sellingPrice = (product) => {
  const list = Number(product?.price);
  const sale = Number(product?.discountPrice);
  if (Number.isFinite(sale) && sale > 0 && (!Number.isFinite(list) || sale <= list)) {
    return sale;
  }
  return Number.isFinite(list) ? list : 0;
};

export const lineTotal = (item) =>
  sellingPrice(item) * Math.max(1, Number(item?.qty) || 1);
