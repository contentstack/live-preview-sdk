## ContentstackLivePreviewSdk

The init data has following structure

- [ContentstackLivePreviewSdk](#contentstacklivepreviewsdk)
  - [enable](#enable)
  - [shouldReload](#shouldreload)
  - [cleanCslpOnProduction](#cleancslponproduction)
  - [stackDetails](#stackdetails)
    - [apiKey](#apikey)
    - [environment](#environment)
  - [clientUrlParams](#clienturlparams)
    - [NA config](#na-config)
    - [EU config](#eu-config)
  - [stackSdk](#stacksdk)
- [Alternate Method](#alternate-method)

### enable

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | false    |

Determines whether live preview communications will be enabled.

### shouldReload

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | true     |

Should reload determines strategy of data replacement. It is dependent on whether your app is [SSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#server-rendering) or [CSR](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#csr). `true` determines SSR and a request will be made to your page for fresh HTML page, while `false` determines CSR and it will rely on the framework to get and reload the data. eg. React.

### cleanCslpOnProduction

| type    | default | optional |
| ------- | ------- | -------- |
| boolean | true    | true     |

When `enable` is set to `false` and `cleanCslpOnProduction` to `true`, it will remove the `data-cslp` attributes from the website.

### stackDetails

This object contains stack related information that helps in redirecting to the proper page when `edit_tags` are enabled.

```ts
stackDetails {
    apiKey: string
    environment: string
}
```

#### apiKey

The `api_key` of the stack.

| type   | optional |
| ------ | -------- |
| string | false    |

#### environment

The `environment` of the stack.

| type   | optional |
| ------ | -------- |
| string | true     |

### clientUrlParams

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

### stackSdk

The Stack that we get by executing `Contentstack.Stack`. This is required for CSR as we need to inject the live preview hash and content_type_uid.

## Alternate Method

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
