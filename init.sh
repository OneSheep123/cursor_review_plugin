#!/bin/bash

# 安装依赖
echo "正在安装依赖..."
npm install

# 给脚本添加执行权限
echo "添加执行权限..."
chmod +x src/index.js

# 创建全局链接（可选）
echo "是否要创建全局命令？(y/n)"
read create_link

if [[ "$create_link" =~ ^[Yy]$ ]]; then
    echo "创建全局命令 'branch-review'..."
    npm link
    echo "现在你可以在任何Git仓库中运行 'branch-review' 命令"
else
    echo "跳过创建全局命令。你可以使用 'npm start' 或 'node src/index.js' 来运行工具"
fi

echo "安装完成！"
echo "使用方法："
echo "1. 在Git仓库中运行这个工具"
echo "2. 选择要比较的分支"
echo "3. 工具会生成提示并复制到剪贴板"
echo "4. 在Cursor中粘贴提示并发送"

# 运行一次工具（可选）
echo "是否要立即运行工具？(y/n)"
read run_now

if [[ "$run_now" =~ ^[Yy]$ ]]; then
    echo "运行工具..."
    node src/index.js
fi

 