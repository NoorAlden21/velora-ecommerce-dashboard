import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./services/store.js";
import AppRoutes from "./routes/routes";
import { ThemeProvider } from "./components/theme/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
