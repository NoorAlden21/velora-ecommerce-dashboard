import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  Images,
  ShoppingCart,
  BadgePercent,
  Users,
  FileText,
  Settings,
  Server,
  ChevronRight,
  Boxes,
  Palette,
  Truck,
  CreditCard,
  Percent,
  Calculator,
  UserCog,
  Activity,
  ListTodo,
} from "lucide-react";
import { ROUTES } from "../../data/data";

/** Helper classes */
const linkBase =
  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm w-full " +
  "hover:bg-neutral-200 dark:hover:bg-neutral-200 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/50";

const activeCls =
  "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60 font-medium " +
  "dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-500/30";

const iconCls = "h-4 w-4 opacity-70 group-hover:opacity-100";

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end // exact match so only one is active
      className={({ isActive }) => `${linkBase} ${isActive ? activeCls : ""}`}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`${iconCls} ${
              isActive ? "text-indigo-600 dark:text-indigo-300 opacity-100" : ""
            }`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function CollapsibleGroup({ icon: Icon, label, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={linkBase}
      >
        {Icon ? <Icon className={iconCls} /> : null}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          } opacity-70`}
        />
      </button>

      <div
        className={`ml-3 grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-1">
            {items.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const sections = [
    {
      label: "Overview",
      items: [
        { to: ROUTES.overview, icon: LayoutDashboard, label: "Overview" },
      ],
    },
    {
      label: "Catalog",
      collapsible: true,
      icon: Boxes,
      items: [
        { to: ROUTES.products, icon: Package, label: "Products" },
        { to: ROUTES.categories, icon: Layers, label: "Categories" },
        { to: ROUTES.brands, icon: Tags, label: "Brands" },
        { to: ROUTES.attributes, icon: Tags, label: "Attributes" },
      ],
    },
    {
      label: "Media",
      collapsible: true,
      icon: Images,
      items: [
        { to: ROUTES.productImages, icon: Images, label: "Product Images" },
        { to: ROUTES.colorImages, icon: Palette, label: "Color Images" },
      ],
    },
    {
      label: "Orders",
      collapsible: true,
      icon: ShoppingCart,
      items: [
        { to: ROUTES.orders, icon: ShoppingCart, label: "All Orders" },
        { to: ROUTES.shipments, icon: Truck, label: "Shipments" },
        { to: ROUTES.payments, icon: CreditCard, label: "Payments" },
      ],
    },
    {
      label: "Promotions",
      collapsible: true,
      icon: Percent,
      items: [{ to: ROUTES.coupons, icon: BadgePercent, label: "Coupons" }],
    },
    {
      label: "Customers",
      collapsible: true,
      icon: Users,
      items: [{ to: ROUTES.users, icon: Users, label: "Users" }],
    },
    {
      label: "Content",
      collapsible: true,
      icon: FileText,
      items: [
        { to: ROUTES.pages, icon: FileText, label: "Pages" },
        { to: ROUTES.banners, icon: Images, label: "Banners" },
      ],
    },
    {
      label: "Settings",
      collapsible: true,
      icon: Settings,
      items: [
        { to: ROUTES.settingsAudiences, icon: Users, label: "Audiences" },
        {
          to: ROUTES.settingsShippingTaxes,
          icon: Calculator,
          label: "Shipping/Taxes",
        },
        { to: ROUTES.settingsTeamRoles, icon: UserCog, label: "Teams & Roles" },
      ],
    },
    {
      label: "System",
      collapsible: true,
      icon: Server,
      items: [
        { to: ROUTES.systemActivity, icon: Activity, label: "Activity Logs" },
        { to: ROUTES.systemQueue, icon: ListTodo, label: "Queue" },
      ],
    },
  ];

  return (
    <aside className="hidden md:block w-60 shrink-0 border-r bg-neutral-50 dark:bg-neutral-900">
      <div className="h-[calc(100vh-56px)] overflow-y-auto p-3">
        {sections.map((section) =>
          section.collapsible ? (
            <CollapsibleGroup
              key={section.label}
              {...section}
              defaultOpen={false}
            />
          ) : (
            <div key={section.label} className="mb-3">
              <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-500">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
