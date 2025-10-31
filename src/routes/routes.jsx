import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { ROUTES } from "../data/data";

const OverView = () => <h1 className="text-xl font-semibold">overView</h1>;
const ProductsList = () => <h1 className="text-xl font-semibold">Products</h1>;
const ProductNew = () => <h1 className="text-xl font-semibold">New Product</h1>;
const ProductEdit = () => (
  <h1 className="text-xl font-semibold">Edit Product</h1>
);
const Simple = ({ label }) => <div>{label}</div>;

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={ROUTES.overview()} element={<OverView />} />
          <Route path={ROUTES.productsList()} element={<ProductsList />} />
          <Route path={ROUTES.productNew()} element={<ProductNew />} />
          <Route path={ROUTES.productEdit()} element={<ProductEdit />} />

          <Route
            path={ROUTES.categories()}
            element={<Simple label="Categories" />}
          />
          <Route path={ROUTES.brands()} element={<Simple label="Brands" />} />
          <Route
            path={ROUTES.attributes()}
            element={<Simple label="Attributes" />}
          />
          <Route path={ROUTES.orders()} element={<Simple label="Orders" />} />
          <Route path={ROUTES.coupons()} element={<Simple label="Coupons" />} />
          <Route path={ROUTES.pages()} element={<Simple label="Pages" />} />
          <Route path={ROUTES.banners()} element={<Simple label="Banners" />} />
          <Route
            path={ROUTES.settings()}
            element={<Simple label="Settings" />}
          />
          <Route path={ROUTES.system()} element={<Simple label="System" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
