# Summit Marketing Website

This project contains the JavaScript for the Summit website. It powers all the dynamic geolocation and API-driven content modules. The front-end reactivity is built using [AlpineJS](https://alpinejs.dev/), with the help of [AlpineJS-Webflow connector lib](https://github.com/loomchild/webflow-alpinejs).

## Reference

- [Included tools](#included-tools)
- [Requirements](#requirements)
- [Getting started](#getting-started)
  - [Installing](#installing)
  - [Building](#building)
    - [Serving files on development mode](#serving-files-on-development-mode)
    - [Building multiple files](#building-multiple-files)
    - [Setting up a path alias](#setting-up-a-path-alias)
    - [Code setup](#code-setup)
    - [Code walkthrough video series](#code-walkthrough-video-series)
- [Contributing guide](#contributing-guide)
- [Pre-defined scripts](#pre-defined-scripts)
- [Continuous Deployment](#continuous-deployment)

## Included tools

This template contains some preconfigured development tools:

- [Typescript](https://www.typescriptlang.org/): A superset of Javascript that adds an additional layer of Typings, bringing more security and efficiency to the written code.
- [Prettier](https://prettier.io/): Code formatting that assures consistency across all Finsweet's projects.
- [ESLint](https://eslint.org/): Code linting that enforces industries' best practices. It uses [our own custom configuration](https://github.com/finsweet/eslint-config) to maintain consistency across all Finsweet's projects.
- [esbuild](https://esbuild.github.io/): Javascript bundler that compiles, bundles and minifies the original Typescript files.

## Requirements

This template requires the use of [pnpm](https://pnpm.js.org/en/). You can [install pnpm](https://pnpm.io/installation) with:

```bash
npm i -g pnpm
```

To enable automatic deployments to npm, please read the [Continuous Deployment](#continuous-deployment) section.

## Getting started

### Installing

After creating the new repository, open it in your terminal and install the packages by running:

```bash
pnpm install
```

It is also recommended that you install the following extensions in your VSCode editor:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Building

To build the files, you have two defined scripts:

- `pnpm dev`: Builds and creates a local server that serves all files (check [Serving files on development mode](#serving-files-on-development-mode) for more info).
- `pnpm build`: Builds to the production directory (`dist`).

### Serving files - development v/s production mode

**The repo is set in a way where the website will automatically detect when you have `localhost` running, and serve the files accordingly.**

This way, even while you're developing, the public can continue accessing the production version whereas the dev mode with the code changes are served only for you in your browser.

To start development mode, run `pnpm dev`. Two things happen:

- esbuild is set to `watch` mode. Every time that you save your files, the project will be rebuilt.
- A local server is created under `http://localhost:3000` that serves all your project files.

You can add them in your Webflow pages like:

```javascript
	window.JS_SCRIPTS.add('modules/geolocation.js');
```

*If a script is global, add it in the project settings, else in the page settings.*

Live Reloading is enabled by default, meaning that every time you save a change in your files, the website you're working on will reload automatically. You can disable it in `/bin/build.js`.

### Building multiple files

In `bin/build.js`, update the `ENTRY_POINTS` array with any files you'd like to build and include on the site:

```javascript
const ENTRY_POINTS = [
  'src/home/index.ts',
  'src/contact/whatever.ts',
  'src/hooyah.ts',
  'src/home/other.ts',
];
```

This will tell `esbuild` to build all those files and output them in the `dist` folder for production and in `http://localhost:3000` for development. And this same files will be pushed for [deployment](#continuous-deployment) too.

### Setting up a path alias

Path aliases are very helpful to avoid code like:

```typescript
import example from '../../../../utils/example';
```

Instead, we can create path aliases that map to a specific folder, so the code becomes cleaner like:

```typescript
import example from '$utils/example';
```

You can set up path aliases using the `paths` setting in `tsconfig.json`. This template has an already predefined path as an example:

```json
{
  "paths": {
    "$utils/*": ["src/utils/*"]
  }
}
```

To avoid any surprises, take some time to familiarize yourself with the [tsconfig](/tsconfig.json) enabled flags.

### Code Setup

The source is mainly bifurcated into the following folders, grouped by its type of tasks:
- `/src/api` - Consists of all the helper classes and typings for the API calls to different Summit endpoints.
- `/src/global-types` - Global typings for different AlpineJS functionality type support
- `/src/modules` - Consists of all the AlpineJS reactive modules and stores (both global and local) that are used on the website. This is the main code that drives all the reactivity on the site.
- `/src/utils` - Utility functions used for different purposes throughout the project. Usually contains just one standalone function per file.

### Code walkthrough video series

The same video walkthrough series as [Applerouth](https://github.com/appletutors/applerouth-webflow) applies to this project

## Contributing guide

Development should ideally happen in the `dev` branch, and tested on localhost. Once the code is ready to be deployed, it should be merged into `main`.

## Pre-defined scripts

This template contains a set of predefined scripts in the `package.json` file:

- `pnpm dev`: Builds and creates a local server that serves all files (check [Serving files on development mode](#serving-files-on-development-mode) for more info).
- `pnpm build`: Builds to the production directory (`dist`).
- `pnpm lint`: Scans the codebase with ESLint and Prettier to see if there are any errors.
- `pnpm lint:fix`: Fixes all auto-fixable issues in ESLint.
- `pnpm check`: Checks for TypeScript errors in the codebase.
- `pnpm format`: Formats all the files in the codebase using Prettier. You probably won't need this script if you have automatic [formatting on save](https://www.digitalocean.com/community/tutorials/code-formatting-with-prettier-in-visual-studio-code#automatically-format-on-save) active in your editor.
- `pnpm release`: This command is defined for [Changesets](https://github.com/changesets/changesets). You don't have to interact with it.
- `pnpm run update`: Scans the dependencies of the project and provides an interactive UI to select the ones that you want to update.

From this, you'd usually only need/use ther `dev` and `build` command.

## Continuous Deployment

This repo uses Github Actions to compile TS into JS and deploy the files to AWS S3 host, served via Cloudfront CDN. The repo has secrets variables set that configure different AWS keys and paths.

Flow triggers whenever code is pushed into the `main` branch.

The [`release.yml`](./.github/workflows/release.yml) file contains more details about the action workflow.