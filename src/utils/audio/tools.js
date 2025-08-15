export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    // 读取 blob 为 arrayBuffer
    const reader = new FileReader()
    reader.onloadend = () => {
      // reader.result 包含了 Base64 编码的字符串
      const base64data = reader.result
      resolve(base64data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 分割DataURL，返回一个数组
export function splitDataURL(dataUrl) {
  if (!dataUrl) {
    return []
  }
  return dataUrl.split(',')
}
/**
 * base64 转换为 file
 * @param base64Url
 * @param filename
 * @returns
 */
export function base64UrlToFile(base64Url, filename) {
  // 获取到base64编码
  const arr = base64Url.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  // 将base64编码转为字符串
  const bstr = atob(arr[1])
  let n = bstr.length
  // 创建初始化为0的，包含length个元素的无符号整型数组
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.preload = 'metadata'

    const onLoadedMetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
    }

    const onError = error => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio metadata: ' + error.message))
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onError)
  })
}
