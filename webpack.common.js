const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: [
        path.resolve(__dirname, "src", "index.ts"),
        path.resolve(__dirname, "src", "styles.css"),
    ],
    output: {
        globalObject: "this",
        library: "ContentstackLivePreview",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
        chunkFilename: "[name].js",
    },
    plugins: [new MiniCssExtractPlugin()],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
                include: [path.resolve(__dirname, "src")],
            },
        ],
    },
    resolve: {
        extensions: [".json", ".js", ".ts", ".css"],
    },
    devtool: "source-map",
};
