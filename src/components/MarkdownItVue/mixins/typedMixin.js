import { isString } from 'lodash-es'
// TODO: 暂时不使用
const DEFAULT_CONFIG = {
  step: 1,
  typeSpeed: 40
}

/**
 * @content {string}
 * @isType {boolean}
 *
 *
 */

export default {
  data() {
    return {
      prevContent: '',
      typingIndex: 1
    }
  },
  computed: {
    mergedTypingEnabled() {
      return this.isType && isString(this.content)
    },
    isTyping() {
      return this.mergedTypingEnabled && this.typingIndex < this.content?.length
    },
    mergeData() {
      return {
        typingIndex: this.typingIndex,
        isType: this.isType,
        content: this.content
      }
    },
    typingSpeed() {
      return this.typeSpeed || DEFAULT_CONFIG.typeSpeed
    },
    typingStep() {
      return this.step || DEFAULT_CONFIG.step
    },
    mergedTypingContent() {
      return this.mergedTypingEnabled && isString(this.content)
        ? this.content.slice(0, this.typingIndex)
        : this.content
    }
  },
  watch: {
    content: {
      handler(value) {
        const prevContentValue = this.prevContent
        this.prevContent = value
        if (!this.mergedTypingEnabled && isString(value)) {
          this.typingIndex = value.length
        } else if (
          isString(value) &&
          isString(prevContentValue) &&
          value.indexOf(prevContentValue) !== 0
        ) {
          this.typingIndex = 1
        }
      }
    },
    mergeData: {
      handler(value) {
        const { content, typingIndex } = value
        if (this.mergedTypingEnabled && isString(content) && typingIndex < content.length) {
          this.typingTimer = setTimeout(() => {
            this.typingIndex = typingIndex + this.typingStep
            if (this.typingTimer) {
              clearTimeout(this.typingTimer)
              this.typingTimer = null
            }
          }, this.typingSpeed)
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer)
      this.typingTimer = null
    }
  }
}
