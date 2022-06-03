# Contentstack Live Preview Utils SDK Configs

The init data has following structure

- [Contentstack Live Preview Utils SDK Configs](#contentstack-live-preview-utils-sdk-configs)
  - [`init(config: IConfig)`](#initconfig-iconfig)
    - [`enable`](#enable)
    - [`ssr`](#ssr)
    - [`runScriptsOnUpdate`](#runscriptsonupdate)
    - [`cleanCslpOnProduction`](#cleancslponproduction)
    - [`stackDetails`](#stackdetails)
      - [`apiKey`](#apikey)
      - [`environment`](#environment)
    - [`clientUrlParams`](#clienturlparams)
      - [NA config](#na-config)
      - [EU config](#eu-config)
    - [`stackSdk`](#stacksdk)
  - [`onEntryChange(callback: () => void)`](#onentrychangecallback---void)
  - [`getGatsbyDataFormat(sdkQuery: IStackSdk, prefix: string)`](#getgatsbydataformatsdkquery-istacksdk-prefix-string)

## `init(config: IConfig)`

The `init()` method initializes the Live Preview Utils SDK by setting up the necessary event listeners.
​
The `init()` method accepts a configuration object as a parameter. The following explains all the options available for the configuration.

### `enable`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

​
The `enable` property determines whether Live Preview communications have been enabled.

### `ssr`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

The ssr property determines the data update strategy for previewed content whenever you make changes to entry content. It depends on whether your app is [SSR](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#server-side-rendering-ssr-) or [CSR](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#client-side-rendering-csr-).

If you set the property to `true`, then your app or website is rendered from the server (SSR) and a request will be sent for a fresh HTML page every time you edit content.

When you set the property to `false`, then app is rendered from the client side (CSR). Your framework, e.g. React, will fetch the data and reload the existing page.

> **Note:** For CSR mode, [stackSDK](#stacksdk) is required. Hence, we automatically switch mode to CSR when you pass this object. This config is provided to override the default behavior.

### `runScriptsOnUpdate`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | false   | yes      |

When the live preview runs in SSR mode, we fetch a new page every time you update the entry and update the difference in the DOM. If your webpage relies on scripts as soon as it loads, changes from those scripts will not get reflected on the DOM.

If your page is missing some components, you could set `runScriptsOnUpdate` to `true`, and it will run the scripts every time you make update the entry.

> **Note:** This option will wait for all the scripts to load. This could potentially make your page slow if it depends on a lot of scripts. Use it only if your page is not rendering properly.

### `cleanCslpOnProduction`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

When `enable` is set to `false` and cleanCslpOnProduction is set to `true`, the `data-cslp` attributes are removed from the website.

### `stackDetails`

The `stackDetails` object contains stack related information that helps in redirecting to the corresponding entry whenever you use [edit tags](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#live-edit-tags-for-entries-optional-) within your website.

The `stackDetails` is an optional property if you do not use the live edit tags.

```ts
stackDetails {
    apiKey: string
    environment: string
}
```

#### `apiKey`

The API key of the concerned stack.

> **Note:** This is required if you are using the live edit tags.

| type   | optional                             |
| ------ | ------------------------------------ |
| string | yes (no, if you are using edit tags) |

#### `environment`

The environment name of the concerned stack.

| type   | optional |
| ------ | -------- |
| string | yes      |

### `clientUrlParams`

The `clientUrlParams` object contains the URL information of the stack that contains your webpage content. By default, the configuration details are set for the NA region.

#### NA config

```js
{
    protocol: "https",
    host: "app.contentstack.com",
    port: 443,
}
```

#### EU config

```js
{
    protocol: "https",
    host: "eu-app.contentstack.com",
    port: 443,
}
```

Pass the `clientUrlParams` object only if you need to modify the URL.
​

### `stackSdk`

The `stackSdk` object represents the `Stack` class that we get by executing the `Contentstack.Stack()` method. It is required for Client-Side Rendering (CSR) as we need to inject the Live Preview hash and content type UID into the Stack class.

## `onEntryChange(callback: () => void)`

For Client-Side Rendering (CSR), data collection and rendering is handled by the framework itself. Hence, for CSR, we recommend creating a function responsible for fetching and storing data, for example, `updatePage()`, and passing it to the `onEntryChange()` method. This will execute the updatePage() function whenever new data is available.
​

> **Note:** This function only works when [`ssr`](#ssr) is set to `false`, indicating that the application is of type [CSR](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#client-side-rendering-csr-).

For example, in a React application, you can create an updateData() function that will fetch data from Contentstack and store it in a React state. Inside the useEffect() function, you need to call the `onEntryChange()` method and pass the updateData() function to it.
​

```js
// utils.js
...
export const onEntryChange = ContentstackLivePreview.onEntryChange;
...

// Footer.js
import React from "react";
import ContentstackLivePreview from "live-preview-utils";

const Footer = () => {
    const [data, setData] = React.useState({});

    const updateData = () => {
        const fetchedData = SomeCallToGetData();
        setData(fetchedData);
    };

    React.useEffect(() => {
        ContentstackLivePreview.onEntryChange(updateData);
    }, []);

    return <div>{data.company_name}</div>;
};
```

## `getGatsbyDataFormat(sdkQuery: IStackSdk, prefix: string)`

Gatsby primarily fetches data using the [`gatsby-source-contentstack` plugin](https://www.gatsbyjs.com/plugins/gatsby-source-contentstack/). But, Live Preview currently works only on the [contentstack SDK](https://www.npmjs.com/package/contentstack).

Hence, for Gatsby, we fetch the data from the contentstack SDK and store it in React state. Post that, we re-render the page using the `onEntryChange()` method. As the data format is different for the gatsby-source-contentstack plugin, it returns a prefix and the entry name in Camel case. Hence, we use `getGatsbyDataFormat()` to change the entry's name.
​
The `getGatsbyDataFormat()` method accepts the Contentstack `Stack` object as the first parameter and the prefix as the second. The prefix is set inside the `gatsby-config.js` file. The default value set for the prefix is `contentstack`.

**For example:**

```js
const query = Stack.ContentType("your-contentype").Entry("entry-uid");

const formattedData = ContentstackLivePreview.getGatsbyDataFormat(
    query,
    "contentstack"
);

setData(formattedData);
```

**Difference in data:**

```js
// not passed to function
{
  "footer_lib": {
    "title": "footer",
    ...
  }
}

// passed to function with prefix as 'contentstack'
{
  "contentstackFooterLib": {
    "title": "footer",
    ...
  }
}
```
