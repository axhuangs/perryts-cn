# Wear OS 磁贴

Perry 组件可通过 `--target wearos-tile` 编译为 Wear OS 磁贴。磁贴是 Wear OS 磁贴轮播界面和表盘功能组件（complications）中可快速查看的交互界面。

## 核心概念

- **磁贴（Tiles）**：用户在手表上滑动浏览的全屏卡片式界面
- **功能组件（Complications）**：表盘上显示小型数据的区域
- Perry 会将 `Widget({...})` 编译为带布局构建器的 `SuspendingTileService`

## 支持的组件

| 组件 API | Wear OS 映射关系 |
|-----------|----------------|
| `Text` | `LayoutElementBuilders.Text` |
| `VStack` | `LayoutElementBuilders.Column` |
| `HStack` | `LayoutElementBuilders.Row` |
| `Spacer` | `LayoutElementBuilders.Spacer` |
| `Divider` | 高度为 1dp 的 Spacer |
| `Gauge(circular)` | `LayoutElementBuilders.Arc` + `ArcLine` |
| `Gauge(linear)` | 文本降级展示 |
| `Image` | 基于资源文件（需提供 drawable 资源） |

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

## 编译方式

```bash
perry widget.ts --target wearos-tile --app-bundle-id com.example.app -o tile_out
```

输出文件：
- `{Name}TileService.kt` — 包含磁贴布局的 `SuspendingTileService` 实现类
- `{Name}TileBridge.kt` — 用于原生 provider 的 JNI 桥接文件（若存在 provider 则生成）
- `AndroidManifest_snippet.xml` — 服务声明配置片段

## Gradle 集成

在 Wear OS 模块的 `build.gradle` 中添加以下配置：

```groovy
dependencies {
    implementation "com.google.android.horologist:horologist-tiles:0.6.5"
    implementation "androidx.wear.tiles:tiles-material:1.4.0"
    implementation "androidx.wear.tiles:tiles:1.4.0"
}
```

将清单配置片段合并到项目的 `AndroidManifest.xml` 中：

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

## 原生 Provider

与 Android 手机端组件机制一致 —— Wear OS 本质是 Android 系统：
- 目标架构三元组：`aarch64-linux-android`
- `libwidget_provider.so` 通过 `System.loadLibrary` 加载
- JNI 桥接模式与手机端 Glance 组件完全相同
- `sharedStorage()` 基于 `SharedPreferences` 实现

## 刷新机制

Wear 磁贴通过 `Tile` 构建器中的 `freshnessIntervalMillis` 控制刷新频率。可在 provider 返回值中通过 `reloadPolicy: { after: { minutes: N } }` 配置，默认值为 60 分钟。
