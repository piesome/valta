const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
    entry: "./src/Client/index.tsx",

    output: {
        filename: "bundle.js",
        publicPath: "/dist/",
        path: __dirname + "/dist"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".sass"],
        plugins: [
            new TsConfigPathsPlugin()
        ]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader?sourceMap"
                }, {
                    loader: "css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]"
                }, {
                    loader: "sass-loader"
                }]
            }
        ]
    }
};
