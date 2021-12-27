const path = require("path");
const obfuscator = require("webpack-obfuscator");

module.exports = {
    entry: "./src/index.ts",
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new obfuscator({
            rotateStringArray: true,
        }),
    ],
};
