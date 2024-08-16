<img src="https://img.shields.io/badge/NiPlayer-1.4.3-red"/><br/>

## 规划

使用 rspack + solid-js + solid-store + pnpm + monorepo 进行重构；

播放器整体结构划分为 player层，store层，plugin层；

- store： 存储播放器相关的所有state，提供底层api供外部使用（清晰度切换，音量切换等）。
- plugin: 编写播放器的UI和功能逻辑，通过订阅store中的state，使用 solid-js 提供的jsx视图解决方案将 UI 和 state 进行绑定，实现state驱动ui。
- player: 播放器的示例对象和第三方使用入口，作为链接plugin和store的桥梁例如：store借助player可以触发和订阅事件，plugin借助player可以订阅store内的状态。

## 配置相关

### TS装饰器配置

- tsconfig.json 配置 experimentalDecorators 为 true
    
    ```tsx
    {
        "compilerOptions": {
            "target": "ESNext",
            "module": "ES6",
            "experimentalDecorators": true
        }
    }
    ```
    
- rspack.config.cjs babel-loader plugins 处配置 ```**["@babel/plugin-proposal-decorators", { "legacy": true}] ]**```
    
    ```tsx
    // @ts-check
    const { defineConfig } = require('@rspack/cli');
    const path = require('path');
    
    const config = defineConfig({
      module: {
        rules: [
          {
            test: /\.(j|t)sx?$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['solid', '@babel/preset-typescript'],
                  plugins: [ 'solid-styled-jsx/babel', ["@babel/plugin-proposal-decorators", { "legacy": true}] ]
                },
              },
            ],
          }
        ]
      }
    });
    ```
    

### solid-js tsx配置

tsx默认其编译是使用react的React.creatElement创建Vdom（包括jsx类型提示也是找的react/jsx-runtime）; 因此若想使用 solid-js + tsx 组合，需要分别在 tsconfig.json 和 rspack.config.cjs 进行特殊配置：

- tsconfig.json
    
    ```tsx
    {
        "compilerOptions": {
            "jsx": "preserve",
            "jsxImportSource": "solid-js",
            "module": "ESNext",
            "moduleResolution": "Bundler"
        } 
    }
    ```
    
- rspack.config.cjs 配置 babel-loader 如下:
    - presets: solid @babel/preset-typescript

整体编译流程：

1. @babel/preset-typescript + tsconfig.json 将 tsx → jsx， 并且保留其中的jsx语法（因为 tsconfig.json 的 jsx 配置的 preserve）；
2. solid 将 jsx 语法编译为 js 代码

## 相关文档： https://niplayer.js.org/
