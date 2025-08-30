import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path"; // <-- namespace import avoids extra TS flags
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
    },
});
