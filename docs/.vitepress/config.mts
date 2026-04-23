import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "perry 中文教程",
  description: "perry 中文教程，英译版",
  lang: 'zh-CN',
  lastUpdated: true,
  base: '/',
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    }
  },
  themeConfig: {
    i18nRouting: false,
    
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '简介', link: '/introduction.html' }
    ],

    sidebar: [
      {
        text: '简介', link: '/introduction.html'
      },
      {
        text: '入门',
        items: [
          { text: '安装 Perry', link: '/getting-started/installation.html' },
          { text: '编写第一个程序', link: '/getting-started/hello-world.html' },
          { text: '第一个原生应用', link: '/getting-started/first-app.html' },
          { text: '项目配置', link: '/getting-started/project-config.html' },
        ]
      },
      {
        text: '语言',
        items: [
          { text: '支持的功能', link: '/language/supported-features.html' },
          { text: '类型系统', link: '/language/type-system.html' },
          { text: '局限性', link: '/language/limitations.html' },
        ]
      },
      {
        text: '多线程',
        items: [
          { text: '多线程概述', link: '/threading/overview.html' },
          { text: 'parallelMap', link: '/threading/parallel-map.html' },
          { text: 'parallelFilter', link: '/threading/parallel-filter.html' },
          { text: 'spawn', link: '/threading/spawn.html' },
        ]
      },
      {
        text: '原生UI',
        items: [
          { text: 'UI概述', link: '/ui/overview.html' },
          { text: 'Widgets(组件)', link: '/ui/widgets.html' },
          { text: 'Layout(布局)', link: '/ui/layout.html' },
          { text: 'Styling(样式)', link: '/ui/styling.html' },
          { text: 'State(状态管理)', link: '/ui/state.html' },
          { text: 'Events(事件)', link: '/ui/events.html' },
          { text: 'canvas(画布)', link: '/ui/canvas.html' },
          { text: 'Menus(菜单)', link: '/ui/menus.html' },
          { text: 'Dialogs(对话框)', link: '/ui/dialogs.html' },
          { text: 'Table(表格)', link: '/ui/table.html' },
          { text: 'Animation(动画)', link: '/ui/animation.html' },
          { text: 'Multi-Window(多窗口)', link: '/ui/multi-window.html' },
          { text: 'Theming(主题)', link: '/ui/theming.html' },
          { text: 'Camear(相机)', link: '/ui/camera.html' },
        ]
      },
      {
        text: '平台',
        items: [
          { text: '平台概述', link: '/platforms/overview.html' },
          { text: 'macOS', link: '/platforms/macos.html' },
          { text: 'iOS', link: '/platforms/ios.html' },
          { text: 'tvOS', link: '/platforms/tvos.html' },
          { text: 'watchOS', link: '/platforms/watchos.html' },
          { text: 'Android', link: '/platforms/android.html' },
          { text: 'Windows', link: '/platforms/windows.html' },
          { text: 'Linux (GTK4)', link: '/platforms/linux.html' },
          { text: 'Web', link: '/platforms/web.html' },
          { text: 'WebAssembly', link: '/platforms/wasm.html' },
        ]
      },
      {
        text: '标准库',
        items: [
          { text: '标准库概述', link: '/stdlib/overview.html' },
          { text: 'File System(文件系统)', link: '/stdlib/fs.html' },
          { text: 'HTTP & Networking(HTTP & 网络)', link: '/stdlib/http.html' },
          { text: 'Databases(数据库)', link: '/stdlib/database.html' },
          { text: 'Cryptography(加密)', link: '/stdlib/crypto.html' },
          { text: 'Utilities(实用工具)', link: '/stdlib/utilities.html' },
          { text: 'Other Modules(其他模块)', link: '/stdlib/other.html' },
        ]
      },
      {
        text: '国际化',
        items: [
          { text: '国际化概述', link: '/i18n/overview.html' },
          { text: 'Interpolation & Plurals(插值)', link: '/i18n/interpolation.html' },
          { text: 'Formatting(格式化)', link: '/i18n/formatting.html' },
          { text: 'CLI Tools(CLI 工具)', link: '/i18n/cli.html' },
        ]
      },
      {
        text: '系统应用程序接口',
        items: [
          { text: '系统 API 概述', link: '/system/overview.html' },
          { text: 'Preferences(偏好设置)', link: '/system/preferences.html' },
          { text: 'Keychain(安全存储)', link: '/system/keychain.html' },
          { text: 'Notifications(通知)', link: '/system/notifications.html' },
          { text: 'Audio Capture(音频采集)', link: '/system/audio.html' },
          { text: 'Other(其他系统 API)', link: '/system/other.html' },
        ]
      },
      {
        text: '小组件',
        items: [
          { text: '小组件概述', link: '/widgets/overview.html' },
          { text: 'Creating Widgets(创建小组件)', link: '/widgets/creating-widgets.html' },
          { text: 'Components & Modifiers(小组件和修饰符)', link: '/widgets/components.html' },
          { text: 'Configuration(配置)', link: '/widgets/configuration.html' },
          { text: 'Data Fetching(数据获取)', link: '/widgets/data-fetching.html' },
          { text: 'Cross-Platform Reference(跨平台参考)', link: '/widgets/platforms.html' },
          { text: 'watchOS Complications(watchOS 并发症)', link: '/widgets/watchos.html' },
          { text: 'Wear OS Tiles(Wear OS 磁贴)', link: '/widgets/wearos.html' },
        ]
      },
      {
        text: '插件系统',
        items: [
          { text: '插件系统概述', link: '/plugins/overview.html' },
          { text: 'Creating Plugins(创建插件)', link: '/plugins/creating-plugins.html' },
          { text: 'Hooks & Events(钩子 & 事件)', link: '/plugins/hooks-and-events.html' },
          { text: 'Native Extensions(原生扩展)', link: '/plugins/native-extensions.html' },
          { text: 'App Store Review(评分请求)', link: '/plugins/appstore-review.html' },
        ]
      },
      {
        text: '测试',
        items: [
          { text: 'Geisterhand (UI 模糊测试)', link: '/testing/geisterhand.html' },
        ]
      },
      {
        text: 'CLI 参考',
        items: [
          { text: 'Commands(命令)', link: '/cli/commands.html' },
          { text: 'Compiler Flags(编译器标志)', link: '/cli/flags.html' },
          { text: 'perry.toml Reference(perry.toml 参考)', link: '/cli/perry-toml.html' },
        ]
      },
      {
        text: '贡献',
        items: [
          { text: 'Architecture(架构)', link: '/contributing/architecture.html' },
          { text: 'Building from Source(从源代码构建)', link: '/contributing/building.html' },
        ]
      }
    ],

    lastUpdated: {
      text: '最后更新于',
      // formatOptions: {
      //   dateStyle: 'short'
      // }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航',
      level: [2, 4] // 大纲标题层级
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/axhuangs/perryts-cn' }
    // ],

    editLink: {
      pattern: '',
      text: 'v0.5.112'
    },

    footer: {
      message: 'MIT License.',
      copyright: 'Copyright © 2026-present oocoder.com'
    },

    // 广告
    // carbonAds: {
    //   code: 'your-carbon-code',
    //   placement: 'your-carbon-placement'
    // }
  },
  head: [
    [
      'script',
      { id: 'baidu-tongji' },
      `var _hmt = _hmt || [];
      window._hmt = _hmt;
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?7826c96ec89c645b5aae9c985569c14e";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();`
    ]
  ]
})
