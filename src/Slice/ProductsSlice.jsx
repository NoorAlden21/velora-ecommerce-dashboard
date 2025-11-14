import { apiSlice } from "@/services/apiSlice";

const mapApiProduct = (p) => ({
  id: p.id,
  image: null,
  title: p.name ?? "-",
  sku: p.sku ?? "-",
  category: p.primary_category?.name ?? "-",
  brand: p.brand?.name ?? "-",
  price: typeof p.price?.cents === "number" ? p.price.cents / 100 : 0,
  //compareAtPrice: null, // not provided in this endpoint
  status: p.active ? "active" : "draft",
  stock: 0, // not provided; adjust when your API includes it
  updatedAt: p.updated_at ?? p.published_at ?? null,
});

const ProductsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => {
        return {
          url: "products",
        };
      },
      transformResponse: (resp) => {
        const items = Array.isArray(resp?.data)
          ? resp.data.map(mapApiProduct)
          : [];
        const total = resp?.meta.total ?? items.length;
        return { items, total };
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "Product", id: p.id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductFormMeta: builder.query({
      query: () => ({ url: "admin/products/form-meta" }),
      transformResponse: (resp) => resp?.data ?? resp,
      providesTags: () => [
        { type: "Brand", id: "LIST" },
        { type: "Category", id: "LIST" },
        { type: "Product", id: "FORM_META" },
      ],
    }),

    createProduct: builder.mutation({
      query: (formData) => ({
        url: "admin/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductFormMetaQuery,
  useCreateProductMutation,
} = ProductsSlice;
