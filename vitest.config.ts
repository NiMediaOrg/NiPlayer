import { defineConfig,configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude:[...configDefaults.exclude, "packages/template/*"],
    include:[...configDefaults.include,"./test/*/**"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});