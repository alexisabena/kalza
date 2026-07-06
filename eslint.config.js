import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Palette names Tailwind ships that are NOT design-system tokens (see
// src/styles/theme-base.css + src/styles/themes/*.css for the token set:
// primary, secondary, muted, accent, destructive, success, background,
// foreground, card, popover, border, input, ring, sidebar*, chart-*).
// Using one of these instead of a token is what let ProductCard.jsx etc.
// drift from the design system silently — see DESIGN.md "What NOT to do".
// Genuine functional exceptions (QR code contrast, payment-brand logo
// plates) are marked with an eslint-disable-next-line comment inline.
const RAW_PALETTE = '(?:white|black|gray|grey|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'
const RAW_COLOR_CLASS = `/\\b(?:text|bg|border|ring|from|via|to|fill|stroke|divide|outline|decoration|caret|accent|shadow)-${RAW_PALETTE}(?:-\\d{2,3})?\\b/`

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${RAW_COLOR_CLASS}]`,
          message: 'Use a design-system token class (text-primary, bg-background, text-muted-foreground, etc. — see DESIGN.md) instead of a raw Tailwind palette color. If this is a genuine functional exception (QR contrast, brand logo plate), add an eslint-disable-next-line comment explaining why.',
        },
        {
          selector: `TemplateElement[value.raw=${RAW_COLOR_CLASS}]`,
          message: 'Use a design-system token class instead of a raw Tailwind palette color inside this template literal. If this is a genuine functional exception, add an eslint-disable-next-line comment explaining why.',
        },
      ],
    },
  },
])
