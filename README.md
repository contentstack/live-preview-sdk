# Contentstack Live Preveiew SDK

This SDK is responsible to establish a communication channel between the Contentstack SDK and your website, and transfer live changes to the site.

# Installation

You could install this package via npm using following command

```bash
npm install @contenstack/live-preview-sdk
```

or you can include it directly in the HTML.

```html
<script src="https://unpkg.com/@contentstack/live-preview-sdk@1.1.0/dist/index.js"></script>
```

# Usage

### Live preview

As this sdk is responsible only for the communication, we only need to initialize the SDK.

```javascript
import ContentstackLivePreview from "@contenstack/live-preview-sdk";

ContentstackLivePreview.init({
    enable: true,
    stackDetails: {
        apiKey: "your-stack-api-key",
    },
});
```

If you are adding directly into the HTML tag, then the class is directly available under the same name `ContentstackLivePreview`

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

### Live edit tags

Live edit tags are automatically idenfied when present in the `data-cslp` attrubute in the HTML tags. The styles for the live edit tags are available in `@contentstack/live-preview-sdk/dist/main.css`. Include them in your main `index.js` file.

```javascript
import "@contentstack/live-preview-sdk/dist/main.css";
```

# License

MIT License

Copyright © 2021 [Contentstack](https://www.contentstack.com/). All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
