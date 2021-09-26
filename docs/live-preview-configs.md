# ContentstackLivePreviewSdk

The init data has following structure

- [ContentstackLivePreviewSdk](#contentstacklivepreviewsdk)
  - [`init()`](#init)
    - [`enable`](#enable)
    - [`shouldReload`](#shouldreload)
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
- [Alternate Method for passing config](#alternate-method-for-passing-config)

## `init()`

The init method is use to initialize the SDK by setting up necessary event listeners.

The init method takes one object as configuration and the options for the configurations are as follows.

### `enable`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | false    |

Determines whether live preview communications will be enabled.

### `shouldReload`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | true     |

Should reload determines strategy of data replacement. It is dependent on whether your app is [SSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#server-rendering) or [CSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#csr). `true` determines SSR and a request will be made to your page for fresh HTML page, while `false` determines CSR and it will rely on the framework to get and reload the data. eg. React.

### `cleanCslpOnProduction`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | true     |

When `enable` is set to `false` and `cleanCslpOnProduction` to `true`, it will remove the `data-cslp` attributes from the website.

### `stackDetails`

This object contains stack related information that helps in redirecting to the proper page when `edit_tags` are enabled.

```ts
stackDetails {
    apiKey: string
    environment: string
}
```

#### `apiKey`

The `api_key` of the stack.

| type   | optional |
| ------ | -------- |
| string | false    |

#### `environment`

The `environment` of the stack.

| type   | optional |
| ------ | -------- |
| string | true     |

### `clientUrlParams`

This object contains the url information of the stack your webpage. By default, the config are set for NA.

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

Pass the object if you need to modify the url.

### `stackSdk`

The Stack that we get by executing `Contentstack.Stack`. This is required for CSR as we need to inject the live preview hash and content_type_uid.

## `onEntryChange()`

For the CSRs, the data collection and rendering is handle by the framework themselves. Hence, for them, we recommend creating a function responsible for data fetching and storing and pass it to this method. This will execute the function whenever new data is available.

> **Note:** This function only works when `shouldReload` is set to `false`, indicating a CSR application.

eg in `react.js`

```js
// utils.js
...
export const onEntryChange = ContentstackLivePreview.onEntryChange();
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

Gatsby primarily gets its data from the [`contentstack-source-plugin`](https://www.gatsbyjs.com/plugins/gatsby-source-contentstack/). But, for live preview currently works only on [contentstack sdk](https://www.npmjs.com/package/contentstack). Hence, for Gatsby, we fetch the data from contentstack SDK and store it to react state and rerender the page using [`onEntryChange()`](#onentrychange) method. But, the data format is different for gatsby source plugin. It requires a prefix and the entry names are in camel case. Hence, we use `getGatsbyDataFormat()` to convert the entry's name.

It takes the Contentstack `Stack` object as first parameter and prefix as second. The prefix is set inside `gatsby-config.js` file. Default value is `contentstck`.

eg.

```js
const query = Stack.ContentType("your-contentype").Entry("entry-uid");

const formattedData = ContentstackLivePreview.getGatsbyDataFormat(
    query,
    "contentstack"
);

setData(formattedData);
```

difference in data

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

# Alternate Method for passing config

For the Client side rendering, we require `Contentstack.Stack` as default and it already has some configs related to livepreview. Hence, this SDK is build to leverage that configurations.

You can directly pass the SDK's config inside the `Contentstack.Stack.live_preview`

eg

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

Now, pass this Stack directly into the live preview SDK.

```js
ContentstackLivePreview.init(stack);
```

> NOTE: `ContentstackLivePreview.onEntryChange()` function is available for CSR to force rerender of the components.
