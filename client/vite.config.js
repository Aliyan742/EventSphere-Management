import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            },
            {
              name: "charts",
              test: /[\\/]node_modules[\\/](recharts|d3-.*|victory-vendor)[\\/]/,
            },
            {
              name: "realtime",
              test: /[\\/]node_modules[\\/](socket\.io-client|engine\.io-client|axios)[\\/]/,
            },
            {
              name: "icons",
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            },
          ],
        },
      },
    },
  },
});
