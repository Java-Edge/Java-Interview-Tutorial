# Claude Code 完整安装与上手指南，让 AI 住进你的终端

Prerequisites: 先决条件：一个 [Claude.ai](https://claude.ai/) （推荐）或 [Claude Console](https://console.anthropic.com/) 帐户。

## 1 安装

### 1.1 本地安装（推荐）

macOS, Linux, WSL: macOS、Linux、WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash


✔ Claude Code successfully installed!

  Version: 2.0.72

  Location: ~/.local/bin/claude


  Next: Run claude --help to get started

⚠ Setup notes:
  • Native installation exists but ~/.local/bin is not in your PATH. Run:

  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc


✅ Installation complete!
```

Windows PowerShell: Windows PowerShell：

```bash
irm https://claude.ai/install.ps1 | iex
```

Windows CMD: Windows 命令提示符：

```bash
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### 1.2 Homebrew

```bash
brew install --cask claude-code
```

### 1.3 npm

如果您已[安装 Node.js 18 或更高版本 ](https://nodejs.org/en/download/)：

```bash
npm install -g @anthropic-ai/claude-code
```

## 2 开始使用

```bash
cd your-project
claude
```

首次使用时，系统会提示您登录。就是这样！[ 继续快速入门（5 分钟）→](https://code.claude.com/docs/en/quickstart)

Claude Code 会自动保持更新。有关安装选项、手动更新或卸载说明，请参阅[高级设置 ](https://code.claude.com/docs/en/setup)。如果遇到问题，请访问[故障排除](https://code.claude.com/docs/en/troubleshooting)页面。

## 3 能做啥？

- **根据描述构建功能** ：用简洁明了的英语告诉 Claude 你想构建什么。它会制定计划、编写代码并确保其正常运行。
- **调试和修复问题** ：描述错误或粘贴错误信息。Claude Code 将分析您的代码库，找出问题并进行修复。
- **轻松驾驭任何代码库** ：您可以询问任何关于团队代码库的问题，并获得周全的解答。Claude Code 能够全面了解您的项目结构，从网络上获取最新信息，并且借助 [MCP](https://code.claude.com/docs/en/mcp) 功能，还可以从 Google Drive、Figma 和 Slack 等外部数据源提取数据。
- **自动化繁琐任务** ：修复繁琐的代码检查问题、解决合并冲突、编写发布说明。所有这些操作都可以在您的开发机器上通过一条命令完成，或者在持续集成 (CI) 环境中自动完成。

## 4 为啥喜欢？

- **直接在终端运行** ：无需打开聊天窗口，也无需打开集成开发环境 (IDE)。Claude Code 与您现有的工作环境完美契合，使用您熟悉的工具。
- **执行操作** ：Claude Code 可以直接编辑文件、运行命令和创建提交。需要更多功能？ [MCP](https://code.claude.com/docs/en/mcp) 让 Claude 可以读取 Google 云端硬盘中的设计文档、更新 Jira 中的工单，或使用*您*自定义的开发者工具。
- **Unix 哲学** ：Claude 代码是可组合和可脚本化的。 `tail -f app.log | claude -p "Slack me if you see any anomalies appear in this log stream"` 可以*运行* 。你的 CI 可以运行 `claude -p "If there are new text strings, translate them into French and raise a PR for @lang-fr-team to review"` 。
- **企业级就绪** ：可用 Claude API，或托管在 AWS 或 GCP 上。内置企业级[安全性 ](https://code.claude.com/docs/en/security)、[ 隐私性](https://code.claude.com/docs/en/data-usage)和合[规性 ](https://trust.anthropic.com/)。