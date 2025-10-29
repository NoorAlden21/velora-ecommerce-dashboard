import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api/",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      const token = Cookies.get("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Product",
    "Variant",
    "Category",
    "Brand",
    "Order",
    "Coupon",
    "Customer",
    "Page",
    "Banner",
  ],
  endpoints: () => ({}),
});
