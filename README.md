# glm-ppt-front

[![node](https://img.shields.io/badge/node-18.18.0-green.svg)](https://github.com/nodejs/node)
[![npm](https://img.shields.io/badge/npm-9.8.1-brightgreen.svg)](https://github.com/npm/npm)
[![vue](https://img.shields.io/badge/vue-2.6.14-brightgreen.svg)](https://github.com/vuejs/vue)
[![vue-router](https://img.shields.io/badge/vue--router-3.5.4-brightgreen.svg)](https://github.com/vuejs/vue-router)
[![element-ui](https://img.shields.io/badge/element--ui-2.15.14-brightgreen.svg)](https://github.com/ElementUI/element-starter)
[![wavesurfer](https://img.shields.io/badge/wavesurfer-7.9.5-brightgreen.svg)](https://github.com/katspaugh/wavesurfer.js)
[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

## 简介

🎉🎉 这是智谱 GLM 大模型原生能力的 PPT 制作使用场景前端样例，希望对第一次接入的小伙伴有参考意义和帮助！🎉🎉。glm-ppt-front 是一个基于 Vue 2 和 webpack 构建的开源前端项目。项目中对基于 GLM 大模型的 PPT 制作能力的相关接口，进行了 web 前端功能实现。能够帮助用户快速上手，完成接入智谱 GLM 模型的 PPT 制作功能。样例实现了：使用示例快捷提问、自定义描述提问、创建 ppt、生成 ppt、修改 ppt、删除 ppt、导出 ppt 等功能；还支持搜索、访问页面、创建幻灯片、添加幻灯片、修改幻灯片、删除幻灯片、向上翻页、向下翻页等工具命中功能。

## 使用介绍

访问 [Z 智谱·一站式大模型开发平台](https://bigmodel.cn/)，注册并登录账号，获取 API Key。

**1.** ![alt text](/src/assets/images/image-1.png)
**2.** ![alt text](/src/assets/images/image-2.png)
**3.** ![alt text](/src/assets/images/image-3.png)
**4.复制 apikey** ![alt text](/src/assets/images/image-4.png)
**5.克隆项目到本地，安装依赖，启动项目，并将 apikey 粘贴到输入框中，即可使用模型功能** ![alt text](/src/assets/images/image-5.png)

## 特性

- **组件化设计**：高度组件化的架构，便于代码管理和功能扩展。

## 安装与使用

### 环境要求

- Node.js（版本 >= v18.0.0）
- npm 或 pnpm

### 安装依赖

```bash
git clone https://github.com/MetaGLM/glm-ppt-front.git
cd glm-ppt-front
pnpm install
```

### 运行项目

```bash
pnpm run dev
```

### 生产构建

```bash
pnpm run build
```

### 项目基本结构

```bash
glm-ppt-front/
├── public/             # 静态资源目录，直接复制到 dist 目录
│   ├── index.html      # 主 HTML 文件
├── src/                # 源代码目录
│   ├── api/            # API 接口目录
│   ├── assets/         # 应用内的静态资源，如图片、样式文件等
│   ├── components/     # 通用组件目录
│   ├── constants/      # 常量配置目录
│   ├── directives/     # 指令目录
│   ├── enums/          # 枚举目录
│   ├── icons/          # 图标目录
│   ├── locales/        # 多语言配置目录
│   ├── router/         # 路由配置目录
│   ├── store/          # Vuex 状态管理目录
│   ├── utils/          # 工具函数目录
│   ├── view/           # 页面组件目录
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .browserslistrc     # 浏览器兼容性配置文件
├── .editorconfig       # 编辑器配置文件
├── .env.development    # 开发环境配置文件
├── .env.production     # 生产环境配置文件
├── .eslintignore       # ESLint 忽略文件
├── .eslintrc.js        # ESLint 配置文件
├── .gitignore          # Git 忽略文件
├── .prettierignore     # Prettier 忽略文件
├── .prettierrc.js      # Prettier 配置文件
├── .stylelintignore    # Stylelint 忽略文件
├── .stylelintrc.js     # Stylelint 配置文件
├── babel.config.js     # Babel 配置文件
├── LICENSE             # 许可证文件
├── package.json        # 项目依赖和脚本配置文件
├── postcss.config.js   # PostCSS 配置文件
├── pnpm-lock.yaml      # pnpm 锁文件
├── README.md           # 项目说明文件
└── vue.config.js       # vue 配置文件
```

## 📄 许可证

本项目采用 [MIT] 许可证，详见 [LICENSE](./LICENSE.md)。
