// postcss.config.cjs - robust loader for different Tailwind/PostCSS plugin layouts
let tailwindPlugin;
try {
  // new layout (Tailwind moved PostCSS plugin to @tailwindcss/postcss)
  tailwindPlugin = require('@tailwindcss/postcss');
} catch (e) {
  // fallback to the classic tailwindcss plugin (works for Tailwind 3.4.x)
  tailwindPlugin = require('tailwindcss');
}

module.exports = {
  plugins: [
    tailwindPlugin,
    require('autoprefixer')
  ]
};
