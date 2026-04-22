# 安装

## 必须先决条件

Perry 需要将 TypeScript 编译为原生二进制文件，因此必须依赖系统的 C 语言工具链。请根据你的操作系统执行以下命令：

- macOS 用户：
  
  打开终端，输入以下命令安装 Xcode 命令行工具：

  ```bash
  xcode-select --install
  ```

- Linux 用户 (Debian/Ubuntu)：

  安装 gcc 或 clang 编译器：

  ```bash
  sudo apt install build-essential
  ```

- Windows 用户：

  你需要安装 Visual Studio Build Tools，并在安装时勾选 "Desktop development with C++"（使用 C++ 的桌面开发）工作负载。

> 注意：如果你打算从源代码安装，还需要安装 Rust 工具链 [rustup](https://rustup.rs/)，但一般用户不需要这一步。

## 安装 Perry

### npm / npx（推荐 — 任何平台）

Perry 作为预构建二进制 npm 包发布。这是开始的最快方式，也是唯一涵盖所有七个支持平台（macOS arm64/x64、Linux x64/arm64 glibc + musl、Windows x64）的路径，只需一个命令：

```bash
# 项目本地（将 Perry 的版本与您的依赖项一起固定）
npm install @perryts/perry
npx perry compile src/main.ts -o myapp && ./myapp

# 全局
npm install -g @perryts/perry
perry compile src/main.ts -o myapp

# 零安装，一次性
npx -y @perryts/perry compile src/main.ts -o myapp
```

[`@perryts/perry`](https://www.npmjs.com/package/@perryts/perry) 是一个薄启动器；npm 根据您的 `os` / `cpu` / `libc` 自动通过 `optionalDependencies` 选择匹配的预构建（`@perryts/perry-darwin-arm64`、`@perryts/perry-linux-x64-musl` 等）。需要 Node.js ≥ 16。

| 平台 | 预构建包 |
|---|---|
| macOS arm64（Apple Silicon） | `@perryts/perry-darwin-arm64` |
| macOS x64（Intel） | `@perryts/perry-darwin-x64` |
| Linux x64（glibc） | `@perryts/perry-linux-x64` |
| Linux arm64（glibc） | `@perryts/perry-linux-arm64` |
| Linux x64（musl / Alpine） | `@perryts/perry-linux-x64-musl` |
| Linux arm64（musl / Alpine） | `@perryts/perry-linux-arm64-musl` |
| Windows x64 | `@perryts/perry-win32-x64` |

### Homebrew（macOS）

```bash
brew install perryts/perry/perry
```

### winget（Windows）

```bash
winget install PerryTS.Perry
```

### APT（Debian / Ubuntu）

```bash
curl -fsSL https://perryts.github.io/perry-apt/perry.gpg.pub | sudo gpg --dearmor -o /usr/share/keyrings/perry.gpg
echo "deb [signed-by=/usr/share/keyrings/perry.gpg] https://perryts.github.io/perry-apt stable main" | sudo tee /etc/apt/sources.list.d/perry.list
sudo apt update && sudo apt install perry
```

### 从源代码

```bash
git clone https://github.com/PerryTS/perry.git
cd perry
cargo build --release
```

二进制文件位于 `target/release/perry`。将其添加到您的 PATH：

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export PATH="/path/to/perry/target/release:$PATH"
```

### 自我更新

安装后，Perry 可以自我更新：

```bash
perry update
```

这会下载最新版本并原子替换二进制文件。

## 验证安装

```bash
perry doctor
```

这会检查您的安装，显示当前版本，并报告是否有更新可用。

```bash
perry --version
```