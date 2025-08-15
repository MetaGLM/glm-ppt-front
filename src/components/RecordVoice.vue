<template>
  <div class="record-voice" :class="{ active: isRecording, disabled: disabled }">
    <slot :onStart="startRecording" :onStop="stopRecording">
      <el-tooltip effect="dark" :content="tooltipText" placement="top">
        <i class="iconfont icon-voice1 common-icon voice-icon-btn" @click="toggleRecording"></i>
      </el-tooltip>
    </slot>
    <div ref="recordContaniner" class="none"></div>
  </div>
</template>
<script>
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import { convertWebmToWav } from '@/utils/audio/webm-to-wav'
import { debounce } from 'lodash-es'

export default {
  name: 'RecordVoice',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },
    maxRecordDuration: {
      // 录制最大时长,秒
      type: Number,
      default: Infinity
    },
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isRecording: false,
      isSupportRecord: true,
      isEnding: false
    }
  },
  computed: {
    tooltipText() {
      if (this.disabled) {
        return this.$t('model_trial.search_box.audio_limit_tip', [this.limit])
      }
      if (this.isRecording) {
        return this.$t('common.stop_recording')
      }
      return this.$t('common.start_recording')
    }
  },
  created() {
    this.handleStartRecording = debounce(this.startRecording, 300)
  },
  mounted() {
    const optionsParams = {
      container: this.$refs.recordContaniner,
      ...this.options
    }

    this.waveSurfer = WaveSurfer.create(optionsParams)
    this.recordPlugin()
  },
  beforeDestroy() {
    if (this.recordInstance) {
      this.recordInstance.unAll()
      this.recordInstance = null
    }
    if (this.waveSurfer) {
      this.waveSurfer.destroy()
      this.waveSurfer = null
    }
  },
  methods: {
    recordPlugin() {
      this.recordInstance = this.waveSurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: false,
          continuousWaveform: true,
          // continuousWaveformDuration: this.waveSurfer.getDuration(),
          ...this.recordOptions
        })
      )

      // Render recorded audio
      this.recordInstance.on('record-end', async blob => {
        if (!blob || blob.size < 1) {
          this.$message.error(this.$t('common.recording_fail'))
          this.resetStatus()
          return
        }
        try {
          const wavBlob = await convertWebmToWav(blob)
          this.$emit('onStop', {
            blob: wavBlob,
            url: URL.createObjectURL(wavBlob)
          })
          this.resetStatus()
        } catch (error) {
          console.error('Error converting blob to wav:', error)
          this.$message.error(this.$t('common.recording_fail'))
          this.resetStatus()
        }
      })

      this.recordInstance.on('record-progress', time => {
        this.updateProgress(time)
        if (time >= this.maxRecordDuration * 1000) {
          this.stopRecording()
        }
      })
    },
    updateProgress(time) {
      // time will be in milliseconds, convert it to mm:ss format
      const formattedTime = [
        Math.floor((time % 3600000) / 60000), // minutes
        Math.floor((time % 60000) / 1000) // seconds
      ]
        .map(v => (v < 10 ? '0' + v : v))
        .join(':')

      this.$emit('onProgress', { time, text: formattedTime })
    },
    startRecording() {
      if (this.disabled || this.isRecording) {
        return
      }

      this.recordInstance
        .startRecording()
        .then(() => {
          this.$emit('onRecording')
          this.isSupportRecord = true
          this.isRecording = true
        })
        .catch(error => {
          this.isSupportRecord = false
          const message = error?.message || ''
          if (message.indexOf('Permission denied') > -1 || message.indexOf('permission') > -1) {
            this.$message.warning(this.$t('components.record_voice.no_permission'))
          } else {
            this.$message.warning(this.$t('components.record_voice.no_support'))
          }
        })
    },
    stopRecording() {
      if (typeof this.recordInstance?.stopRecording === 'function') {
        this.recordInstance.stopRecording()
      }
    },
    toggleRecording() {
      if (this.isEnding) {
        return
      }
      if (this.isRecording) {
        this.isEnding = true
        this.stopRecording()
      } else {
        this.handleStartRecording()
      }
    },
    resetStatus() {
      this.isEnding = false
      this.isRecording = false
    }
  }
}
</script>

<style scoped lang="less">
.record-voice {
  display: inline-flex;
  &.active {
    .iconfont {
      color: rgba(241, 52, 58, 1);
      background: rgba(240, 29, 36, 0.08);
    }
  }
  &.disabled {
    .iconfont {
      color: rgba(195, 196, 204, 1);
      cursor: not-allowed;
    }
  }
}
.iconfont {
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  font-size: 28px;
  line-height: 1;
  border-radius: 6px;
  color: rgba(119, 126, 139, 1);
}
</style>
