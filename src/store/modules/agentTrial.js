const agentTrial = {
  namespaced: true,
  state: {
    pptName: '', // 缓存PPT名称，用于查看某个PPT打开面板使用
    IndexedMode: 0, // 索引模式0或1
    IndexedModeLock: false, // 索引模式锁
    pptViewDataList: [], // ppt 查看数据列表
    isPPTOutputDone: false // 轮次会话是否已完成
  },
  mutations: {
    SET_PPT_NAME: (state, value) => {
      state.pptName = value
    },
    SET_INDEXED_MODE: (state, value) => {
      state.IndexedMode = value
    },
    SET_INDEXED_MODE_LOCK: (state, value) => {
      state.IndexedModeLock = value
    },
    SET_PPT_VIEW_DATA_LIST: (state, value) => {
      state.pptViewDataList = value
    },
    UPDATE_PPT_VIEW_DATA_LIST: (state, { index, value }) => {
      state.pptViewDataList.splice(index, 1, value)
    },
    DELETE_PPT_VIEW_DATA_LIST: (state, index) => {
      state.pptViewDataList.splice(index, 1)
    },
    PUSH_PPT_VIEW_DATA_LIST: (state, value) => {
      state.pptViewDataList.push(value)
    },
    SET_PPT_OUTPUT_DONE: (state, value) => {
      state.isPPTOutputDone = value
    }
  },
  actions: {
    resetData({ commit }) {
      commit('SET_PPT_NAME', '')
      commit('SET_INDEXED_MODE', 0)
      commit('SET_INDEXED_MODE_LOCK', false)
      commit('SET_PPT_VIEW_DATA_LIST', [])
    }
  }
}

export default agentTrial
