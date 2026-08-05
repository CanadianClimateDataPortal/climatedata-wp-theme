# `fw-child/`

The child theme, kept for legacy reasons and scheduled for removal.

New theme and PHP code belongs in [`framework/`](../framework/), the parent theme, which persists.
That overrides the usual WordPress instinct to put site-specific customization in the child theme.
Work that lands here is work that has to be moved again later.

## The exception — React app translations

[`fw-child/languages/react-apps/`](./languages/react-apps/) is the one part of this theme still in active use, and it stays here.

`cdc_extract_locale_data( 'react-apps', get_locale() )` reads it, and that function resolves its path through `get_stylesheet_directory()`, which is the child theme by definition.
[`fw-child/apps/app-map.php`](./apps/app-map.php) and [`fw-child/apps/app-download.php`](./apps/app-download.php) both call it and hand the result to the React apps, which consume it through WordPress i18n.
So the location is a consequence of how WordPress resolves the stylesheet directory, rather than a choice anyone is free to revisit while the child theme exists.

Adding or changing a translatable string in [`apps/`](../apps/) therefore means editing [`fw-child/languages/react-apps/fr_CA.po`](./languages/react-apps/fr_CA.po) and recompiling:

```
./dev.sh i18n-compile-react-apps
```

That runs `wp i18n make-mo languages/react-apps/fr_CA.po` inside the container and rewrites [`fr_CA.mo`](./languages/react-apps/fr_CA.mo) beside it.
Both files are committed — the `.po` is the source a translator edits, and the `.mo` is the compiled form the site loads at runtime.
Changing one without the other leaves the site serving the previous translation.

The site is bilingual, English and French.
English is the source language and carries no catalogue of its own; only `fr_CA` exists here.
