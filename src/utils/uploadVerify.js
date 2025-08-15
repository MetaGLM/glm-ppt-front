import i18n from '@/locales'
import { Message } from 'element-ui'
/**
 * 校验格式
 */
export function verifyType(file, fileType = 'image') {
  // 校验格式
  let isImg = false
  if (fileType && fileType instanceof Array && fileType.length > 0) {
    let fileExtension = ''
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
    }
    isImg = fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true
      if (fileExtension && fileExtension.indexOf(type) > -1) return true
      return false
    })
  } else {
    isImg = file.type.indexOf(fileType) > -1
  }

  if (!isImg) {
    Message({
      type: 'error',
      message: i18n.t('common.upload.file_type_error', { type: fileType.join('，') })
    })
  }
  return isImg
}

/**
 * 校验大小
 */
export function verifySize(file, fileSize = 3) {
  // 校验大小
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isLt) {
    Message({
      type: 'error',
      message: i18n.t('common.upload.file_size_error', { size: fileSize })
    })
    return false
  }
  if (file.name && file.name.length > 100) {
    Message({
      type: 'error',
      message: i18n.t('common.upload.file_ext_error')
    })
    return false
  }
  return true
}

/**
 * 图片通用压缩提示
 */
export function commonZipPic(file, ratio) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    let resultBlob = ''
    image.src = URL.createObjectURL(file)
    image.onload = () => {
      resultBlob = compressUpload(image, file, 4096, 4096, ratio)
      const fs = new File([resultBlob], file.name, {
        type: 'image/jpeg' || file.type
      })
      console.log(`🚀当前源文件大小：${file.size / 1048576}M`)
      console.log(`🚀压缩后文件大小：${fs.size / 1048576}M`)
      // if (fs.size / 1048576 > 2) {
      //   this.$message.warning('压缩后图片仍大于2M，请您手动压缩，以用于OCR识别')
      //   reject()
      // }
      resolve(fs)
    }
    image.onerror = () => {
      reject()
    }
  })
}

/**
 * 图片压缩方法-canvas压缩
 */
export function compressUpload(image, file, mx, mh, ratio) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const { width: originWidth, height: originHeight } = image
  // 最大尺寸限制
  const maxWidth = mx
  const maxHeight = mh
  // 目标尺寸
  let targetWidth = originWidth
  let targetHeight = originHeight
  if (originWidth > maxWidth || originHeight > maxHeight) {
    if (originWidth / originHeight > 1) {
      // 宽图片
      targetWidth = maxWidth
      targetHeight = Math.round(maxWidth * (originHeight / originWidth))
    } else {
      // 高图片
      targetHeight = maxHeight
      targetWidth = Math.round(maxHeight * (originWidth / originHeight))
    }
  }
  canvas.width = targetWidth
  canvas.height = targetHeight
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  // 进行压缩
  // 对于图片文件是转换png格式的会导致图片文件比源文件都大，故限制文件格式是jpeg格式，才会真正压缩
  const compressData = canvas.toDataURL('image/jpeg' || file.type, ratio)
  // 压缩后调用方法进行base64转Blob
  const blobImg = dataURItoBlob(compressData)
  return blobImg
}

/**
 * base64转Blob对象
 */
export function dataURItoBlob(data) {
  let byteString
  if (data.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(data.split(',')[1])
  } else {
    byteString = unescape(data.split(',')[1])
  }
  const mimeString = data.split(',')[0].split(':')[1].split(';')[0]
  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], { type: mimeString })
}
