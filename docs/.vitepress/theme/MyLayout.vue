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
          <a href="/">返回首页</a>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style>
  :root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
  }
  
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