import path from 'path';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    entry: path.resolve(__dirname, "src", "index.ts"),
    output: {
        globalObject: "this",
        library: "ContentstackLivePreview",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
        chunkFilename: "[name].js",
    },
    optimization: {
        sideEffects: true,
        usedExports: false,
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.tsx$/,
                exclude: /node_modules/,
                include: [path.resolve(__dirname, "src")],
                use: "babel-loader",
            },
            {
                test: /\.ts$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")],
            }
        ],
    },
    resolve: {
        extensions: [".json", ".js", ".ts", ".css", ".jsx", ".tsx"],
        alias: {
            react: "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat", // Must be below test-utils
            "react/jsx-runtime": "preact/jsx-runtime",
        },
    },
    devtool: "source-map",
};
