<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts" setup name="app">
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";
const instance =
  getCurrentInstance().appContext.config.globalProperties.$storage;
const currentLocale = computed(() => {
  return instance.locale?.locale === "zh" ? zhCn : en;
});
</script>
