import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    // build: {
    //   rollupOptions: {
    //     output: process.env.npm_lifecycle_event === "build.preview" ? {
    //       chunkFileNames:
    //       '[name]-[hash].mjs',
    //     }: undefined,
    //   },
    // },
    plugins: [qwikCity(), qwikVite(), tsconfigPaths()],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
