import { verifyType, verifySize, commonZipPic } from '@/utils/uploadVerify'
import { Message } from 'element-ui'
import i18n from '@/locales'

const ELE_WEAKMAPS = new WeakMap()

export default {
  bind(el, binding) {
    const {
      fileType = ['png', 'jpg', 'jpeg'], // 文件类型
      fileSize = 5, // 文件最大值
      compLtSize = 0.02, // 触发压缩极限值
      ratio = 0.4, // 压缩比例
      getDragFile = () => {} // 获取拖拽文件
    } = binding.value

    const drapBg = document.createElement('div')

    drapBg.setAttribute('class', 'drap-bg')
    drapBg.innerText = i18n.t('common.drag_file_text')
    el.appendChild(drapBg)

    const elDragenter = () => {
      if (el.dataset.disabled !== 'true') {
        el.classList.add('drag-active')
      }
    }

    const drapBgDragleave = () => {
      el.classList.remove('drag-active')
    }

    const elDragover = event => {
      event.preventDefault()
    }

    const drapBgDrop = async event => {
      event.preventDefault()
      el.classList.remove('drag-active')

      if (el.dataset.disabled !== 'true') {
        // 获取图片文件
        const files = event.dataTransfer.files
        if (el.dataset.isCustom === 'true') {
          // 获取文件
          getDragFile(files)
        } else {
          if (files && files.length > 0) {
            if (files.length > 1) {
              Message({
                type: 'error',
                message: i18n.t('common.upload_file_limit_tip')
              })
              return false
            }

            let file = files[0]

            // 校验格式
            if (!verifyType(file, fileType)) return false

            // 校验大小
            if (!verifySize(file, fileSize)) return false

            // 是否压缩
            const isLt2M = file.size / 1024 / 1024 >= compLtSize
            if (isLt2M) {
              file = await commonZipPic(file, ratio)
            }

            // 获取文件
            getDragFile(file)
          }
        }
      }
    }

    // 当被鼠标拖动的对象进入其容器范围内时触发此事件,event.target为当前dom元素
    el.addEventListener('dragenter', elDragenter)
    // 当被鼠标拖动的对象离开其容器范围内时触发此事件
    drapBg.addEventListener('dragleave', drapBgDragleave)
    el.addEventListener('dragover', elDragover)
    drapBg.addEventListener('drop', drapBgDrop)

    ELE_WEAKMAPS.set(el, {
      elDragenter,
      drapBgDragleave,
      elDragover,
      drapBgDrop,
      drapBg
    })
  },
  unbind(el, binding) {
    if (ELE_WEAKMAPS.has(el)) {
      let { elDragenter, drapBgDragleave, elDragover, drapBgDrop, drapBg } = ELE_WEAKMAPS.get(el)
      // 移除事件
      el.removeEventListener('dragenter', elDragenter)
      drapBg.removeEventListener('dragleave', drapBgDragleave)
      el.removeEventListener('dragover', elDragover)
      drapBg.removeEventListener('drop', drapBgDrop)
      // 移除dom
      el.removeChild(drapBg)
      ELE_WEAKMAPS.delete(el)
      drapBg = null
      el = null
    }
  }
}
