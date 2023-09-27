# postcss-hover-media-query

Postcss plugin that optimize the hover style in css.

## Install

```bash
(npm|yarn|pnpm|bun) i -D postcss @cookie_gg/postcss-hover-media-query
```

## Usage

```js:postcss.config.js
module.exports = {
  ...
  plugins: [
    // other plugins...
    ['@cookie_gg/postcss-hover-media-query', {
        forceHoverable: false,
      }
    ]
  ]
  ...
}
```

```css:style.css
/* before */
main h1:hover, main h2 {
  color: blue;
}

/* after */
@media (hover: hover) {
  main h1:hover {
    color: blue;
  }
}
main h2 {
  color: blue;
}
```

## Options

**forceHoverable: `Boolean`**

> default: 'false'

If you set this option to true, you can use `:force-hover` pseudo class which supports unknown elements.

```css:style.css
/* before */
main h1:force-hover {
  color: blue;
}

/* after */
@media (hover: hover) {
  main h1:where(:any-link, :enabled, summary):hover {
    color: blue;
  }
}
```
