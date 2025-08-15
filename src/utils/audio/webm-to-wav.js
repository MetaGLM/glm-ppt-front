/**
 * 将 WebM 音频 Blob 转换为 WAV 格式
 * @param {Blob} webmBlob - 输入的 WebM 音频 Blob
 * @returns {Promise<Blob>} - 返回 WAV 格式的 Blob
 */
export async function convertWebmToWav(webmBlob) {
  if (!(webmBlob instanceof Blob)) {
    throw new Error('Input must be a Blob object')
  }

  try {
    // 并行执行 ArrayBuffer 转换和 AudioContext 创建
    const [arrayBuffer, audioContext] = await Promise.all([
      webmBlob.arrayBuffer(),
      createAudioContext()
    ])

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return encodeAudioBufferToWav(audioBuffer)
  } catch (error) {
    throw new Error('Failed to convert WebM to WAV')
  }
}

/**
 * 创建 AudioContext 并处理兼容性
 * @returns {AudioContext}
 */
function createAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) {
    throw new Error('Web Audio API is not supported in this browser')
  }
  return new AudioContext()
}

/**
 * 将 AudioBuffer 编码为 WAV 格式 Blob
 * @param {AudioBuffer} audioBuffer - 输入的音频数据
 * @returns {Blob} - WAV 格式的 Blob
 */
function encodeAudioBufferToWav(audioBuffer) {
  const format = 1 // PCM
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = audioBuffer.length * blockAlign

  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // 写入 WAV 头部
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // 写入 PCM 数据
  floatTo16BitPCM(view, 44, audioBuffer)

  return new Blob([view], { type: 'audio/wav' })
}

/**
 * 将浮点音频数据转换为 16-bit PCM
 * @param {DataView} view - 数据视图
 * @param {number} offset - 写入偏移量
 * @param {AudioBuffer} audioBuffer - 音频数据
 */
function floatTo16BitPCM(view, offset, audioBuffer) {
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i)
    for (let j = 0; j < channelData.length; j++, offset += 2) {
      const value = Math.max(-1, Math.min(1, channelData[j]))
      view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true)
    }
  }
}

/**
 * 向 DataView 写入字符串
 * @param {DataView} view - 数据视图
 * @param {number} offset - 写入偏移量
 * @param {string} str - 要写入的字符串
 */
function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

export function convertBlobToFile(blob) {
  const file = new File([blob], `audio-${new Date().getTime()}.wav`, {
    type: 'audio/wav'
  })
  return file
}
