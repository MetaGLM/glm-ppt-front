<template>
  <div id="app" class="pr">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  watch: {
    'langInfo.lang': {
      handler(lang) {
        if (lang === 'en') {
          document.title = 'ZHIPU AI OPEN PLATFORM'
          document.documentElement.lang = 'en'
        } else {
          document.title = '智谱AI开放平台'
          document.documentElement.lang = 'zh-cn'
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="less">
body {
  #app {
    height: 100%;
  }
  // pwa升级界面样式
  .update-dialog {
    z-index: 9999;
    position: fixed;
    left: 50%;
    bottom: 64px;
    transform: translateX(-50%);
    border-radius: 4px;
    box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.15);
    padding: 20px;
    max-width: 576px;
    color: black;
    background-color: #ffffff;
    text-align: left;

    &__actions {
      display: flex;
      margin-top: 20px;
    }

    &__button {
      width: 60px;
      height: 30px;
      outline: none;
      border: none;
      cursor: pointer;
      border-radius: 4px;

      &--confirm {
        margin-right: 8px;
        margin-left: auto;
        color: #fff;
        background: var(--primaryColor);
      }
    }
  }
}
</style>
