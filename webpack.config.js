const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
		mode: isProduction ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
			static: {
				directory: path.resolve(__dirname, 'dist'),
				watch: true,
			},
			hot: true,
			client: {
				overlay: false,
			},
		},
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images/'
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {}
            },
            'svgo-loader'
          ]
        },
				{
          test: /\.(png|jpe?g)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images/',
              },
            },
            // Добавляем loader для создания webp изображений
            {
              loader: 'imagemin-webp-webpack-loader',
              options: {
                quality: 75, // качество изображения
              },
            },
          ],
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction,
        hash: isProduction
      }),
      new MiniCssExtractPlugin({
        filename: 'styles.css'
      }),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
						from: 'src/images', to: 'images',
						noErrorOnMissing: true,
					}
        ]
      }),
      new SVGSpritemapPlugin('src/icons/*.svg', {
        output: {
          filename: 'icons/sprite.svg',
          svg4everybody: true
        },
        sprite: {
          prefix: false
        }
      }),
      new ImageminPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        disable: !isProduction, // Отключаем оптимизацию в режиме разработки
        pngquant: {
          quality: '75'
        },
        gifsicle: {
          optimizationLevel: 3
        },
        svgo: {
          plugins: [
            {
              removeViewBox: false
            }
          ]
        },
        plugins: [
          {
            use: 'imagemin-webp',
            options: {
              quality: 75
            }
          }
        ]
      }),
			new FriendlyErrorsWebpackPlugin(),
			new ImageminWebpWebpackPlugin({
        config: [
          {
            test: /\.(png|jpe?g)$/i,
            options: {
              quality: 75,
            },
          },
        ],
        overrideExtension: true,
        detailedLogs: false,
        silent: false,
      }),
    ]
  };
};