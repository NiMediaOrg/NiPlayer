import { defineConfig,configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "./packages/**/__test__/*.spec.ts"
    ],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});