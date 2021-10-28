# Contentstack Live Preview Utils SDK Configs

The init data has following structure

- [Contentstack Live Preview Utils SDK Configs](#contentstack-live-preview-utils-sdk-configs)
  - [`init()`](#init)
    - [`enable`](#enable)
    - [`ssr`](#ssr)
    - [`cleanCslpOnProduction`](#cleancslponproduction)
    - [`stackDetails`](#stackdetails)
      - [`apiKey`](#apikey)
      - [`environment`](#environment)
    - [`clientUrlParams`](#clienturlparams)
      - [NA config](#na-config)
      - [EU config](#eu-config)
    - [`stackSdk`](#stacksdk)
  - [`onEntryChange()`](#onentrychange)
  - [`getGatsbyDataFormat()`](#getgatsbydataformat)
- [Alternate Method​ for Passing Configuration Details](#alternate-method-for-passing-configuration-details)

## `init()`

The `init()` method initializes the Live Preview Utils SDK by setting up the necessary event listeners.
​
The `init()` method accepts one object as configuration. The following explains all the options available for configuration.

### `enable`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | false   | no       |

​
The `enable` property determines whether Live Preview communications have been enabled.

### `ssr`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

The ssr property determines the data update strategy for previewed content whenever you make changes to entry content. It depends on whether your app is [SSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#server-rendering) or [CSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#csr).

If you set the property to `true`, then your app or website is rendered from the server (SSR) and a request will be sent for a fresh HTML page every time you edit content.

When you set the property to `false`, then app is rendered from the client side (CSR). Your framework, e.g. React, will fetch the data and reload the existing page.

> **Note:** For most cases, we would automatically determine the type. This value is given as a manual overdrive.

### `cleanCslpOnProduction`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

When `enable` is set to `false` and cleanCslpOnProduction is set to `true`, the `data-cslp` attributes are removed from the website.

### `stackDetails`

The `stackDetails` object contains stack related information that helps in redirecting to the corresponding entry whenever you use edit tags to update content in real-time.

```ts
stackDetails {
    apiKey: string
    environment: string
}
```

#### `apiKey`

The API key of the concerned stack.

| type   | optional |
| ------ | -------- |
| string | false    |

#### `environment`

The environment name of the concerned stack.

| type   | optional |
| ------ | -------- |
| string | true     |

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

## `onEntryChange()`

For Client-Side Rendering (CSR), data collection and rendering is handled by the framework itself. Hence, for CSR, we recommend creating a function responsible for fetching and storing data, for example, `updatePage()`, and passing it to the `onEntryChange()` method. This will execute the updatePage() function whenever new data is available.
​

> **Note:** This function only works when `ssr` is set to `false`, indicating that the application is of type CSR.
> ​
> For example, in a React application, you can create an updateData() function that will fetch data from Contentstack and store it in a React state. Inside the useEffect() function, you need to call the `onEntryChange()` method and pass the updateData() function to it.
> ​

```js
// utils.js
...
export const onEntryChange = ContentstackLivePreview.onEntryChange;
...

// Footer.js
import React from "react";
import { onEntryChange } from "./utils.js";

const Footer = () => {
    const [data, setData] = React.useState({});

    const updateData = () => {
        const fetchedData = SomeCallToGetData();
        setData(fetchedData);
    };

    React.useEffect(() => {
        onEntryChange(updateData);
    }, []);

    return <div>{data.company_name}</div>;
};
```

## `getGatsbyDataFormat()`

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

# Alternate Method​ for Passing Configuration Details

For Client Side Rendering, we require the Stack class by default, and it already has some configs related to Live Preview. Hence, the Live Preview Utils SDK has been built to leverage those configurations.

You can directly pass the SDK config inside the `Contentstack.Stack.live_preview` object.

**For example**

```js
const stack = Contentstack.Stack({
  ...
  live_preview: {
    enable: true,
    cleanCslpOnProduction: true,
    ...
  }
})
```

Now, directly pass the stack object defined within the config while initializing the Live Preview Utils SDK:

```js
ContentstackLivePreview.init(stack);
```
