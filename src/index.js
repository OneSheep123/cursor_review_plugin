#!/usr/bin/env node

import { simpleGit } from 'simple-git';
import inquirer from 'inquirer';
import chalk from 'chalk';
import open from 'open';
import clipboardy from 'clipboardy';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { chdir } from 'process';

// 解析命令行参数
const args = process.argv.slice(2);
let targetDir = process.cwd(); // 默认为当前目录

// 检查是否有--dir参数
const dirIndex = args.indexOf('--dir');
if (dirIndex !== -1 && dirIndex < args.length - 1) {
  targetDir = args[dirIndex + 1];
  console.log(chalk.blue(`指定目标目录: ${targetDir}`));
  
  // 检查目录是否存在
  if (!existsSync(targetDir)) {
    console.error(chalk.red(`错误: 目录 "${targetDir}" 不存在`));
    process.exit(1);
  }
  
  // 切换工作目录
  try {
    chdir(targetDir);
    console.log(chalk.green(`✓ 已切换到目录: ${targetDir}`));
  } catch (err) {
    console.error(chalk.red(`错误: 无法切换到目录 "${targetDir}": ${err.message}`));
    process.exit(1);
  }
}

// 初始化Git
const git = simpleGit();

// 生成代码审核提示
async function generateReviewPrompt(currentBranch, comparisonBranch) {
  const branchPrompt = `@branch 
请对比当前分支 ${currentBranch} 和 ${comparisonBranch} 分支的差异，分析以下内容：

1. 代码变更概述：添加了哪些功能，修改了哪些文件
2. 代码质量评估：
   - 代码风格是否一致
   - 是否有潜在的bug或性能问题
   - 是否遵循最佳实践
3. 安全性检查：是否存在安全隐患
4. 改进建议：如何优化当前实现

请提供详细的代码审核报告。
`;

  return branchPrompt;
}

// 检查是否在Cursor中运行
function isRunningInCursor() {
  try {
    // 尝试获取环境变量，检查是否在Cursor中运行
    return process.env.CURSOR_EDITOR === 'true' || process.env.CURSOR === 'true';
  } catch (error) {
    return false;
  }
}

// 查找Cursor可执行文件
function findCursorExecutable() {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return 'Cursor.app'; // 返回应用程序名称
  } else if (platform === 'win32') {
    return 'C:\\Program Files\\Cursor\\Cursor.exe';
  } else if (platform === 'linux') {
    return '/usr/bin/cursor';
  }
  
  return null;
}

// 使用AppleScript自动化（仅在macOS上）
async function automateWithAppleScript() {
  if (process.platform !== 'darwin') {
    return false;
  }

  try {
    // AppleScript命令
    const script = `
      tell application "Cursor"
        activate
        delay 2
        tell application "System Events"
          tell process "Cursor"
            -- 打开聊天面板 (Cmd+L)
            keystroke "l" using command down
            delay 1
            -- 粘贴内容 (Cmd+V)
            keystroke "v" using command down
            delay 0.5
            -- 发送消息 (Return)
            keystroke return
          end tell
        end tell
      end tell
    `;

    // 执行AppleScript
    execSync(`osascript -e '${script}'`);
    return true;
  } catch (error) {
    console.error(chalk.red(`自动化失败: ${error.message}`));
    return false;
  }
}

// 打开Cursor应用
async function openCursor(projectPath) {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    try {
      // 使用open命令打开Cursor.app
      execSync('open -a Cursor.app ' + JSON.stringify(projectPath));
      
      // 等待Cursor启动
      console.log(chalk.yellow('正在等待Cursor启动...'));
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 尝试使用AppleScript自动化
      console.log(chalk.blue('尝试自动打开聊天面板并粘贴内容...'));
      const automated = await automateWithAppleScript();
      
      if (automated) {
        console.log(chalk.green('✓ 已自动打开聊天面板并粘贴内容'));
      } else {
        console.log(chalk.yellow('请手动打开聊天面板 (Cmd+L) 并粘贴内容'));
      }
      
      return true;
    } catch (error) {
      console.error(chalk.red(`无法打开Cursor: ${error.message}`));
      return false;
    }
  } else {
    // Windows和Linux上使用基本的打开功能
    try {
      const cursorPath = findCursorExecutable();
      if (cursorPath) {
        await open(cursorPath, { args: [projectPath] });
        console.log(chalk.green('✓ Cursor已启动'));
        console.log(chalk.yellow('请手动打开聊天面板 (Ctrl+L) 并粘贴内容'));
        return true;
      }
    } catch (error) {
      console.error(chalk.red(`无法打开Cursor: ${error.message}`));
      return false;
    }
  }
  return false;
}

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 主函数
async function main() {
  try {
    console.log(chalk.blue('🔍 正在分析Git仓库...'));

    // 检查是否在Git仓库中
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(chalk.red('错误: 当前目录不是Git仓库'));
      process.exit(1);
    }

    // 获取当前分支
    const { current: currentBranch } = await git.status();
    console.log(chalk.green(`✓ 当前分支: ${currentBranch}`));

    // 获取所有分支
    const branches = await git.branch();
    const branchNames = branches.all.filter(branch => !branch.includes('remotes/'));

    // 询问用户选择比较的分支（临时注释，用于测试使用）
    const { comparisonBranch } = await inquirer.prompt([
      {
        type: 'list',
        name: 'comparisonBranch',
        message: '选择要与当前分支比较的分支:',
        default: 'master',
        choices: branchNames
      }
    ]);

    console.log(chalk.green(`✓ 将比较 ${currentBranch} 与 ${comparisonBranch}`));

    // 生成审核提示
    const prompt = await generateReviewPrompt(currentBranch, comparisonBranch);
    
    // 复制到剪贴板
    await clipboardy.write(prompt);
    console.log(chalk.green('✓ 审核提示已复制到剪贴板'));

    // 检查是否在Cursor中运行
    if (isRunningInCursor()) {
      console.log(chalk.blue('🚀 在Cursor中打开聊天面板 (Cmd+L/Ctrl+L)，然后粘贴提示...'));
    } else {
      // 尝试打开Cursor
      console.log(chalk.blue('🚀 尝试打开Cursor...'));
      
      const projectPath = process.cwd();
      const success = await openCursor(projectPath);
      
      if (success) {
        console.log(chalk.green('✓ Cursor已启动'));
        console.log(chalk.yellow('请等待几秒钟，让Cursor完全启动...'));
        // 等待几秒钟让Cursor启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(chalk.blue('请在Cursor中打开聊天面板 (Cmd+L/Ctrl+L)，然后粘贴提示'));
      } else {
        console.log(chalk.yellow('请手动打开Cursor，然后粘贴剪贴板中的提示'));
      }
    }

    // 指导用户
    console.log('\n' + chalk.cyan('使用说明:'));
    console.log('1. 在Cursor中打开聊天面板 (Cmd+L 或 Ctrl+L)');
    console.log('2. 粘贴剪贴板中的内容 (Cmd+V 或 Ctrl+V)');
    console.log('3. 发送消息并等待代码审核报告\n');

    console.log(chalk.cyan('📋 审核提示内容:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(prompt);
    console.log(chalk.gray('─'.repeat(50)) + '\n');

  } catch (error) {
    console.error(chalk.red(`错误: ${error.message}`));
    process.exit(1);
  }
}

// 运行主函数
main(); 