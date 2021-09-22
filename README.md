# Contentstack Live Preveiew SDK

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).

Contentstack provides the Live Preview SDK to establish a communication channel between the various Contentstack SDKs and your website, transmitting live changes to the preview pane.

# Installation

To install the package via npm using following command:

```bash
npm install @contenstack/live-preview-sdk
```

Alternatively, if you want to include the package directly in your website HTML code, use the following command:

```html
<script src="https://unpkg.com/@contentstack/live-preview-sdk@1.1.0/dist/index.js"></script>
```

# Initializing the SDK

### Live preview

Since the live preview SDK is responsible for communication, you need to only initialize it.
Use the following command to initialize the SDK:

```javascript
import ContentstackLivePreview from "@contenstack/live-preview-sdk";

ContentstackLivePreview.init({
    enable: true,
    stackDetails: {
        apiKey: "your-stack-api-key",
    },
});
```

Alternatively, if you want to initialize the SDK directly in the HTML tag, use the class attribute ContentstackLivePreview as follows:

```html
<script>
    ContentstackLivePreview.init({
        enable: true,
        stackDetails: {
            apiKey: "your-stack-api-key",
        },
    });
</script>
```

# Live editing

Live Preview allows you to edit your content by providing edit tags. Live edit tags are identified as the data-cslp attribute within the HTML tags. The styles for the live edit tags are available in the `@contentstack/live-preview-sdk/dist/main.css` file.

To use the live edit tags within your stack, you need to Include them in your main index.js file as follows:

```javascript
import "@contentstack/live-preview-sdk/dist/main.css";
```

# License

MIT License

Copyright © 2021 [Contentstack](https://www.contentstack.com/). All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
