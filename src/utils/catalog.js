export const isBuilderCatalogItem = (product) => {
  const id = String(product?._id || product?.id || "");
  return id.startsWith("sample-") || id.startsWith("gallery-sample-");
};

export const liveCatalog = (list) =>
  (Array.isArray(list) ? list : []).filter((product) => !isBuilderCatalogItem(product));
