import { useMemo, useState } from "react";

import {
  useForm,
  FormProvider,
  Controller,
  useFieldArray,
  useFormContext,
} from "react-hook-form";

import { ROUTES } from "@/data/data";

import { useGetProductFormMetaQuery } from "@/Slice/ProductsSlice";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

import { Eye, Save, ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";

// ---------- helpers ----------
const toIntOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ---------- schemas ----------
const basicsSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z.string().min(1, "slug is required"),
  status: z.enum(["draft", "active"]).default("draft"),
  brandId: z.string().optional(),
  primaryCategoryId: z.string().min(1, "primary category is required"),
  price: z.coerce.number().min(0, "price is at least 0"),
  description: z.string().optional(),
  audiences: z.array(z.enum(["B2C", "B2B", "VIP", "Wholesale"])).default([]),
  seoTitle: z.string().min(1, "seo title is required"),
  seoDescription: z.string().min(1, "seo description is required"),
});

const imagesSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().url("invalid url").optional(),
        file: z.any().optional(),
        alt: z.string().optional(),
      })
    )
    .default([]),
});

const attributesSchema = z.object({
  attributes: z
    .array(
      z.object({
        key: z.string().min(1, "key is required"),
        value: z.string().min(1, "value is required"),
      })
    )
    .default([]),
});

const optionSchema = z.object({
  option_id: z.coerce.number(),
});

const variantPairSchema = z.object({
  option_id: z.coerce.number(),
  option_value_id: z.coerce.number(),
});

const variantSchema = z.object({
  option_values: z.array(variantPairSchema).min(1),
  sku: z.string().optional(),
  price_cents: z.coerce.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  stock: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
});

const colorImageSchema = z.object({
  option_value_id: z.coerce.number(),
  url: z.string().url().optional(),
  file: z.any().optional(),
  position: z.coerce.number().min(0).optional(),
});

const productSchema = basicsSchema
  .merge(imagesSchema)
  .merge(attributesSchema)
  .merge(
    z.object({
      options: z.array(optionSchema).default([]),
      variants: z.array(variantSchema).default([]),
      color_images: z.array(colorImageSchema).default([]),
    })
  );

const DEFAULTS = {
  title: "",
  slug: "",
  status: "draft",
  brandId: "",
  primaryCategoryId: "",
  price: 0,
  description: "",
  audiences: [],
  images: [],
  attributes: [],
  options: [],
  variants: [],
  color_images: [],
};

