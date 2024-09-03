import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import * as webpack from "webpack";

export default merge(common, {
    mode: "production",
    plugins: [
        new webpack.default.DefinePlugin({
            "process.env.PURGE_PREVIEW_SDK": true,
        }),
    ],
});
