import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { ROUTES } from "../data/data";
import Products from "@/components/products/Products";
import NewProduct from "@/components/products/NewProduct";

// tiny placeholders for now
const Overview = () => <h1 className="text-xl font-semibold">Overview</h1>;
// const ProductsList = () => <h1 className="text-xl font-semibold">Products</h1>;
//const ProductNew = () => <h1 className="text-xl font-semibold">New Product</h1>;
const ProductEdit = () => (
  <h1 className="text-xl font-semibold">Edit Product</h1>
);
const Categories = () => <div>Categories</div>;
const Brands = () => <div>Brands</div>;
const Attributes = () => <div>Attributes</div>;
const ProductImages = () => <div>Product Images</div>;
const ColorImages = () => <div>Color Images</div>;
const Orders = () => <div>All Orders</div>;
const Shipments = () => <div>Shipments</div>;
const Payments = () => <div>Payments</div>;
const Coupons = () => <div>Coupons</div>;
const Users = () => <div>Users</div>;
const Pages = () => <div>Pages</div>;
const Banners = () => <div>Banners</div>;
const SettingsAudiences = () => <div>Audiences</div>;
const SettingsShippingTaxes = () => <div>Shipping/Taxes</div>;
const SettingsTeamRoles = () => <div>Teams & Roles</div>;
const SystemActivity = () => <div>Activity</div>;
const SystemQueue = () => <div>Queue</div>;

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Overview */}
          <Route path={ROUTES.overview} element={<Overview />} />

          {/* Catalog */}
          <Route path={ROUTES.products} element={<Products />} />
          <Route path={ROUTES.productNew} element={<NewProduct />} />
          <Route path={ROUTES.productEdit} element={<ProductEdit />} />
          <Route path={ROUTES.categories} element={<Categories />} />
          <Route path={ROUTES.brands} element={<Brands />} />
          <Route path={ROUTES.attributes} element={<Attributes />} />

          {/* Media */}
          <Route path={ROUTES.productImages} element={<ProductImages />} />
          <Route path={ROUTES.colorImages} element={<ColorImages />} />

          {/* Orders */}
          <Route path={ROUTES.orders} element={<Orders />} />
          <Route path={ROUTES.shipments} element={<Shipments />} />
          <Route path={ROUTES.payments} element={<Payments />} />

          {/* Promotions */}
          <Route path={ROUTES.coupons} element={<Coupons />} />

          {/* Customers */}
          <Route path={ROUTES.users} element={<Users />} />

          {/* Content */}
          <Route path={ROUTES.pages} element={<Pages />} />
          <Route path={ROUTES.banners} element={<Banners />} />

          {/* Settings */}
          <Route
            path={ROUTES.settingsAudiences}
            element={<SettingsAudiences />}
          />
          <Route
            path={ROUTES.settingsShippingTaxes}
            element={<SettingsShippingTaxes />}
          />
          <Route
            path={ROUTES.settingsTeamRoles}
            element={<SettingsTeamRoles />}
          />

          {/* System */}
          <Route path={ROUTES.systemActivity} element={<SystemActivity />} />
          <Route path={ROUTES.systemQueue} element={<SystemQueue />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
