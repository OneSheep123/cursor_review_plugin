# Cursor 分支代码审核工具

这个工具可以帮助你比较当前开发分支与其他分支(默认master)的差异，并使用Cursor的`@branch`指令进行代码审核。

## 功能

- 自动检测当前Git分支
- 允许选择要比较的目标分支
- 自动生成`@branch`指令提示
- 将提示复制到剪贴板
- 自动打开Cursor编辑器
- 自动打开聊天面板并粘贴内容

## 系统要求

- Node.js 16.0+
- Git
- Cursor编辑器
- Python 2.7或3.x（用于编译robotjs）
- C++编译工具：
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Linux: GCC和相关构建工具(`build-essential`)

## 安装

### 1. 安装系统依赖

#### macOS:
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y build-essential
```

#### Windows:
1. 安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. 选择"C++ 构建工具"工作负载

### 2. 安装工具

#### 方法一：本地安装

1. 克隆此仓库到本地：
   ```
   git clone https://github.com/yourusername/cursor-branch-review.git
   ```

2. 进入项目目录并安装依赖：
   ```
   cd cursor-branch-review
   npm install
   ```

3. 创建全局链接（可选）：
   ```
   npm link
   ```

#### 方法二：直接从NPM安装（未发布时不可用）

```
npm install -g cursor-branch-review
```

## 使用方法

### 使用便捷脚本

最简单的方式是使用review.sh脚本：

```bash
# 审核当前目录
./review.sh

# 审核指定目录
./review.sh /path/to/your/git/repo
```

### 在已安装的项目中使用

```bash
# 审核当前目录
cd your-project
npx branch-review

# 审核指定目录
npm run review-dir -- /path/to/your/git/repo
```

### 如果全局安装了工具

```bash
# 审核当前目录
cd your-project
branch-review

# 审核指定目录（通过参数）
branch-review --dir /path/to/your/git/repo
```

## 工作流程

1. 工具会检测当前Git仓库和分支
2. 自动选择master分支作为比较目标
3. 生成代码审核提示并复制到剪贴板
4. 自动打开Cursor编辑器（如果未运行）
5. 自动打开聊天面板并粘贴提示
6. 自动发送消息等待审核结果

## 注意事项

- 确保Cursor编辑器已经安装在默认位置
- 如果自动粘贴失败，工具会提供手动操作的说明
- 首次运行时可能需要授予辅助功能权限（用于模拟键盘输入） 