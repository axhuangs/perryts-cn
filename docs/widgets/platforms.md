# 跨平台参考
Perry 组件可从单一 TypeScript 源码编译至四个平台。相同的 `Widget({...})` 声明会为每个目标平台生成原生代码。

## 目标平台标识
| 平台 | 目标标识 | 输出内容 |
|----------|------------|--------|
| iOS | `--target ios-widget` | SwiftUI `.swift` 文件 + Info.plist 文件 |
| iOS 模拟器 | `--target ios-widget-simulator` | 输出内容同上，适配模拟器 SDK |
| Android | `--target android-widget` | Kotlin/Glance `.kt` 文件 + widget_info XML 文件 |
| watchOS | `--target watchos-widget` | SwiftUI `.swift` 文件（适配配件样式族） |
| watchOS 模拟器 | `--target watchos-widget-simulator` | 输出内容同上，适配模拟器 SDK |
| Wear OS | `--target wearos-tile` | Kotlin Tiles `.kt` 文件 + 清单文件 |

## 功能支持矩阵
| 功能 | iOS | Android | watchOS | Wear OS |
|---------|-----|---------|---------|---------|
| 文本 | 支持 | 支持 | 支持 | 支持 |
| VStack/HStack/ZStack 布局 | 支持 | 对应 Column/Row/Box 布局 | 支持 | 对应 Column/Row/Box 布局 |
| 图片（SF Symbols） | 支持 | 对应 R.drawable 资源 | 支持 | 对应 R.drawable 资源 |
| 间距控件（Spacer） | 支持 | 支持 | 支持 | 支持 |
| 分隔线（Divider） | 支持 | 基于 Spacer+背景色实现 | 支持 | 基于 Spacer 实现 |
| 循环遍历（ForEach） | 支持 | 对应 forEach 语法 | 支持 | 对应 forEach 语法 |
| 标签（Label） | 支持 | 基于 Row 复合组件实现 | 支持 | 降级为文本展示 |
| 仪表盘（Gauge） | 不适用 | 降级为文本展示 | 支持 | 对应 CircularProgressIndicator 组件 |
| 条件渲染 | 支持 | 对应 if 语法 | 支持 | 对应 if 语法 |
| 样式族切换（FamilySwitch） | 支持 | 对应 LocalSize 接口 | 支持 | 对应 requestedSize 接口 |
| 配置项（AppIntent） | 支持 | 对应 Config Activity 组件 | 支持（watchOS 10+） | 对应 SharedPrefs 存储 |
| 原生提供器（Native provider） | 支持 | 基于 JNI 实现 | 支持 | 基于 JNI 实现 |
| 共享存储（sharedStorage） | 基于 UserDefaults 实现 | 基于 SharedPrefs 实现 | 基于 UserDefaults 实现 | 基于 SharedPrefs 实现 |
| 深度链接（url） | 基于 widgetURL 实现 | 基于可点击 Intent 实现 | 基于 widgetURL 实现 | 不支持 |

## 平台专属说明

### iOS
- 最低部署版本：iOS 17.0
- AppIntentConfiguration 需引入 `import AppIntents`
- 组件扩展内存限制：约 30MB

### Android
- 依赖 Glance 库：`androidx.glance:glance-appwidget:1.1.0`
- 组件尺寸映射自 iOS 样式族：systemSmall=2x2、systemMedium=4x2、systemLarge=4x4
- Glance 不支持 `minimumScaleFactor`（会触发警告并跳过该配置）

### watchOS
- 最低部署版本：watchOS 9.0
- 仅支持配件样式族（圆形、矩形、内联）
- 内存（约 15-20MB）和刷新频率限制更严格（每小时刷新）
- AppIntent 需 watchOS 10+；低版本使用 StaticConfiguration

### Wear OS
- 与安卓手机端原生编译逻辑一致（Wear OS 归属 Android 体系）
- 依赖 Horologist + Tiles Material 3 库
- 磁贴（Tiles）为轮播组件中的全屏卡片
- `Gauge` 组件映射为 `CircularProgressIndicator`

## 构建说明

### iOS
```bash
perry widget.ts --target ios-widget --app-bundle-id com.example.app -o widget_out
xcrun --sdk iphoneos swiftc -target arm64-apple-ios17.0 \
  widget_out/*.swift -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```
上述命令执行步骤：
1. 编译 TypeScript 组件源码至指定输出目录
2. 通过 xcrun 编译 Swift 源码，链接 WidgetKit 和 SwiftUI 框架，生成组件扩展文件

### Android
```bash
perry widget.ts --target android-widget --app-bundle-id com.example.app -o widget_out
# Copy .kt files to app/src/main/java/com/example/app/
# Copy xml/ to app/src/main/res/xml/
# Merge AndroidManifest_snippet.xml into AndroidManifest.xml
```
上述命令执行步骤：
1. 编译 TypeScript 组件源码至指定输出目录
2. 将生成的 .kt 文件拷贝至 app/src/main/java/com/example/app/ 目录
3. 将 xml 目录拷贝至 app/src/main/res/xml/ 目录
4. 将 AndroidManifest_snippet.xml 内容合并至 AndroidManifest.xml 文件

### watchOS
```bash
perry widget.ts --target watchos-widget --app-bundle-id com.example.app -o widget_out
xcrun --sdk watchos swiftc -target arm64-apple-watchos9.0 \
  widget_out/*.swift -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```
上述命令执行步骤：
1. 编译 TypeScript 组件源码至指定输出目录
2. 通过 xcrun 编译 Swift 源码，链接 WidgetKit 和 SwiftUI 框架，生成组件扩展文件

### Wear OS
```bash
perry widget.ts --target wearos-tile --app-bundle-id com.example.app -o widget_out
# Copy .kt files to Wear OS module
# Add Horologist + Tiles Material 3 dependencies to build.gradle
# Merge AndroidManifest_snippet.xml
```
上述命令执行步骤：
1. 编译 TypeScript 组件源码至指定输出目录
2. 将生成的 .kt 文件拷贝至 Wear OS 模块目录
3. 在 build.gradle 中添加 Horologist + Tiles Material 3 依赖
4. 合并 AndroidManifest_snippet.xml 至清单文件
