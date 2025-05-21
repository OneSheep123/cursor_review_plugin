#!/bin/bash

# 检查是否提供了目录参数
if [ $# -eq 0 ]; then
  echo "用法: ./review.sh <git仓库目录路径>"
  echo "如果不提供路径，将使用当前目录"
  echo ""
  echo "是否要使用当前目录? (y/n)"
  read use_current
  
  if [[ "$use_current" =~ ^[Yy]$ ]]; then
    npm run review
  else
    exit 1
  fi
else
  # 使用提供的目录路径
  TARGET_DIR="$1"
  
  # 检查目录是否存在
  if [ ! -d "$TARGET_DIR" ]; then
    echo "错误: 目录 '$TARGET_DIR' 不存在或不是一个有效的目录"
    exit 1
  fi
  
  # 执行代码审核
  npm run review-dir -- "$TARGET_DIR"
fi 