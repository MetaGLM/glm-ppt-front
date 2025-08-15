class AutoScrollClass {
  #currentScrollHeight = 0
  #animationFrameId = null
  #mobileStartX = 0
  #mobileStartY = 0
  #el = null

  _touchstart = () => {}
  _touchmove = () => {}
  _scrollFunc = () => {}

  constructor(el) {
    // el 是string 时目前支持 id
    if (typeof el === 'string') {
      this.#el = document.getElementById(el)
    } else if (el instanceof HTMLElement) {
      this.#el = el
    } else {
      console.error('无法获取到真实dom元素')
    }
  }

  getElement() {
    return this.#el
  }

  /**
   * 处理向上向下滚动业务逻辑
   * @event 事件对象
   * @distance 距离底部多少时触发
   */
  scrollFunc(event, distance) {
    const e = event || window.event
    if (e.wheelDelta) {
      if (e.wheelDelta > 0) {
        // 当鼠标滚轮向上滚动时
        this.closeAutoScroll()
      }
      if (e.wheelDelta < 0) {
        // 当鼠标滚轮向下滚动时
        this.reAutoScrollBottom(distance)
      }
    } else if (e.detail) {
      if (e.detail < 0) {
        // 当鼠标滚轮向上滚动时
        this.closeAutoScroll()
      }
      if (e.detail > 0) {
        // 当鼠标滚轮向下滚动时
        this.reAutoScrollBottom(distance)
      }
    }
  }

  /**
   * 处理向上向下滚动业务逻辑
   * @event 事件对象
   */
  scrollMobileStartFunc(event) {
    this.#mobileStartX = event.changedTouches[0].pageX
    this.#mobileStartY = event.changedTouches[0].pageY
  }

  scrollMobileMoveFunc(event, distance) {
    const moveEndX = event.changedTouches[0].pageX
    const moveEndY = event.changedTouches[0].pageY
    const X = moveEndX - this.#mobileStartX
    const Y = moveEndY - this.#mobileStartY

    if (Math.abs(X) > Math.abs(Y)) {
      if (X > 0) {
        // 向右
      }
      if (X < 0) {
        // 向左
      }
    } else if (Math.abs(X) < Math.abs(Y)) {
      // 认定为垂直方向滑动
      if (Y > 0) {
        // 向下
        this.closeAutoScroll()
      } else if (Y < 0) {
        // 向上
        this.reAutoScrollBottom(distance)
      }
    } else {
      console.log('just touch')
    }
  }

  /**
   * 绑定滚动监听
   */
  listenWheel(mobile = false, distance = 0) {
    const ele = this.getElement()
    if (!ele) return
    if (mobile) {
      this._touchstart = event => {
        this.scrollMobileStartFunc(event)
      }
      this._touchmove = event => {
        this.scrollMobileMoveFunc(event, distance)
      }
      // 针对移动端
      ele.addEventListener('touchstart', this._touchstart)
      ele.addEventListener('touchmove', this._touchmove)
    } else {
      this._scrollFunc = event => {
        this.scrollFunc(event, distance)
      }
      // 针对PC端
      //    给页面绑定鼠标滚轮事件,针对火狐的非标准事件
      ele.addEventListener('DOMMouseScroll', this._scrollFunc)
      //    给页面绑定鼠标滚轮事件，针对Google，mousewheel非标准事件已被弃用，请使用 wheel事件代替
      ele.addEventListener('wheel', this._scrollFunc)
      //    ie不支持wheel事件，若一定要兼容，可使用mousewheel
      ele.addEventListener('mousewheel', this._scrollFunc)
    }
  }

  /**
   * 解绑滚动监听
   */
  removeListenWheel(mobile = false) {
    const ele = this.getElement()
    if (!ele) return
    if (mobile) {
      // 针对移动端
      ele.removeEventListener('touchstart', this._touchstart)
      ele.removeEventListener('touchmove', this._touchmove)
      this._touchstart = () => {}
      this._touchmove = () => {}
    } else {
      // 针对PC端
      ele.removeEventListener('DOMMouseScroll', this._scrollFunc)
      ele.removeEventListener('wheel', this._scrollFunc)
      ele.removeEventListener('mousewheel', this._scrollFunc)
      this._scrollFunc = () => {}
    }
  }

  /**
   * 开始向下滚动
   */
  scrollBottom(autoScroll = false) {
    const ele = this.getElement()
    if (!ele) return
    const scrollHeight = ele.scrollHeight
    const clientHeight = ele.clientHeight

    if (scrollHeight > clientHeight && scrollHeight !== this.#currentScrollHeight) {
      // 设置滚动条到最底部
      ele.scrollTop = scrollHeight
      this.#currentScrollHeight = scrollHeight // 记录当前滚动高度，与新值对比，避免重复触发（safari浏览器滚动抖动）
    }

    if (autoScroll) {
      this.#animationFrameId = requestAnimationFrame(() => {
        this.scrollBottom(autoScroll)
      })
    }
  }

  //  重启自动滚动到底部
  reAutoScrollBottom(distance) {
    const ele = this.getElement()
    if (!ele) return
    if (
      !this.#animationFrameId &&
      ele.clientHeight + ele.scrollTop >= ele.scrollHeight - distance
    ) {
      this.scrollBottom(true)
    }
  }

  /**
   * 清除滚动动画
   */
  closeAutoScroll() {
    if (this.#animationFrameId) {
      cancelAnimationFrame(this.#animationFrameId)
      this.#animationFrameId = null
    }
  }

  // 开启
  start({ autoScroll = false, mobile = false, distance = 0 }) {
    this.listenWheel(mobile, distance)
    this.scrollBottom(autoScroll)
  }

  // 重置
  reset({ mobile = false }) {
    this.#mobileStartX = 0
    this.#mobileStartY = 0
    this.closeAutoScroll()
    this.removeListenWheel(mobile)
  }
}

export default AutoScrollClass
