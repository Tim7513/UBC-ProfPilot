const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
            clean: true,
            publicPath: '/'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                    type: 'asset/resource'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                title: 'Prof Pilot - UBC Professor & Course Explorer'
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx']
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            port: 3001,
            proxy: {
                '/api': 'http://localhost:3000',
                '/professor': 'http://localhost:3000',
                '/course': 'http://localhost:3000',
                '/health': 'http://localhost:3000',
                '/status': 'http://localhost:3000'
            },
            historyApiFallback: true
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        }
    };
}; 