import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "../ui/sheet";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Separator } from "../ui/separator";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useForm,
  useFormContext,
  useWatch,
  FormProvider,
  Controller,
} from "react-hook-form";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { ROUTES } from "@/data/data";
import { NavLink } from "react-router-dom";

import { useGetProductsQuery } from "@/Slice/ProductsSlice";

const filterSchema = z.object({
  status: z.enum(["all", "active", "draft"]).default("all"),
  brand: z.string().default("all"),
  category: z.string().default("all"),
  priceMin: z.coerce.number().min(0).default(0),
  priceMax: z.coerce.number().min(0).default(5000),
  stockStatus: z.enum(["all", "in", "low", "out"]).default("all"),
});

const DEFAULT_FILTERS = {
  status: "all",
  brand: "all",
  category: "all",
  priceMin: 0,
  priceMax: 500,
  stockStatus: "all",
};

function formatEuro(n) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function applyFilters(products, q, f) {
  const qNorm = q.trim().toLowerCase();
  return products.filter((p) => {
    const matchQ =
      !qNorm ||
      p.title.toLowerCase().includes(qNorm) ||
      p.sku.toLowerCase().includes(qNorm);

    const matchStatus = f.status === "all" ? true : p.status === f.status;
    const matchBrand = f.brand === "all" ? true : p.brand === f.brand;
    const matchCategory =
      f.category === "all" ? true : p.category === f.category;
    const matchPrice =
      p.price >= (f.priceMin ?? 0) &&
      p.price <= (f.priceMax ?? Number.MAX_SAFE_INTEGER);

    let matchStock = true;
    if (f.stockStatus === "in") matchStock = p.stock > 0;
    if (f.stockStatus === "out") matchStock = p.stock === 0;
    if (f.stockStatus === "low") matchStock = p.stock > 0 && p.stock <= 50;

    return (
      matchQ &&
      matchStatus &&
      matchBrand &&
      matchCategory &&
      matchPrice &&
      matchStock
    );
  });
}

export default function Products() {
  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const products = data?.items ?? [];
  const total = data?.total ?? products.length;

  const [query, setQuery] = useState("");
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: DEFAULT_FILTERS,
    mode: "onChange",
  });

  const { control, reset } = form;

  //live filters
  const liveRaw = useWatch({ control });
  const liveParsed = useMemo(() => {
    const res = filterSchema.safeParse(liveRaw);
    return res.success ? res.data : DEFAULT_FILTERS;
  }, [liveRaw]);

  // const products = MOCK_PRODUCTS;
  const filtered = useMemo(
    () => applyFilters(products, query, liveParsed),
    [products, query, liveParsed]
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <div className="h-72 animate-pulse" />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
        <Card>
          <div className="p-4 text-sm text-red-600">
            Couldn’t load products.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your products
            </p>
          </div>
          <NavLink to={ROUTES.productNew}>
            <Button>+ Add Product</Button>
          </NavLink>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Input
                placeholder="Search products by title, SKU..."
                className="w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <FilterSheet
                control={control}
                brands={brands}
                categories={categories}
                onReset={() => reset(DEFAULT_FILTERS)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsTable products={filtered} />
            <div className="text-center text-sm text-muted-foreground mt-4">
              Showing {filtered.length} of {total} products
            </div>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}

function ProductsTable({ products }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Image</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            {/* <TableCell>
              <img
                src={p.image}
                alt={p.title}
                className="h-10 w-10 object-cover"
              />
            </TableCell> */}

            <TableCell>
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {p.title?.[0] ?? "–"}
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{p.title}</TableCell>
            <TableCell>{p.sku}</TableCell>
            <TableCell>{p.category}</TableCell>
            <TableCell>{p.brand}</TableCell>
            <TableCell className="text-right">
              <div className="flex flex-col items-end">
                <span>{formatEuro(p.price)}</span>
                {p.compareAtPrice ? (
                  <span className="text-xs line-through text-muted-foreground">
                    {formatEuro(p.compareAtPrice)}
                  </span>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={p.status === "active" ? "default" : "secondary"}>
                {p.status === "active" ? "Active" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <span
                className={
                  p.stock === 0
                    ? "text-red-600"
                    : p.stock <= 50
                    ? "text-amber-600"
                    : ""
                }
              >
                {p.stock}
              </span>
            </TableCell>
            <TableCell>{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FilterSheet({ control, brands, categories, onReset }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Filters</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Brand</div>
            <Controller
              control={control}
              name="brand"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Category</div>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Price Range</div>
              <div className="text-sm text-muted-foreground">
                €{Number(useWatch({ control, name: "priceMin" }) ?? 0)} - €
                {Number(useWatch({ control, name: "priceMax" }) ?? 0)}
              </div>
            </div>
            <PriceRangeSlider min={0} max={500} step={1} />
          </div>

          {/* Stock Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Stock Status</div>
            <Controller
              control={control}
              name="stockStatus"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in">In stock</SelectItem>
                    <SelectItem value="low">Low stock (≤ 50)</SelectItem>
                    <SelectItem value="out">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <Separator className="my-5" />

        <SheetFooter className="flex gap-2">
          <Button variant="outline" type="button" onClick={onReset}>
            Reset
          </Button>
          <SheetClose asChild>
            <Button type="button">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PriceRangeSlider({ min = 0, max = 500, step = 1 }) {
  const { control, setValue } = useFormContext(); // needs <FormProvider>
  const priceMin = Number(useWatch({ control, name: "priceMin" })) || min;
  const priceMax = Number(useWatch({ control, name: "priceMax" })) || max;

  return (
    <Slider
      value={[priceMin, priceMax]}
      min={min}
      max={max}
      step={step}
      onValueChange={([a, b]) => {
        const lo = Math.max(min, Math.min(a, b));
        const hi = Math.min(max, Math.max(a, b));
        setValue("priceMin", lo, { shouldDirty: true, shouldValidate: true });
        setValue("priceMax", hi, { shouldDirty: true, shouldValidate: true });
      }}
      className="mt-1"
    />
  );
}
