# 跨平台参考

Perry 控件从单个 TypeScript 源编译到四个平台。相同的 `Widget({...})` 声明为每个目标生成原生代码。

## 目标标志

| Platform | Target Flag | Output |
|----------|------------|--------|
| iOS | `--target ios-widget` | SwiftUI `.swift` + Info.plist |
| iOS Simulator | `--target ios-widget-simulator` | Same, simulator SDK |
| Android | `--target android-widget` | Kotlin/Glance `.kt` + widget_info XML |
| watchOS | `--target watchos-widget` | SwiftUI `.swift` (accessory families) |
| watchOS Simulator | `--target watchos-widget-simulator` | Same, simulator SDK |
| Wear OS | `--target wearos-tile` | Kotlin Tiles `.kt` + manifest |

## 功能矩阵

| Feature | iOS | Android | watchOS | Wear OS |
|---------|-----|---------|---------|---------|
| Text | Yes | Yes | Yes | Yes |
| VStack/HStack/ZStack | Yes | Column/Row/Box | Yes | Column/Row/Box |
| Image (SF Symbols) | Yes | R.drawable | Yes | R.drawable |
| Spacer | Yes | Yes | Yes | Yes |
| Divider | Yes | Spacer+bg | Yes | Spacer |
| ForEach | Yes | forEach | Yes | forEach |
| Label | Yes | Row compound | Yes | Text fallback |
| Gauge | N/A | Text fallback | Yes | CircularProgressIndicator |
| Conditional | Yes | if | Yes | if |
| FamilySwitch | Yes | LocalSize | Yes | requestedSize |
| Config (AppIntent) | Yes | Config Activity | Yes (10+) | SharedPrefs |
| Native provider | Yes | JNI | Yes | JNI |
| sharedStorage | UserDefaults | SharedPrefs | UserDefaults | SharedPrefs |
| Deep linking (url) | widgetURL | clickable Intent | widgetURL | N/A |

## 平台特定说明

### iOS
- 最低部署：iOS 17.0
- AppIntentConfiguration 需要 `import AppIntents`
- 控件扩展内存限制：~30MB

### Android
- 需要 Glance 依赖：`androidx.glance:glance-appwidget:1.1.0`
- 控件大小从 iOS 系列映射：systemSmall=2x2, systemMedium=4x2, systemLarge=4x4
- `minimumScaleFactor` 在 Glance 中不支持（跳过并警告）

### watchOS
- 最低部署：watchOS 9.0
- 仅附件系列（圆形、矩形、内联）
- 更严格的内存 (~15-20MB) 和刷新预算（每小时）
- AppIntent 需要 watchOS 10+；较旧版本自动获取 StaticConfiguration

### Wear OS
- 与 Android 手机控件相同的原生编译（Wear OS = Android）
- 需要 Horologist + Tiles Material 3 依赖
- Tiles 是轮播中的全屏卡片
- `Gauge` 映射到 `CircularProgressIndicator`

## 构建说明

### iOS
```bash
perry widget.ts --target ios-widget --app-bundle-id com.example.app -o widget_out
xcrun --sdk iphoneos swiftc -target arm64-apple-ios17.0 \
  widget_out/*.swift -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```

### Android
```bash
perry widget.ts --target android-widget --app-bundle-id com.example.app -o widget_out
# Copy .kt files to app/src/main/java/com/example/app/
# Copy xml/ to app/src/main/res/xml/
# Merge AndroidManifest_snippet.xml into AndroidManifest.xml
```

### watchOS
```bash
perry widget.ts --target watchos-widget --app-bundle-id com.example.app -o widget_out
xcrun --sdk watchos swiftc -target arm64-apple-watchos9.0 \
  widget_out/*.swift -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```

### Wear OS
```bash
perry widget.ts --target wearos-tile --app-bundle-id com.example.app -o widget_out
# Copy .kt files to Wear OS module
# Add Horologist + Tiles Material 3 dependencies to build.gradle
# Merge AndroidManifest_snippet.xml
```