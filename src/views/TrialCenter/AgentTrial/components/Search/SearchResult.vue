<template>
  <div class="search-result-pane flex flex-dir-col">
    <div class="search-result-pane__header flex w-full flex-between gap-16 overflow-hidden">
      <div class="search-result-pane__header-left flex flex-ai-center gap-8 flex1 overflow-hidden">
        <i class="iconfont icon-wdsearch"></i>{{ $t('base.search') }}
      </div>
      <div class="search-result-pane__header-right flex flex-between gap-16 flex-none">
        <div class="separator"></div>
        <button
          type="button"
          @click="$emit('closePane')"
          class="close-btn pointer flex flex-center"
        >
          <i class="el-dialog__close el-icon el-icon-close"></i>
        </button>
      </div>
    </div>
    <section class="search-result-pane__main flex1 scroll-display-none">
      <div
        v-if="!searchList.length"
        class="empty flex flex-dir-col flex-ai-center flex-jc-center h-full w-full"
      >
        <svg-icon className="icon" iconClass="face_smile" />
        <div>{{ $t('common.no_data') }}</div>
      </div>
      <ul v-else class="search-list flex flex-dir-col gap-24">
        <li
          class="search-list__li flex flex-dir-col gap-4"
          v-for="(item, idx) in searchList"
          :key="idx"
        >
          <a
            :href="item.url"
            :title="item.title"
            target="_blank"
            rel="noopener noreferrer"
            class="external-link underline flex flex-ai-center gap-4"
          >
            <img :src="item.favicon" @error="errorImg" />
            <AutoTooltip :content="item.title" placement="top" :visibleArrow="false"> </AutoTooltip>
          </a>
          <div v-if="item.text && item.text.trim()" class="result-text dot-3">{{ item.text }}</div>
        </li>
      </ul>
    </section>
  </div>
</template>
<script>
import event from '@/utils/event'
import { EVENT_BUS } from '@/views/TrialCenter/AgentTrial/config/constants'
import AutoTooltip from '@/components/AutoTooltip.vue'
export default {
  name: 'SearchResultPane',
  components: {
    AutoTooltip
  },
  data() {
    return {
      searchList: []
    }
  },
  mounted() {
    event.$on(EVENT_BUS.SEARCH_LIST, this.handlerSearchList)
  },
  methods: {
    errorImg(e) {
      e.target.style.display = 'none'
    },
    handlerSearchList(list) {
      this.searchList = list
    }
  },
  beforeDestroy() {
    event.$off(EVENT_BUS.SEARCH_LIST, this.handlerSearchList)
  }
}
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.search-result-pane {
  height: 100%;
  padding: 16px 20px;
  background: #fff;
  &__header {
    padding-bottom: 16px;
    border-bottom: 1px solid #d9d9d9;
    &-left {
      color: #131212;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      i {
        font-size: 20px;
      }
    }
    &-right {
      .separator {
        width: 1px;
        height: 24px;
        background-color: #d9d9d9;
      }
      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: none;
        i {
          font-size: 20px;
        }
        &:hover {
          background-color: rgba(19, 18, 18, 0.05);
        }
      }
    }
  }
  &__main {
    padding-top: 20px;
    padding-bottom: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    .empty {
      color: #c3c4cc;
      font-size: 14px;
      line-height: 20px;
      svg {
        width: 64px;
        height: 64px;
      }
    }
    .search-list {
      &__li {
        .external-link {
          text-decoration: underline;
          img {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
  &__mobile {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
