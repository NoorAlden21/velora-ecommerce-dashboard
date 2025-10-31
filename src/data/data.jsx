// src/data/data.jsx
const P = {
  ROOT: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  BRANDS: "/brands",
  ATTRIBUTES: "/attributes",
  ORDERS: "/orders",
  COUPONS: "/coupons",
  CONTENT: "/content",
  PAGES: "/content/pages",
  BANNERS: "/content/banners",
  SETTINGS: "/settings",
  SYSTEM: "/system",
};

export const ROUTES = {
  overview: () => P.ROOT,

  productsList: () => P.PRODUCTS,
  productNew: () => `${P.PRODUCTS}/new`,
  productEdit: (id = ":id") => `${P.PRODUCTS}/${id}`,

  categories: () => P.CATEGORIES,
  brands: () => P.BRANDS,
  attributes: () => P.ATTRIBUTES,

  orders: () => P.ORDERS,
  coupons: () => P.COUPONS,

  pages: () => P.PAGES,
  banners: () => P.BANNERS,

  settings: () => P.SETTINGS,
  system: () => P.SYSTEM,
};

// Optional: named params helper if you like objects
export const withId = (base, id) => base(id);
