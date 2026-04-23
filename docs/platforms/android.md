# Android

Perry 借助 JNI（Java Native Interface，Java 本地接口）为 Android 平台编译 TypeScript 应用。

## 环境要求

- Android NDK
- Android SDK
- Rust Android 目标平台：
  ```bash
  rustup target add aarch64-linux-android armv7-linux-androideabi
  ```

## 构建方式

```bash
perry app.ts -o app --target android
```

## UI 工具包

Perry 通过 JNI 将 UI 组件映射为 Android 视图：

| Perry 组件 | Android 类 |
|-------------|--------------|
| Text | TextView |
| Button | Button |
| TextField | EditText |
| SecureField | EditText (ES_PASSWORD) |
| Toggle | Switch |
| Slider | SeekBar |
| Picker | Spinner + ArrayAdapter |
| Image | ImageView |
| VStack | LinearLayout (vertical) |
| HStack | LinearLayout (horizontal) |
| ZStack | FrameLayout |
| ScrollView | ScrollView |
| Canvas | Canvas + Bitmap |
| NavigationStack | FrameLayout |

## 安卓专属 API

- **深色模式**：基于 `Configuration.uiMode` 进行检测
- **首选项**：使用 SharedPreferences
- **密钥链**：使用 Android Keystore
- **通知**：使用 NotificationManager
- **打开 URL**：调用 `Intent.ACTION_VIEW`
- **弹窗提示**：调用 `PerryBridge.showAlert`
- **表单弹窗**：使用 Dialog（模态）

## 启动页

Perry 的 Android 模板包含启动主题（`Theme.Perry.Splash`），该主题会在应用冷启动阶段显示 `windowBackground` 绘图资源。可在 `package.json` 中通过 `perry.splash` 配置项进行设置：

```json
{
  "perry": {
    "splash": {
      "image": "logo/icon-256.png",
      "background": "#FFF5EE"
    }
  }
}
```

启动页图片通过带纯色背景的 `layer-list` 绘图资源居中显示。Activity 会在 `onCreate` 方法中切换至常规主题，随后再填充布局，因此启动页会在应用准备就绪后立即消失。

如需完全自定义，可提供自定义的绘图资源和主题 XML 文件：

```json
{
  "perry": {
    "splash": {
      "android": {
        "layout": "splash/splash_background.xml",
        "theme": "splash/themes.xml"
      }
    }
  }
}
```

完整配置说明可参考[项目配置](../getting-started/project-config#splash)。

## 与桌面端的差异

- **仅支持触控**：无悬浮事件，无右键上下文菜单
- **单窗口**：多窗口模式映射为 Dialog 视图
- **工具栏**：使用水平方向的 LinearLayout
- **字体**：支持基于 Typeface 的字体族

## 后续参考

- [平台总览](overview) — 所有支持的平台
- [UI 总览](../ui/overview) — 完整 UI 系统说明