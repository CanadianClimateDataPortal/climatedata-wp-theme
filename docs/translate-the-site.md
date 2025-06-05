# Translate the site

This documentation explains how to translate various strings in the site.

> **Note about generating translations**
>
> For the various tasks below, you will need to use the development environment
> (see [this documentation](developing-with-docker-compose.md)).
>
> Actually, you simply need an installation of `wp-cli`, but since it's already
> available in the development setup, it may be easier to use it. The
> documentation below assumes that you are using the development environment.


## PHP strings translation

For strings in PHP files, the translations are done using the `__` and `_e` PHP
functions, generally using the `cdc` domain.

Example:

```php
echo __( 'Hello world', 'cdc' );
```

Those strings are then compiled into `.po` and `.mo` files, which are used
by WordPress.

### Updating the .pot file

When you add or modify a string in the PHP files, you need to update the
`.pot` file that contains all the strings to be translated.

> Note that this step is not required if you didn't add a new, or removed a
> new string to translate (skip to "Compiling translations").

1. Start the development environment.
2. Once the `portal` container is running, start a Bash terminal on it.
3. From this terminal, execute the following commands:
   ```shell
   cd /var/www/html/assets/themes/fw-child
   wp --allow-root i18n make-pot --skip-js . languages/cdc/cdc.pot --domain=cdc
   ```

### Generate the translation files (.mo and .po)

From an updated `.pot` file, you can then update the translation files for the
French language.

1. Start the development environment.
2. Once the `portal` container is running, start a Bash terminal on it.
3. From this terminal, execute the following commands:
   ```shell
   cd /var/www/html/assets/themes/fw-child
   wp --allow-root i18n update-po languages/cdc/cdc.pot
   ```

Then do your translations in the `languages/cdc/fr_CA.po` file.

### Compiling translations

Once the translations are done, you then compile the `.po` file into a `.mo`
file.

1. Start the development environment.
2. Once the `portal` container is running, start a Bash terminal on it.
3. From this terminal, execute the following commands:
   ```shell
   cd /var/www/html/assets/themes/fw-child
   wp --allow-root i18n make-mo languages/cdc/fr_CA.po
   ```

New translations should now be available in the site.

Commit all the modified files to the repository (`.pot`, `.po`, `.mo`).

## React apps translation

This documentation explains how to translate the React apps (Maps and Download
pages).

The translations consist of two files: a `.po` file where the translations can
be edited, and a `.mo` file that is the compiled version used by WordPress.

### Editing translations

English strings don't need to be translated, since they are the "default"
version of the strings.

For French, the translation file is `fw-child/languages/react-apps/fr_CA.po`.

In this file, you have, for each translation, the original English string in
the `msgid` field, and the translation in the `msgstr` field just below.

To add a new translation, create a new `msgid`/`msgstr` pair and fill them. If
the English value is good for French, you can leave the `msgstr` field empty.

Note that the same translation file is used for both the map and download apps.

### Compiling translations

1. Start the development environment.
2. Once the `portal` container is running, start a Bash terminal on it.
3. From this terminal, execute the following commands:
   ```shell
   cd /var/www/html/assets/themes/fw-child
   wp --allow-root i18n make-mo languages/react-apps/fr_CA.po
   ```

New translations should now be available in the site.

Commit the modified
`.po` and `.mo` files to the repository.
