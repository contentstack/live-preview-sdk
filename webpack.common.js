const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: path.resolve(__dirname, "src", "index.ts"),
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
                test: /\.tsx$/,
                exclude: /node_modules/,
                include: [path.resolve(__dirname, "src")],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react", "@babel/preset-env", "@babel/preset-typescript"],
                        plugins: [
                            ["@babel/plugin-transform-runtime"],
                            [
                                "@babel/plugin-transform-react-jsx",
                                {
                                    runtime: "automatic",
                                    importSource: "preact"
                                },
                            ]
                        ],
                    },
                },
            },
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
        extensions: [".json", ".js", ".ts", ".css", ".jsx", ".tsx"],
        alias: {
            "react": "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat",     // Must be below test-utils
            "react/jsx-runtime": "preact/jsx-runtime"
        },
    },
    devtool: "source-map",
};