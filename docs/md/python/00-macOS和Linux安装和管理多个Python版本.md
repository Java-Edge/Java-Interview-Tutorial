# 00-macOS和Linux安装和管理多个Python版本

在 Mac 上安装多个 Python 版本可通过几种不同方法实现。

## 1 Homebrew

### 1.1 安装 Homebrew

若安装过，跳过该步。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.2 安装 Python

如安装 Python 3.7：

```bash
brew install python@3.7
```

### 1.3 切换 Python 版本

Homebrew 会将安装的 Python 放在独立目录。你可以通过修改 PATH 环境变量或使用 `brew link` 和 `brew unlink` 命令来切换不同版本的 Python。

由于已经无法下载到 3.6，放弃该方案：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7950a8a9ff29761949564d3c9bd74473.png)

## 2 使用 pyenv

用于在同一系统上安装和管理多个 Python 版本。

### 2.1 安装 pyenv

使用 Homebrew 安装 pyenv：

```bash
brew install pyenv
```

### 2.2 安装 Python 版本

使用 pyenv 安装特定版本 Python：

```bash
pyenv install 3.7.9
```

### 设置 Python 版本

使用 pyenv 设置全局或局部（项目级）Python 版本。例如，要全局设置 Python 3.7.9，使用：

```bash
pyenv global 3.7.9
```

## 3 使用 Anaconda

Anaconda 是一个针对科学计算的 Python 发行版，它允许你管理多个 Python 环境。

1. **下载并安装 Anaconda**：
   从 [Anaconda 官网](https://www.anaconda.com/products/distribution) 下载适用于 Mac 的安装器，并按照指示进行安装。

2. **创建新的 Python 环境**：
   使用 Anaconda，你可以创建具有不同版本 Python 的独立环境。例如：

   ```bash
   conda create -n myenv python=3.7
   ```

3. **激活和使用环境**：
   要使用特定环境，请激活它：

   ```bash
   conda activate myenv
   ```

### 注意事项

- 在使用这些工具时，请确保你了解当前激活的 Python 环境，以避免版本混淆。
- 这些方法可以共存，但通常最好选择一种并坚持使用，以保持环境的一致性和可管理性。
- 了解如何正确配置 PATH 环境变量对于管理多个 Python 版本至关重要。

## 4 官网下载压缩包

适用于Unix & Linux 平台安装 Python:

以下为在 Unix & Linux 平台上安装 Python 的简单步骤：

- 打开 WEB 浏览器访问https://www.python.org/downloads/source/
- 选择适用 于Unix/Linux 的源码压缩包。
- 下载及解压压缩包。
- 如果你需要自定义一些选项修改*Modules/Setup*
- **执行** ./configure 脚本
- make
- make install

执行以上操作后，Python 会安装在 /usr/local/bin 目录，直接设置到 IDE 即可：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/26232a511debb89935197ec729d99fe5.png)

Python 库安装在 /usr/local/lib/pythonXX，XX 为你使用的 Python 的版本号。