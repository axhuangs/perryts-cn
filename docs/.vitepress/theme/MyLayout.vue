<script setup>
import { onMounted, ref } from 'vue';
import DefaultTheme from 'vitepress/theme'
import { useRouter } from 'vitepress';

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-ads-after>
      <div class="mt-2">
        My custom sidebar
      </div>
    </template>
    <template #not-found>
      <div class="notfound">
        <div class="icon">404</div>
        <div class="link">
          <a href="/perryts-cn">返回首页</a>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style>
  .mt-2{
    margin-top: 2rem;
  }

  .notfound{
    padding: 10vh 10vw;
    text-align: center;
  }
  .notfound .icon{
    font-size: 10rem;
    line-height: 10rem;
  }
  .notfound .link{
    margin-top: 2rem;
  }
</style>