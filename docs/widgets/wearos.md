# Wear OS Tiles

Perry 控件可以使用 `--target wearos-tile` 编译为 Wear OS Tiles。Tiles 是 Wear OS tile 轮播中的一目了然表面和 watch face complications。

## 概念

- **Tiles** 是用户在手表上滑动的全屏卡片
- **Complications** 是 watch face 上的小数据显示
- Perry 将 `Widget({...})` 编译为带有布局构建器的 `SuspendingTileService`

## 支持的组件

| Widget API | Wear OS Mapping |
|-----------|----------------|
| `Text` | `LayoutElementBuilders.Text` |
| `VStack` | `LayoutElementBuilders.Column` |
| `HStack` | `LayoutElementBuilders.Row` |
| `Spacer` | `LayoutElementBuilders.Spacer` |
| `Divider` | Spacer with 1dp height |
| `Gauge(circular)` | `LayoutElementBuilders.Arc` + `ArcLine` |
| `Gauge(linear)` | Text fallback |
| `Image` | Resource-based (provide drawable) |

## 示例

```typescript
import { Widget, Text, VStack, Gauge } from "perry/widget";

Widget({
  kind: "StepsTile",
  displayName: "Steps",
  description: "Daily step count",
  supportedFamilies: ["accessoryCircular"],

  provider: async () => {
    return {
      entries: [{ steps: 7500, goal: 10000 }],
      reloadPolicy: { after: { minutes: 60 } }
    }
  },

  render(entry: { steps: number; goal: number }) {
    return VStack([
      Gauge(entry.steps / entry.goal, {
        label: "Steps", style: "circular"
      }),
      Text(`${entry.steps}`, { font: "caption2" }),
    ])
  },
})
```

## 编译

```bash
perry widget.ts --target wearos-tile --app-bundle-id com.example.app -o tile_out
```

输出：
- `{Name}TileService.kt` — `SuspendingTileService` with tile layout
- `{Name}TileBridge.kt` — JNI bridge for native provider (if provider exists)
- `AndroidManifest_snippet.xml` — Service declaration

## Gradle 集成

添加到您的 Wear OS 模块的 `build.gradle`：

```groovy
dependencies {
    implementation "com.google.android.horologist:horologist-tiles:0.6.5"
    implementation "androidx.wear.tiles:tiles-material:3"
    implementation "androidx.wear.tiles:tiles:1.4.0"
}
```

将 manifest 片段合并到您的 `AndroidManifest.xml`：

```xml
<service
    android:name=".StepsTileService"
    android:exported="true"
    android:permission="com.google.android.wearable.permission.BIND_TILE_PROVIDER">
    <intent-filter>
        <action android:name="androidx.wear.tiles.action.BIND_TILE_PROVIDER" />
    </intent-filter>
</service>
```

## 原生提供者

与 Android 手机控件相同——Wear OS 是 Android：
- 目标三元组：`aarch64-linux-android`
- `libwidget_provider.so` 通过 `System.loadLibrary` 加载
- JNI 桥接模式与手机 Glance 控件完全相同
- `sharedStorage()` 使用 `SharedPreferences`

## 刷新

Wear Tiles 使用 `Tile` 构建器上的 `freshnessIntervalMillis`。通过提供者返回值中的 `reloadPolicy: { after: { minutes: N } }` 设置。默认：60 分钟。