#!/bin/sh
set -e

# 配置 npm 镜像源
yarn config set registry https://registry.npmjs.org
npm config set registry https://registry.npmjs.org

# 设置环境变量
export YARN_IGNORE_ENGINES=1
export PUPPETEER_SKIP_DOWNLOAD=true

cd /codes/graylog2-web-interface

echo "=== 1. 编译前端 graylog-web-plugin ==="
cd packages/graylog-web-plugin
yarn install --ignore-engines || { echo "graylog-web-plugin 安装依赖失败"; exit 1; }
yarn run build || { echo "graylog-web-plugin 编译失败"; exit 1; }

echo "=== 2. 编译前端 jest-preset-graylog ==="
cd ../jest-preset-graylog
yarn install --ignore-engines --production=false || { echo "jest-preset-graylog 安装依赖失败"; exit 1; }
yarn run build || { echo "jest-preset-graylog 编译失败"; exit 1; }

echo "=== 3. 安装前端主项目依赖 ==="
cd /codes/graylog2-web-interface
yarn install --ignore-engines || { echo "依赖安装失败"; exit 1; }

echo "=== 4. 开始构建前端项目 ==="
yarn run build || { echo "前端项目构建失败"; exit 1; }

echo "=== 前端构建完成 ==="
