import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
    mode: "development",
    watch: true,
    devtool: "inline-source-map",
    devServer: {
        static: "./dist",
    },
});
