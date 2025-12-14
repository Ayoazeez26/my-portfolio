// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/quotes": ["error", "double", { avoidEscape: true }],
    "@typescript-eslint/semi": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
  },
});
