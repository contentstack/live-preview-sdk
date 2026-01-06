# Contentstack Live Preview Utils SDK

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest.

Contentstack provides the Live Preview Utils SDK to establish a communication channel between the various Contentstack SDKs and your website, transmitting live changes to the preview pane. [Read More](https://www.contentstack.com/docs/content-managers/live-preview/).

# Installation

To install the package via npm, use the following command:

```bash
npm install @contentstack/live-preview-utils
```

Alternatively, if you want to include the package directly in your website HTML code, use the following command:

```html
<script type='module' crossorigin="anonymous">
     import ContentstackLivePreview from 'https://esm.sh/@contentstack/live-preview-utils@4.2.0';

     ContentstackLivePreview.init({
        stackDetails: {
            apiKey: "your-stack-api-key",
        },
    });
</script>
```
> [!NOTE]
> This step involves incorporating the package into your HTML code and initializing it, eliminating the need for re-initialization in the subsequent step.


# Initializing the SDK

### Live Preview Utils

Since the Live Preview Utils SDK is responsible for communication, you need to only initialize it.
Use the following command to initialize the SDK:

```javascript
import ContentstackLivePreview from "@contentstack/live-preview-utils";

ContentstackLivePreview.init({
    stackDetails: {
        apiKey: "your-stack-api-key",
    },
});
```


# License

MIT License

Copyright © 2021-2026 [Contentstack](https://www.contentstack.com/). All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
