# React apps translation

This documentation explains how to translate the React apps (Maps and Download
pages).

The translations consist of two files: a `.po` file where the translations can
be edited, and a `.mo` file that is the compiled version used by WordPress.

## Editing translations

English strings don't need to be translated, since they are the "default"
version of the strings.

For French, the translation file is `fw-child/languages/react-apps/fr_CA.po`.

In this file, you have, for each translation, the original English string in
the `msgid` field, and the translation in the `msgstr` field just below.

To add a new translation, create a new `msgid`/`msgstr` pair and fill them. If
the English value is good for French, you can leave the `msgstr` field empty.

Note that the same translation file is used for both the map and download apps.

## Compiling translations

To compile the translations, you need a development environment (see [this
documentation](developing-with-docker-compose.md)).

> The idea here is that you need simply `wp-cli`, but since it's already
> available in the development setup, it may be easier to use it.

Once the `portal` container is running, start a Bash terminal on it.

From this terminal, execute the following commands:

```shell
cd /var/www/html/assets/themes/fw-child
wp --allow-root i18n make-mo languages/react-apps/fr_CA.po
```

New translations should now be available in the site.

Commit the modified
`.po` and `.mo` files to the repository.
