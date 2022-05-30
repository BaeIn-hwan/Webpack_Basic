/*
    * mode
        - 개발용/배포용인지 구분하는 명령어(development/production)

    * entry
        - 웹 자원을 변환하기 위한 최초 진입점
        - entry는 1개가 될 수도 있지만 여러 개가 될 수도 있음

    * output
        - entry에서 받은 웹 자원을 결과물로 출력
        - output 파일 이름 옵션
            1. 파일 이름에 entry 속성 포함 ex) filename: [name].js
            2. 파일 이름에 module ID ex) filename: [id].main.js
            3. 파일 이름에 고유의 hash 포함 ex) filename: [name].[hash].main.js
            4. 파일 이름에 각 모듈 내용을 기준으로 생생된 hash 포함 ex) filename: [chunkhash].main.js

        - __dirname과 __filename의 차이
            1. __filename은 현재 실행 중인 파일 경로
            2. __dirname은 현재 실행 중인 폴더 경로
    
    * loader
        - 웹 어플리케이션을 해석할 때, js가 아닌 html, css, image, font를 변환할 수 있도록 도와주는 곳
            test : 로더를 적용할 파일 유형 (일반적으로 정규 표현식 사용)
            use : 해당 파일에 적용할 로더의 이름
            exclude : 제외할 폴더나 파일

    * plugin
        - 추가적인 기능을 제공하면서, 결과물을 출력물로 바꾸는 것
    
    * devtool
        - source map이란 배포용으로 빌드한 파일과 원본 파일을 연결시켜주는 기능. 압축시 오류가 나면 오류를 보여줌
*/

const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    devtool: "source-map",
    devServer: {
        port: 8080,
        contentBase: path.resolve(__dirname, "../"),    // webpack-dev-server 실행 시, 초기 path
        watchContentBase: true,                         // 소스 파일 변경 시, 감지하여 새로고침
        watchOptions: {
            poll: true,
        },
    },
    entry: {
        "src/js/main": ["./js/app.js", "./scss/app.scss"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "../")
    },
    module: {
        rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: "babel-loader",
				options: {
                    cacheDirectory: true,              // 캐시 사용 여부
					presets: ["@babel/preset-env"],
                    plugins: [
                        [
                            "@babel/plugin-transform-runtime",
                            {
                                "absoluteRuntime": false,
                                "corejs": 3,
                                "helpers": true,
                                "regenerator": true,
                                "useESModules": false
                            }
                        ]
                    ]
                }
			}
		}, {
            /*
                style-loader : css-loader에서 반환해준 값을 DOM의 <style> 태그로 삽입 해주는 로더
                css-loader : CSS 파일들을 읽어서 js에서 사용 가능한 string으로 반환
                postcss-loader : vender prefix 자동생성 해주는 로더
                sass-loader : Sass 또는 SCSS 파일을 로드하고 CSS로 컴파일 해주는 로더
            */
            test: /\.s[ac]ss$/i,
			exclude: /node_modules/,
            use: [
                process.env.NODE_ENV === "production" ? MiniCssExtractPlugin.loader : "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                        // importLoaders: 1,
                    }
                }, {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                [
                                    "postcss-preset-env", {
                                        // browsers옵션은 지원하는 브라우저에 따라 필요한 폴리필을 결정
                                        browsers: 'last 3 versions'
                                    }
                                ]
                            ]
                        }
                    }
                }, {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true,
                        sassOptions: {
                            // CSS 컴파일 할 때, 압축/미압축 여부 판별(compressed : 압축 / expanded : 미압축)
                            outputStyle: process.env.NODE_ENV === "production" && process.argv[process.argv.length - 1] === "production" ? "compressed" : "expanded",
                        },
                    }
                }
            ]
        }, {
            test: /\.(jpe?g|png|gif)$/i,
            loader: "file-loader",
            options: {
                name: "[path][name].[ext]",
                publicPath: process.env.NODE_ENV === "production" ? "./" : "../../",    // SCSS 내 파일의 INPUT 경로 설정
                outputPath: '/',                                                        // SCSS 내 사용된 OUTPUT 경로 설정
            },
        }]
    },
    plugins: [
        /*
            MiniCssExtractPlugin : CSS를 별도의 파일로 추출하는 플러그인
            - sass-loader에서 outputStyle 설정이 없으면 mode에 따라 압축/미압축 여부를 판별(production : 압축 / development : 미압축)
        */
        new MiniCssExtractPlugin({
            filename: "src/css/main.css",
            chunkFilename: "src/css/main[id].css"
        })
    ],
}