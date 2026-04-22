# Android

Perry 使用 JNI (Java Native Interface) 为 Android 编译 TypeScript 应用。

## 要求

- Android NDK
- Android SDK
- Rust Android 目标：
  ```bash
  rustup target add aarch64-linux-android armv7-linux-androideabi
  ```

## 构建

```bash
perry app.ts -o app --target android
```

## UI 工具包

Perry 通过 JNI 将 UI 小部件映射到 Android 视图：

| Perry 小部件 | Android 类 |
|-------------|--------------|
| Text | TextView |
| Button | Button |
| TextField | EditText |
| SecureField | EditText (ES_PASSWORD) |
| Toggle | Switch |
| Slider | SeekBar |
| Picker | Spinner + ArrayAdapter |
| Image | ImageView |
| VStack | LinearLayout (垂直) |
| HStack | LinearLayout (水平) |
| ZStack | FrameLayout |
| ScrollView | ScrollView |
| Canvas | Canvas + Bitmap |
| NavigationStack | FrameLayout |

## Android 特定 API

- **深色模式**：`Configuration.uiMode` 检测
- **偏好设置**：SharedPreferences
- **钥匙串**：Android Keystore
- **通知**：NotificationManager
- **打开 URL**：`Intent.ACTION_VIEW`
- **警报**：`PerryBridge.showAlert`
- **工作表**：Dialog (模态)

## 启动画面

Perry 的 Android 模板包含一个启动主题 (`Theme.Perry.Splash`)，它在冷启动期间显示 `windowBackground` 可绘制对象。可以通过 `package.json` 中的 `perry.splash` 配置：

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

图像通过 `layer-list` 可绘制对象居中，带有实心背景颜色。活动在 `onCreate` 中切换到正常主题，在布局膨胀之前，所以启动画面在应用准备就绪时消失。

对于完整控制，提供自定义可绘制和主题 XML 文件：

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

请参阅 [项目配置](../getting-started/project-config.md#splash) 获取完整配置参考。

## 与桌面差异

- **仅触摸**：无悬停事件，无右键上下文菜单
- **单窗口**：多窗口映射到 Dialog 视图
- **工具栏**：水平 LinearLayout
- **字体**：基于 Typeface 的字体系列支持