export default function NewProduct() {
  const {
    data: meta,
    isLoading: loading,
    isError: error,
  } = useGetProductFormMetaQuery();

  const methods = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULTS,
    mode: "onSubmit",
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const [tab, setTab] = useState("basics");

  // computed helpers from meta
  const brands = meta?.brands ?? [];
  const categoriesFlat = meta?.categories?.flat ?? [];
  const options = meta?.options ?? [];
  const colorOptionId = meta?.defaults?.color_option_id ?? null;
  const colorOption = useMemo(
    () => options.find((o) => o.id === colorOptionId),
    [options, colorOptionId]
  );

  // prevent duplicate option selection
  const selectedOptionIds = watch("options")?.map((o) => o.option_id) ?? [];
  const availableOptions = useMemo(() => {
    return options.filter((o) => !selectedOptionIds.includes(o.id));
  }, [options, selectedOptionIds]);

  // SUBMIT
  const onSubmit = async (values) => {
    const payload = {
      name: values.title,
      slug: values.slug || null,
      status: values.status,
      price_cents: Math.round(Number(values.price) * 100),
      currency: "EUR",
      brand_id: toIntOrNull(values.brandId),
      primary_category_id: toIntOrNull(values.primaryCategoryId),
      description: values.description || null,
      audience_ids: [], // map from values.audiences if you wire that up
      category_ids: [], // extra secondary categories if you add UI
      meta_title: values.seoTitle,
      meta_description: values.seoDescription,

      options: values.options,
      variants: values.variants.map((v) => ({
        ...v,
        price_cents:
          v.price_cents === undefined || v.price_cents === null
            ? undefined
            : Number(v.price_cents),
        currency:
          v.currency && v.currency.trim().length
            ? v.currency.trim().toUpperCase()
            : undefined,
      })),
      color_images: values.color_images.map((ci) => ({
        option_value_id: ci.option_value_id,
        url: ci.url,
        position:
          ci.position === undefined || ci.position === null
            ? 0
            : Number(ci.position),
      })),
    };

    const form = new FormData();
    values.color_images.forEach((ci, idx) => {
      if (ci.file) {
        form.append(`color_images[${idx}][file]`, ci.file);
      }
    });
    form.append("data", JSON.stringify(payload));

    // const res = await fetch("/api/admin/products", { method: "POST", body: form });
    // const json = await res.json();
    // console.log("API RESULT", res.status, json);

    console.log("SUBMIT => ready FormData", payload);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-6 bg-muted rounded w-40" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load form meta.</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center justify-between gap-x-5">
            <NavLink to={ROUTES.products}>
              <Button variant="ghost">
                <ArrowLeft />
              </Button>
            </NavLink>
            <div>
              <h1 className="text-2xl font-semibold">New Product</h1>
              <p className="text-sm text-muted-foreground">
                Create a new product
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Status:</Label>
              <StatusLabel control={control} />
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Switch
                    aria-label="Product status"
                    checked={field.value === "active"}
                    onCheckedChange={(c) =>
                      field.onChange(c ? "active" : "draft")
                    }
                  />
                )}
              />
            </div>

            <Button type="button" variant="outline">
              <Eye />
              Preview
            </Button>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              <Save className="mr-1" />
              Save
            </Button>
            <Button
              type="submit"
              className="bg-indigo-700"
              disabled={isSubmitting}
            >
              <Save className="mr-1" />
              Save & Close
            </Button>
          </div>
        </div>

        <Separator />

        <Tabs
          value={tab}
          onValueChange={(next) => setTab(next)}
          className="mt-4"
        >
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="optionsAndVariants">
              Options & Variants
            </TabsTrigger>
            <TabsTrigger value="imagesByColor">Images by Color</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          {/* BASICS */}
          <TabsContent value="basics">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex-col justify-between items-center">
                    <p className="text-xl font-semibold">Basic Information</p>
                    <h1 className="text-sm text-muted-foreground">
                      Essential product details and organization
                    </h1>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    className="bg-neutral-100"
                    placeholder="Enter product title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    className="bg-neutral-100"
                    placeholder="product-url-slug"
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <p className="text-red-600 text-sm">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Controller
                    control={control}
                    name="brandId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-neutral-100">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary category *</Label>
                  <Controller
                    control={control}
                    name="primaryCategoryId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-neutral-100">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesFlat.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {"— ".repeat(c.depth || 0) + c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.primaryCategoryId && (
                    <p className="text-red-600 text-sm">
                      {errors.primaryCategoryId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    className="bg-neutral-100"
                    type="number"
                    step="0.01"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="col-span-full space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    className="bg-neutral-100"
                    rows={4}
                    {...register("description")}
                    placeholder="Enter product description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex-col justify-between items-center space-y-2">
                  <h1 className="text-2xl font-semibold">SEO & Metadata</h1>
                  <p>Optimize for search engines</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex-col justify-between items-center space-y-2">
                  <div className="space-y-2">
                    <Label>Seo title *</Label>
                    <Input
                      className="bg-neutral-100"
                      {...register("seoTitle")}
                      placeholder="Product title for search engines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seo description *</Label>
                    <Input
                      className="bg-neutral-100"
                      {...register("seoDescription")}
                      placeholder="Meta description for meta results"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <ImagesSection />
          </TabsContent>

          {/* Options & Variants */}
          <TabsContent value="optionsAndVariants">
            <OptionsAndVariantsSection
              allOptions={options}
              availableOptions={availableOptions}
            />
          </TabsContent>

          {/* Images by Color */}
          <TabsContent value="imagesByColor">
            <ImagesByColorSection colorOption={colorOption} />
          </TabsContent>

          {/* Attributes */}
          <TabsContent value="attributes">
            <AttributesSection />
          </TabsContent>
        </Tabs>
      </form>
    </FormProvider>
  );
}

function StatusLabel({ control }) {
  return (
    <Controller
      control={control}
      name="status"
      render={({ field }) => {
        const isActive = field.value === "active";
        return (
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {isActive ? "Active" : "Draft"}
          </span>
        );
      }}
    />
  );
}

function ImagesSection() {
  const { watch, setValue } = useFormContext();
  const images = watch("images");

  const onPick = (files) => {
    if (!files) return;
    const next = [...images, ...Array.from(files).map((f) => ({ file: f }))];
    setValue("images", next, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex-col justify-between items-center">
            <h1 className="text-2xl font-semibold">Product Images</h1>
            <p className="text-sm text-muted-foreground">
              Upload and manage product images
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex h-44 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors cursor-pointer">
          <input
            hidden
            multiple
            type="file"
            onChange={(e) => onPick(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
            <Upload className="h-6 w-6 opacity-70" />
            <span className="font-medium">Upload image</span>
            <span className="text-xs">Drag &amp; drop or click</span>
          </div>
        </label>

        <div className="grid gird-cols-2 gap-4 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="rounded-md border p-2">
              <img
                src={img.url || (img.file ? URL.createObjectURL(img.file) : "")}
                alt="preview"
                className="aspect-square w-full rounded object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() =>
                  setValue(
                    "images",
                    images.filter((_, idx) => idx !== i),
                    { shouldDirty: true }
                  )
                }
              >
                remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ====================== Options & Variants ====================== */

function OptionsAndVariantsSection({ allOptions, availableOptions }) {
  const { control, register, watch } = useFormContext();

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
  } = useFieldArray({ control, name: "options" });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionFields.map((f, idx) => {
            // compute current option for label
            const currentId = watch(`options.${idx}.option_id`);
            const current = allOptions.find((o) => o.id === currentId);
            return (
              <div key={f.id} className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-2">
                  <Label>Option</Label>
                  <Controller
                    name={`options.${idx}.option_id`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="bg-neutral-100">
                          <SelectValue placeholder="Select option (e.g. Color)" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Allow re-select all; to strictly prevent duplicates, filter here */}
                          {allOptions.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => removeOption(idx)}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const firstAvailable =
                availableOptions[0] || allOptions[0] || null;
              if (!firstAvailable) return;
              appendOption({ option_id: firstAvailable.id });
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Option
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {variantFields.map((vf, vIdx) => (
            <VariantRow
              key={vf.id}
              vIdx={vIdx}
              removeVariant={removeVariant}
              allOptions={allOptions}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendVariant({
                option_values: [
                  {
                    option_id: allOptions[0]?.id,
                    option_value_id: allOptions[0]?.values?.[0]?.id,
                  },
                ],
                sku: "",
                stock: 0,
                is_active: true,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function VariantRow({ vIdx, removeVariant, allOptions }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${vIdx}.option_values`,
  });

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-2 space-y-1">
          <Label>SKU</Label>
          <Input placeholder="optional" {...register(`variants.${vIdx}.sku`)} />
        </div>
        <div className="space-y-1">
          <Label>Override Price (cents)</Label>
          <Input
            type="number"
            placeholder="leave blank to inherit"
            {...register(`variants.${vIdx}.price_cents`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1">
          <Label>Currency</Label>
          <Input placeholder="EUR" {...register(`variants.${vIdx}.currency`)} />
        </div>
        <div className="space-y-1">
          <Label>Stock</Label>
          <Input
            type="number"
            min={0}
            {...register(`variants.${vIdx}.stock`, { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-end gap-2">
            <div>
              <Label className="text-xs">Option</Label>
              <Controller
                name={`variants.${vIdx}.option_values.${idx}.option_id`}
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="bg-neutral-100 w-44">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {allOptions.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="text-xs">Value</Label>
              <Controller
                name={`variants.${vIdx}.option_values.${idx}.option_value_id`}
                control={control}
                render={({ field, formState }) => {
                  const selectedOptionId = formState.defaultValues; // not helpful – we need current value:
                  // better: read current option id from form state via a tiny proxy component:
                  return (
                    <OptionValueSelect
                      control={control}
                      vIdx={vIdx}
                      pairIdx={idx}
                      field={field}
                      allOptions={allOptions}
                    />
                  );
                }}
              />
            </div>
            <Button variant="ghost" type="button" onClick={() => remove(idx)}>
              <Trash2 className="mr-1 h-4 w-4" /> remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              option_id: allOptions[0]?.id,
              option_value_id: allOptions[0]?.values?.[0]?.id,
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add Pair
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => removeVariant(vIdx)}
          className="ml-auto"
        >
          <Trash2 className="mr-1 h-4 w-4" /> Remove Variant
        </Button>
      </div>
    </div>
  );
}

function OptionValueSelect({ control, vIdx, pairIdx, field, allOptions }) {
  const { watch } = useFormContext();
  const selectedOptionId = watch(
    `variants.${vIdx}.option_values.${pairIdx}.option_id`
  );
  const option = allOptions.find((o) => o.id === selectedOptionId);
  const values = option?.values ?? [];

  return (
    <Select
      value={String(field.value ?? "")}
      onValueChange={(v) => field.onChange(Number(v))}
    >
      <SelectTrigger className="bg-neutral-100 w-44">
        <SelectValue
          placeholder={option ? "Select value" : "Pick option first"}
        />
      </SelectTrigger>
      <SelectContent>
        {values.map((v) => (
          <SelectItem key={v.id} value={String(v.id)}>
            {v.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ====================== Images by Color ====================== */

function ImagesByColorSection({ colorOption }) {
  const { control, register, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "color_images",
  });

  const handlePick = (index, fileList) => {
    if (!fileList || !fileList[0]) return;
    const file = fileList[0];
    setValue(`color_images.${index}.file`, file, { shouldDirty: true });
  };

  const values = colorOption?.values ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Images by {colorOption?.name || "Color"} (Option Value)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((f, idx) => {
          const file = watch(`color_images.${idx}.file`);
          const url = watch(`color_images.${idx}.url`);
          return (
            <div key={f.id} className="grid md:grid-cols-5 gap-3 items-end">
              <div>
                <Label>{colorOption?.name || "Color"} Value</Label>
                <Controller
                  name={`color_images.${idx}.option_value_id`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="bg-neutral-100">
                        <SelectValue
                          placeholder={`Select ${colorOption?.name || "color"}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <Label>URL (optional if file is provided)</Label>
                <Input
                  placeholder="https://cdn.example.com/image.jpg"
                  {...register(`color_images.${idx}.url`)}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={0}
                  {...register(`color_images.${idx}.position`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    hidden
                    type="file"
                    onChange={(e) => handlePick(idx, e.target.files)}
                  />
                  <span className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
                    <Upload className="h-4 w-4 mr-2" /> Choose file
                  </span>
                </label>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => remove(idx)}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
              {(file || url) && (
                <div className="md:col-span-5">
                  <div className="rounded border p-2 text-xs text-muted-foreground">
                    {file && <div>picked file: {file.name}</div>}
                    {url && <div>url: {url}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              option_value_id: values[0]?.id ?? undefined,
              position: 0,
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          Add {colorOption?.name || "Color"} Image
        </Button>
      </CardContent>
    </Card>
  );
}

/* ====================== Attributes (free-form) ====================== */

function AttributesSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attributes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Key</Label>
              <Input
                placeholder="e.g. material"
                {...register(`attributes.${idx}.key`)}
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                placeholder="e.g. cotton"
                {...register(`attributes.${idx}.value`)}
              />
            </div>
            <Button variant="ghost" type="button" onClick={() => remove(idx)}>
              <Trash2 className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ key: "", value: "" })}
        >
          <Plus className="mr-1 h-4 w-4" /> Add Attribute
        </Button>
      </CardContent>
    </Card>
  );
}
