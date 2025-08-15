/**
 * Crunker is the simple way to merge, concatenate, play, export and download audio files using the Web Audio API.
 */
export default class AudioManagerClass {
  _sampleRate
  _concurrentNetworkRequests
  _context
  _threshold

  constructor({ sampleRate, concurrentNetworkRequests = 200, threshold = 30 } = {}) {
    this._context = this._createContext(sampleRate)

    sampleRate = this._context.sampleRate

    this._sampleRate = sampleRate
    this._concurrentNetworkRequests = concurrentNetworkRequests
    this._threshold = threshold // 设定声音强度阈值
  }

  get context() {
    return this._context
  }

  createContext() {
    this._context = this._createContext(this._sampleRate)
  }

  async decodeAudioData(buffer) {
    return await this._context.decodeAudioData(buffer)
  }

  /**
   * Concatenates multiple AudioBuffers into a single AudioBuffer.
   *
   */
  concatAudio(buffers) {
    const output = this._context.createBuffer(
      this._maxNumberOfChannels(buffers),
      this._totalLength(buffers),
      this._sampleRate
    )
    let offset = 0
    buffers.forEach(buffer => {
      for (let channelNumber = 0; channelNumber < buffer.numberOfChannels; channelNumber++) {
        output.getChannelData(channelNumber).set(buffer.getChannelData(channelNumber), offset)
      }

      offset += buffer.length
    })

    return output
  }

  bufferToBlob(buffer, type = 'audio/wav') {
    const recorded = this._interleave(buffer)
    const dataview = this._writeHeaders(recorded, buffer.numberOfChannels, buffer.sampleRate)
    return new Blob([dataview], { type })
  }

  export(buffer, type = 'audio/wav') {
    const recorded = this._interleave(buffer)
    const dataview = this._writeHeaders(recorded, buffer.numberOfChannels, buffer.sampleRate)
    const audioBlob = new Blob([dataview], { type })

    return {
      blob: audioBlob,
      url: this._renderURL(audioBlob),
      element: this._renderAudioElement(audioBlob)
    }
  }

  /**
   * Downloads the provided Blob.
   *
   * @param blob Blob to download
   * @param filename An optional file name to use for the download (default: `crunker`)
   */
  download(blob, filename = 'crunker') {
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = this._renderURL(blob)
    a.download = `${filename}.${blob.type.split('/')[1]}`
    a.click()
    return a
  }

  notSupported(callback) {
    return this._isSupported() ? undefined : callback()
  }

  close() {
    if (this._context.state !== 'closed') {
      this._context.close()
    }
    return this
  }

  /**
   * 判断是否正在说话
   * @stream : 音频流
   * @callback : 回调函数
   *
   */
  checkSpeaking(stream, callback) {
    const source = this._context.createMediaStreamSource(stream)
    const analyser = this._context.createAnalyser()

    source.connect(analyser)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let speaking = false
    const threshold = this._threshold

    function checkVolume() {
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }

      const average = sum / bufferLength

      if (average > threshold && !speaking) {
        speaking = true
        callback(true)
      } else if (average < threshold && speaking) {
        speaking = false
        callback(false)
      }
      requestAnimationFrame(checkVolume)
    }

    requestAnimationFrame(checkVolume)
  }

  /**
   * Creates Crunker's internal AudioContext.
   */
  _createContext(sampleRate = 44100) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext
    return new AudioContext({ sampleRate })
  }

  /**
   * Returns the largest number of channels in an array of AudioBuffers.
   *
   * @internal
   */
  _maxNumberOfChannels(buffers) {
    return Math.max(...buffers.map(buffer => buffer.numberOfChannels))
  }

  _totalLength(buffers) {
    return buffers.map(buffer => buffer.length).reduce((a, b) => a + b, 0)
  }

  _isSupported() {
    return 'AudioContext' in window || 'webkitAudioContext' in window || 'mozAudioContext' in window
  }

  /**
   * Writes the WAV headers for the specified Float32Array.
   *
   * Returns a DataView containing the WAV headers and file content.
   *
   * @internal
   */
  _writeHeaders(buffer, numOfChannels, sampleRate) {
    const bitDepth = 16
    const bytesPerSample = bitDepth / 8
    const sampleSize = numOfChannels * bytesPerSample

    const fileHeaderSize = 8
    const chunkHeaderSize = 36
    const chunkDataSize = buffer.length * bytesPerSample
    const chunkTotalSize = chunkHeaderSize + chunkDataSize

    const arrayBuffer = new ArrayBuffer(fileHeaderSize + chunkTotalSize)
    const view = new DataView(arrayBuffer)

    this._writeString(view, 0, 'RIFF')
    view.setUint32(4, chunkTotalSize, true)
    this._writeString(view, 8, 'WAVE')
    this._writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * sampleSize, true)
    view.setUint16(32, sampleSize, true)
    view.setUint16(34, bitDepth, true)
    this._writeString(view, 36, 'data')
    view.setUint32(40, chunkDataSize, true)

    return this._floatTo16BitPCM(view, buffer, fileHeaderSize + chunkHeaderSize)
  }

  _floatTo16BitPCM(dataview, buffer, offset) {
    for (let i = 0; i < buffer.length; i++, offset += 2) {
      const tmp = Math.max(-1, Math.min(1, buffer[i]))
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true)
    }

    return dataview
  }

  _writeString(dataview, offset, header) {
    for (let i = 0; i < header.length; i++) {
      dataview.setUint8(offset + i, header.charCodeAt(i))
    }
  }

  _interleave(input) {
    if (input.numberOfChannels === 1) {
      // No need to interleave channels, just return single channel data to save performance and memory
      return input.getChannelData(0)
    }
    const channels = []
    for (let i = 0; i < input.numberOfChannels; i++) {
      channels.push(input.getChannelData(i))
    }
    const length = channels.reduce((prev, channelData) => prev + channelData.length, 0)
    const result = new Float32Array(length)

    let index = 0
    let inputIndex = 0

    // for 2 channels its like: [L[0], R[0], L[1], R[1], ... , L[n], R[n]]
    while (index < length) {
      channels.forEach(channelData => {
        result[index++] = channelData[inputIndex]
      })

      inputIndex++
    }

    return result
  }

  _renderAudioElement(blob) {
    const audio = document.createElement('audio')

    audio.controls = true
    audio.src = this._renderURL(blob)

    return audio
  }

  _renderURL(blob) {
    return (window.URL || window.webkitURL).createObjectURL(blob)
  }
}
