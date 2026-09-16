export const getVisibleCartIcon = () => {
  if (typeof document === "undefined") return null;
  const candidates = Array.from(document.querySelectorAll("[data-cart-fly-target]"));
  return (
    candidates.find((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return false;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
      let node = el;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return false;
        node = node.parentElement;
      }
      return true;
    }) || null
  );
};
