import { apiSlice } from "@/services/apiSlice";

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "login",
        method: "POST",
        body: { email, password },
        headers: { "Content-Type": "application/json" },
      }),
      transformResponse: (resp) => resp ?? {},
    }),
    me: builder.query({
      query: () => ({ url: "me" }),
    }),
  }),
});

export const { useLoginMutation, useMeQuery } = authSlice;
