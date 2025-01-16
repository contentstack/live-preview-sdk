# Contentstack Live Preview Utils SDK Configs

The init data has following structure

-   [Contentstack Live Preview Utils SDK Configs](#contentstack-live-preview-utils-sdk-configs)
    -   [`init(config: IConfig)`](#initconfig-iconfig)
        -   [`enable`](#enable)
        -   [`ssr`](#ssr)
        -   [`mode`](#mode)
        -   [`editButton`](#editbutton)
        -   [`cleanCslpOnProduction`](#cleancslponproduction)
        -   [`stackDetails`](#stackdetails)
            -   [`apiKey`](#apikey)
            -   [`environment`](#environment)
        -   [`clientUrlParams`](#clienturlparams)
            -   [NA config](#na-config)
            -   [EU config](#eu-config)
        -   [`stackSdk`](#stacksdk)
    -   [`onLiveEdit(callback: () => void)`](#onliveeditcallback---void)
    -   [`onEntryChange(callback: () => void)`](#onentrychangecallback---void)
    -   [hash](#hash)
    -   [setConfigFromParams(config: ConstructorParameters\[0\])](#setconfigfromparamsconfig-constructorparameters0)
    -   [`getGatsbyDataFormat(sdkQuery: IStackSdk, prefix: string)`](#getgatsbydataformatsdkquery-istacksdk-prefix-string)

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

### `mode`

| type    |  default  | optional |
| ------- | --------- | -------- |
| string  | `preview` | Yes      |

The `mode` property specifies whether the site is editable in the Live Preview or Visual Builder environment.

If set to `preview`, clicking the hovered edit button navigates to the Contentstack Live Preview panel.

If set to `builder`, clicking the Start Editing button navigates to the Contentstack Visual Builder. Note that the site will still function in the Live Preview panel even when set to 'builder'.

### `editButton`
The editButton object allows you to manage the "Edit" button both within and outside the Live Preview portal. It offers the following features:
- Enable/disable the "Edit" button
- Include/exclude the "Edit" button from inside/outside the Live Preview panel
- Adjust the position of the "Edit" button using eight over predefined positions

The editButton object contains four keys:

1. #### `enable`
    | type    | default | optional |
    | ------- | ------- | -------- |
    | boolean | true    | no       |

    This key lets you specify whether you want to display the “Edit” button or not. It is of type “Boolean” with value true/false.

2. #### `exclude`
    | type    | default | optional |
    | ------- | ------- | -------- |
    | array   | [ ]     | yes      |

    This key provides you with the option to exclude the editButton from either inside or outside the Live Preview portal for certain conditions. It is of type “Array” with any one of the following string values:
    
    - ##### `insideLivePreviewPortal`
    
        Used when you want to remove the “Edit” button from within the Live Preview portal.
    - ##### `outsideLivePreviewPortal`
    
        Used when you want to remove the “Edit” button from outside the Live Preview portal.
    
    > **Note:** Although you have excluded the "Edit" button for Live Preview, you can add the `cslp-buttons` query parameter in your website URL to display the "Edit" button outside of your Live Preview-enabled website.


3. #### `includeByQueryParameter`
    | type    | default | optional |
    | ------- | ------- | -------- |
    | boolean | true    | yes      |

    This key is used to override the `cslp-buttons` query parameter. You can set this to true/false to enable/disable the "Edit" button option, respectively.    

4. #### `position`
    | type    | default | optional |
    | ------- | ------- | -------- |
    | string  | top     | yes      |

    The user can place the "Edit" button in eight predefined positions within or over the Live Preview portal using these values: left, right, top-left (or top), top-right, top-center, bottom-left (or bottom), bottom-right, and bottom-center.
    
    > **Note:** The default position of the "Edit" button is set to "top". In a collaborative work environment, you can also manually position the “Edit” button on your website by applying the `data-cslp-button-position` attribute to the HTML tag with one of the position values.

**For example:**    
```ts
ContentstackLivePreview.init({
    ...
    editButton: {
        enable: true,
        exclude: ["outsideLivePreviewPortal"],
        includeByQueryParameter: false,
        position:'top-right',
    }
});
```

### `cleanCslpOnProduction`

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | yes      |

When `enable` is set to `false` and cleanCslpOnProduction is set to `true`, the `data-cslp` attributes are removed from the website.

### `stackDetails`

The `stackDetails` object contains stack related information that helps in redirecting to the corresponding entry whenever you use [edit tags](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#live-edit-tags-for-entries-optional-) within your website.

If you do not use live edit tags, then you don't need to use the `stackDetails` property.

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

## `onLiveEdit(callback: () => void)`

The onLiveEdit method modifies or alters the content inside the Live Preview panel as soon as a change is made in the entry. This method runs a single API request to retrieve draft content from the entry and display the changes in the Live Preview panel.

> **Note:** The onLiveEdit method will not fetch the published content of the entry and is only applicable in the Client-Side Rendering ([CSR](https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-for-your-website/#client-side-rendering-csr-)) mode.

For Client-Side Rendering (CSR), as the framework handles data collection and rendering by itself, we recommend creating a function, say `updateData`, to fetch data and pass it to the `onLiveEdit` method. The `onLiveEdit` method will execute the `updateData` function whenever new data is available. 

For example, in a React application, you can create an `updateData` function that will fetch data from Contentstack and store it in a React state. Inside the `useEffect` function, you need to call the `onLiveEdit` method and pass the `updateData` function to it.
​

```js
// utils.js
...
export const onLiveEdit = ContentstackLivePreview.onLiveEdit;
...

// Footer.js
import React from "react";
import ContentstackLivePreview from "./utils.js";

const Footer = () => {
    const [data, setData] = React.useState({});

    const updateData = () => {
        const fetchedData = SomeCallToGetData();
        setData(fetchedData);
    };

      React.useEffect(() => {
        ContentstackLivePreview.onLiveEdit(updateData);
    }, []);

    return <div>{data.company_name}</div>;
};
```

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

> **Note:** To make the `onEntryChange` method work similarly to the [`onLiveEdit`](#onliveeditcallback---void) method, you can utilize the optional parameter `skipInitialRender:true`. This will enable the function to only call the Contentstack API once.

**For example:**

```js
onEntryChange(fetchData, { skipInitialRender: true });
```

## hash

The `hash` property returns the live preview hash of the entry. It returns an empty string if the page is not opened in live preivew pane.

> **Note:** In the SSR mode, the hash may not be populated automatically and may require you to pass it using the `setConfigFromParams()` method.

**For example:**

```js
console.log(ContentstackLivePreview.hash); // "hash"
```

## config

The `config` property returns the following properties and their values:

1. [`ssr`](#ssr)
2. [`enable`](#enable)
3. [`cleanCslpOnProduction`](#cleancslponproduction)
4. `stackDetails`
The stackDetails object provides information relevant to the live preview context, including:

```ts
stackDetails {
    apiKey: string;          // API key of the stack
    environment: string;     // Environment in which the preview is running
    contentTypeUid: string;  // UID of the content type
    entryUid: string;        // UID of the specific entry
}
```
5. [`clientUrlParams`](#clienturlparams)
6. `windowType`: The windowType property determines the context of the parent window. It can have one of the following values:
    - `preview`: The site is loaded as an iframe within a Live Preview or Timeline preview environment.
    - `builder`: The site is loaded as an iframe within the Visual Builder environment.
    - `independent`: The site is loaded directly outside the Contentstack platform.
7. [`hash`](#hash)
8. [`editButton`](#editbutton)
9. [`mode`](#mode)