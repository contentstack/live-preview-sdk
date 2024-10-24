module.exports = {
    presets: [
        "@babel/preset-react",
        ["@babel/preset-env", { targets: "defaults" }],
        "@babel/preset-typescript",
    ],
    plugins: [
        ["@babel/plugin-transform-runtime"],
        [
            "@babel/plugin-transform-react-jsx",
            {
                runtime: "automatic",
                importSource: "preact",
            },
        ],
    ],
};
