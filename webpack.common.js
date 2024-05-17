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
                test: /\.ts$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")],
            }
        ],
    },
    resolve: {
        extensions: [".json", ".js", ".ts", ".css"],
    },
    devtool: "source-map",
};
