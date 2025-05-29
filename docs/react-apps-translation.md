# React apps translation

This documentation describes the process for updating translation files (`.pot`, `.po`, and `.mo`) to localize the map and download applications into French. The process uses `wp-cli i18n` commands to manage the translation workflow.

The translation update process requires a local development environment and must be executed from the project root directory. Begin by navigating to the `apps` directory and removing existing `node_modules` and `package-lock.json` files to ensure cross-environment compatibility. Execute the following commands:

```
cd apps
rm -rf node_modules/ package-lock.json
nvm use && npm install && npm run build:unminified
```

These commands compile the React applications for both map and download functionality into unminified JavaScript files, which are output to the `fw-child/apps/dist` directory. This compilation step is essential because `wp-cli i18n` tools cannot parse TypeScript files directly. The unminified build creates JavaScript files that `wp-cli i18n` can process for string extraction.

Once the JavaScript compilation is complete, proceed with the translation file generation process. Generate the portable object template file using the following command:

```
cd ../ # Navigate back to the project root directory
php -d memory_limit=1024M ./wp-cli.phar i18n make-pot ./fw-child/apps/dist/. ./fw-child/languages/react-apps/cdc.pot --domain=''
```

This command extracts all translatable strings from the compiled JavaScript files and creates a `.pot` template file. The memory limit parameter ensures sufficient resources for processing the large JS files.

Update the French Canadian portable object file by running:

```
./wp-cli.phar i18n update-po ./fw-child/languages/react-apps/cdc.pot ./fw-child/languages/react-apps/fr_CA.po
```

This command merges new strings from the template file into the existing French translation file while preserving previously translated content (if any).

Translate the strings contained in the `fr_CA.po` file. This can be accomplished manually by editing the file directly or by using specialized translation software such as POEditor. Ensure all `msgstr` entries contain appropriate French translations for their corresponding `msgid` values.

After completing the translation work, generate the machine object file using:

```
./wp-cli.phar i18n make-mo ./fw-child/languages/react-apps/fr_CA.po ./fw-child/languages/react-apps/fr_CA.mo
```

The `.mo` file is the compiled binary format that WordPress uses at runtime to display translated strings. Once this file is generated, the French version of the map and download applications will display the translated content.

**Note**: When committing changes to version control, include only the three translation files: `cdc.pot`, `fr_CA.po`, and `fr_CA.mo`. All other modified files generated during this process, including `package-lock.json` and any temporary build artifacts, should be reverted to their original state before committing. These files are not part of the translation deliverable and should not be included in the repository.