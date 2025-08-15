<template>
  <div class="ppt-list-container h-full" id="ppt-list-container">
    <div
      class="ppt-list-render pr scroll-display-none flex flex-dir-col gap-16 max-w-full overauto max-h-full"
      ref="pptListContainerRef"
      id="ppt-list-render"
    >
      <PPTRender
        v-for="(item, idx) in pptRawList"
        :key="item.id"
        :pptRaw="item"
        :total="pptRawList.length"
        :idx="idx"
        :showEdit="showEdit"
        :filter="filter && idx !== editingIndex"
        :editable="editable && (editingIndex === -1 || idx === editingIndex)"
        :agentId="agentId"
        :conversationId="conversationId"
      />
    </div>
  </div>
</template>
<script>
import event from '@/utils/event'
import { EVENT_BUS } from '@/views/TrialCenter/AgentTrial/config/constants'
import PPTRender from './PPTRender.vue'

export default {
  name: 'PPTListRender',
  components: {
    PPTRender
  },
  props: {
    pptRawList: {
      type: Array,
      default: () => []
    },
    showEdit: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Number,
      default: 0
    },
    editingIndex: {
      type: Number,
      default: -1
    },
    agentId: {
      type: String,
      default: ''
    },
    conversationId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pptListContainerRef: null,
      resizeObserver: null
    }
  },
  computed: {
    isMobile() {
      return this.media.isPhone
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(() => {
      event.$emit(EVENT_BUS.RESIZE_EVENT)
    })
    this.resizeObserver.observe(this.$refs.pptListContainerRef) // 观察父组件本身
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    event.$off(EVENT_BUS.RESIZE_EVENT)
  }
}
</script>
<style lang="less" scoped></style>
