import Cookies from "js-cookie";

export const getToken = () => Cookies.get("token");

export const setToken = (token, remember = false) =>
  Cookies.set("token", token, {
    sameSite: "lax",
    ...(remember ? { expires: 30 } : {}),
  });

export const clearToken = () => Cookies.remove("token");
