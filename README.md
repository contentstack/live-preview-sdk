# @contentstack/live-preview-utils

[![npm](https://img.shields.io/npm/v/@contentstack/live-preview-utils.svg)](https://www.npmjs.com/package/@contentstack/live-preview-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The **Live Preview Utils** package runs on your website and establishes a communication channel between the page and Contentstack. This enables live content updates, edit controls, and Visual Editor UI within the preview surface.

This SDK is not a replacement for Contentstack delivery SDKs. Instead, it acts as a client-side bridge for preview and Visual Editor functionality.

## Where this SDK runs

The SDK works across multiple Contentstack preview and editing experiences:

- [**Live Preview**](https://www.contentstack.com/docs/content-managers/author-content/about-live-preview): Preview entries while your site loads inside the preview panel.
- [**Timeline**](https://www.contentstack.com/docs/content-managers/timeline/about-timeline): Preview how your site appears across future dates and scheduled updates using the same Live Preview setup.
- [**Visual Editor**](https://www.contentstack.com/docs/content-managers/visual-editor/about-visual-editor): Enable WYSIWYG editing with your site inside an iframe. Use [`mode: "builder"`](docs/live-preview-configs.md#mode) so “Start Editing” targets Visual Editor; the SDK still works when the same site is opened in Live Preview.
- [**Studio**](https://www.contentstack.com/docs/studio/about-studio): Use alongside Studio to structure pages from reusable components, bind CMS data, and preview changes in real time. It is designed to work with [Live Preview and Visual Editor](https://www.contentstack.com/docs/studio/live-preview-and-visual-editing-with-studio) on your connected site.

## Requirements

- **Browser:** Initialize only on the client (`window` must exist). Avoid calling `init` during server-side rendering.
- **SSR vs CSR:** Defaults assume SSR-friendly behavior. For **client-side rendering**, pass [`stackSdk`](docs/live-preview-configs.md#stacksdk) and set [`ssr: false`](docs/live-preview-configs.md#ssr) as described in the config reference.

## Installation

```bash
npm install @contentstack/live-preview-utils
```

### Load from a CDN (advanced)

Pin the version to match your app (update `4.4.1` when you upgrade):

```html
<script type="module" crossorigin="anonymous">
  import ContentstackLivePreview from "https://esm.sh/@contentstack/live-preview-utils@4.4.1";

  ContentstackLivePreview.init({
    stackDetails: {
      apiKey: "your-stack-api-key",
    },
  });
</script>
```

> [!TIP]
> If you initialize the SDK using this snippet, do not initialize it again in your app bundle on the same page.

## Quick start

Initialize the SDK to enable communication between your site and Contentstack:

```javascript
import ContentstackLivePreview from "@contentstack/live-preview-utils";

ContentstackLivePreview.init({
  stackDetails: {
    apiKey: "your-stack-api-key",
  },
});
```

See the [`init` configuration properties](docs/live-preview-configs.md#initconfig-iconfig) in **[docs/live-preview-configs.md](docs/live-preview-configs.md)** for every option you can pass to `init`.

## Configuration

You can configure the SDK using the following options:

- [`enable`](docs/live-preview-configs.md#enable)
- [`ssr`](docs/live-preview-configs.md#ssr)
- [`mode`](docs/live-preview-configs.md#mode) (`preview` vs `builder`)
- [`editButton`](docs/live-preview-configs.md#editbutton)
- [`editInVisualBuilderButton`](docs/live-preview-configs.md#editinvisualbuilderbutton) (Start Editing outside Visual Editor)
- [`cleanCslpOnProduction`](docs/live-preview-configs.md#cleancslponproduction)
- [`stackDetails`](docs/live-preview-configs.md#stackdetails) ([`apiKey`](docs/live-preview-configs.md#apikey), [`environment`](docs/live-preview-configs.md#environment))
- [`clientUrlParams`](docs/live-preview-configs.md#clienturlparams) — [NA](docs/live-preview-configs.md#na-config) / [EU](docs/live-preview-configs.md#eu-config)
- [`stackSdk`](docs/live-preview-configs.md#stacksdk)

Full tables and examples: **[docs/live-preview-configs.md](docs/live-preview-configs.md)**.

### Methods and properties

- [`onLiveEdit`](docs/live-preview-configs.md#onliveeditcallback---void): Trigger actions on live edits
- [`onEntryChange`](docs/live-preview-configs.md#onentrychangecallback---void): Listen for entry updates
- [`hash`](docs/live-preview-configs.md#hash): Access preview state identifier
- [`config`](docs/live-preview-configs.md#config): Includes runtime context (for example Live Preview / Timeline preview, Visual Editor, or independent)

The [configs table of contents](docs/live-preview-configs.md#contentstack-live-preview-utils-sdk-configs) also lists `setConfigFromParams` and `getGatsbyDataFormat` for deeper workflows.

## Advanced: stripping the SDK at build time

Set `PURGE_PREVIEW_SDK` or `REACT_APP_PURGE_PREVIEW_SDK` to `"true"` during build to exclude preview code from production bundles.

**Note:** This reduces bundle size by replacing the SDK with a lightweight stub in production.

## Resources

- **Source:** [github.com/contentstack/live-preview-sdk](https://github.com/contentstack/live-preview-sdk)
- **Typed API (local):** `npm run docs`

## Documentation and learning

### Developers

- [Set up Live Preview for your website](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website)
- [How Live Preview works](https://www.contentstack.com/docs/developers/set-up-live-preview/how-live-preview-works)
- [Preview API](https://www.contentstack.com/docs/developers/set-up-timeline/preview-api)
- [Set up Timeline for your website](https://www.contentstack.com/docs/developers/set-up-timeline/set-up-timeline-for-your-website)

### Content managers

- [About Live Preview](https://www.contentstack.com/docs/content-managers/author-content/about-live-preview)
- [Preview content across a Timeline](https://www.contentstack.com/docs/content-managers/timeline/preview-content-across-a-timeline)
- [About Visual Editor](https://www.contentstack.com/docs/content-managers/visual-editor/about-visual-editor)

### Studio

- [Studio](https://www.contentstack.com/docs/studio)
- [Get started with Studio](https://www.contentstack.com/docs/studio/get-started-with-studio)

### Academy

- [Implementing Live Preview (course)](https://www.contentstack.com/academy/courses/implementing-live-preview)
- [Contentstack Live Preview under the hood](https://www.contentstack.com/academy/content/contentstack-live-preview-under-the-hood)
- [Understanding Timeline](https://www.contentstack.com/academy/content/understanding-timeline)
- [Understanding Visual Editor](https://www.contentstack.com/academy/content/understanding-visual-builder)
