import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import { viteBuildInfo } from "./info";
import svgLoader from "vite-svg-loader";
import legacy from "@vitejs/plugin-legacy";
import vueJsx from "@vitejs/plugin-vue-jsx";
import WindiCSS from "vite-plugin-windicss";
import { viteMockServe } from "vite-plugin-mock";
import liveReload from "vite-plugin-live-reload";
import VueI18n from "@intlify/vite-plugin-vue-i18n";
import { visualizer } from "rollup-plugin-visualizer";
import removeConsole from "vite-plugin-remove-console";
import themePreprocessorPlugin from "@pureadmin/theme";
import Icons from "unplugin-icons/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
// 引入 ElementPlus 自动引入解析器
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
//
import AutoImport from "unplugin-auto-import/vite";
//
import vueSetupExtend from "vite-plugin-vue-setup-extend";
export function getPluginsList(command, VITE_LEGACY) {
  const prodMock = true;
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    vue(),
    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [resolve("locales/**")]
    }),
    // jsx、tsx语法支持
    vueJsx(),
    WindiCSS(),
    // 线上环境删除console
    removeConsole(),
    viteBuildInfo(),
    // 修改layout文件夹下的文件时自动重载浏览器 解决 https://github.com/xiaoxian521/vue-pure-admin/issues/170
    liveReload(["src/layout/**/*", "src/router/**/*"]),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/ // .md
      ],

      // global imports to register
      imports: ["vue", "vue-router", "vue-i18n", "@vueuse/core", "pinia"],
      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: true, // Default `false`
        filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },

      // custom resolvers
      // see https://github.com/antfu/unplugin-auto-import/pull/23/
      resolvers: [
        /* ... */
      ],

      // Filepath to generate corresponding .d.ts file.
      // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
      // Set `false` to disable.
      dts: "./auto-imports.d.ts"
    }),
    Components({
      resolvers: [
        IconsResolver({
          prefix: "icon",
          alias: {
            system: "system-uicons"
          },
          customCollections: ["admin"]
        }),
        // 使用 ElementPlus 自动引入解析器
        ElementPlusResolver(),
        // 自定义xx-ui解析器
        name => {
          // name为项目编译时加载到的自定义组件，String类型大驼峰格式的组件名
          // 例如：name = XxButton
          // 判断组件前缀
          if (name.startsWith("Xx")) {
            return {
              // 包名，XxButton -> Button
              importName: name.slice(2),
              // 路径直接写包名即可，因为我们已经安装了这个包
              path: "xx-ui"
            };
          }
        }
      ]
    }),
    Icons({
      compiler: "vue3",
      autoInstall: true,
      customCollections: {
        admin: FileSystemIconLoader("src/assets/svg", svg =>
          svg.replace(/^<svg /, '<svg fill="currentColor" ')
        )
      }
    }),
    vueSetupExtend(),
    // 自定义主题
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: [
          {
            scopeName: "layout-theme-default",
            path: "src/layout/theme/default-vars.scss"
          },
          {
            scopeName: "layout-theme-light",
            path: "src/layout/theme/light-vars.scss"
          },
          {
            scopeName: "layout-theme-dusk",
            path: "src/layout/theme/dusk-vars.scss"
          },
          {
            scopeName: "layout-theme-volcano",
            path: "src/layout/theme/volcano-vars.scss"
          },
          {
            scopeName: "layout-theme-yellow",
            path: "src/layout/theme/yellow-vars.scss"
          },
          {
            scopeName: "layout-theme-mingQing",
            path: "src/layout/theme/mingQing-vars.scss"
          },
          {
            scopeName: "layout-theme-auroraGreen",
            path: "src/layout/theme/auroraGreen-vars.scss"
          },
          {
            scopeName: "layout-theme-pink",
            path: "src/layout/theme/pink-vars.scss"
          },
          {
            scopeName: "layout-theme-saucePurple",
            path: "src/layout/theme/saucePurple-vars.scss"
          }
        ],
        // 默认取 multipleScopeVars[0].scopeName
        defaultScopeName: "",
        // 在生产模式是否抽取独立的主题css文件，extract为true以下属性有效
        extract: true,
        // 独立主题css文件的输出路径，默认取 viteConfig.build.assetsDir 相对于 (viteConfig.build.outDir)
        outputDir: "",
        // 会选取defaultScopeName对应的主题css文件在html添加link
        themeLinkTagId: "head",
        // "head"||"head-prepend" || "body" ||"body-prepend"
        themeLinkTagInjectTo: "head",
        // 是否对抽取的css文件内对应scopeName的权重类名移除
        removeCssScopeName: false,
        // 可以自定义css文件名称的函数
        customThemeCssFileName: scopeName => scopeName
      }
    }),
    // svg组件化支持
    svgLoader(),
    // mock支持
    viteMockServe({
      mockPath: "mock",
      localEnabled: command === "serve",
      prodEnabled: command !== "serve" && prodMock,
      injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `,
      logger: true
    }),
    // 是否为打包后的文件提供传统浏览器兼容性支持
    VITE_LEGACY
      ? legacy({
          targets: ["ie >= 11"],
          additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
        })
      : null,
    // 打包分析
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : null
  ];
}
