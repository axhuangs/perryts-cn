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

### npm /npx（推荐方式 — 支持所有平台）

Perry 以预编译二进制包的形式发布在 npm 上。这是最快捷的入门方式，也是唯一能通过单条命令覆盖全部 7 个支持平台的安装路径（macOS arm64/x64、Linux x64/arm64 glibc + musl、Windows x64）：

```bash
# 项目本地安装（将 Perry 版本与项目依赖绑定）
npm install @perryts/perry
npx perry compile src/main.ts -o myapp && ./myapp

# 全局安装
npm install -g @perryts/perry
perry compile src/main.ts -o myapp

# 零安装一次性使用
npx -y @perryts/perry compile src/main.ts -o myapp
```

[`@perryts/perry`](https://www.npmjs.com/package/@perryts/perry) 是一个轻量级启动器；npm 会根据系统的 `操作系统（os）`/`CPU 架构（cpu）`/`C 标准库（libc）`，自动从 `optionalDependencies` 中选择匹配的预编译包（如 `@perryts/perry\-darwin\-arm64`、`@perryts/perry\-linux\-x64\-musl` 等）。该方式要求 Node\.js 版本 ≥ 16。

|平台|预编译包名称|
|---|---|
|macOS arm64（Apple 硅芯片）|`@perryts/perry-darwin-arm64`|
|macOS x64（英特尔）|`@perryts/perry-darwin-x64`|
|Linux x64（glibc）|`@perryts/perry-linux-x64`|
|Linux arm64（glibc）|`@perryts/perry-linux-arm64`|
|Linux x64（musl / Alpine）|`@perryts/perry-linux-x64-musl`|
|Linux arm64（musl / Alpine）|`@perryts/perry-linux-arm64-musl`|
|Windows x64|`@perryts/perry-win32-x64`|

### Homebrew（macOS 系统）

```bash
brew install perryts/perry/perry
```

### winget（Windows 系统）

```bash
winget install PerryTS.Perry
```

### APT（Debian / Ubuntu 系统）

```bash
curl -fsSL https://perryts.github.io/perry-apt/perry.gpg.pub | sudo gpg --dearmor -o /usr/share/keyrings/perry.gpg
echo "deb [signed-by=/usr/share/keyrings/perry.gpg] https://perryts.github.io/perry-apt stable main" | sudo tee /etc/apt/sources.list.d/perry.list
sudo apt update && sudo apt install perry
```

### 从源码编译

```bash
git clone https://github.com/PerryTS/perry.git
cd perry
cargo build --release
```

编译后的二进制文件位于 `target/release/perry`。将其添加到系统环境变量 PATH：

```bash
# 将以下内容添加到 ~/.zshrc 或 ~/.bashrc 文件中
export PATH="/path/to/perry/target/release:$PATH"
```

### 自更新

安装完成后，Perry 支持自助更新：

```bash
perry update
```

该命令会下载最新版本，并以原子操作方式替换现有二进制文件。

### 验证安装

```bash
perry doctor
```

该命令会检查安装状态、显示当前版本，并提示是否有可用更新。

```bash
perry --version
```

## 后续参考

- [编写第一个程序](hello-world)

- [构建原生应用](first-app)

