import Vue from 'vue'
import Vuex from 'vuex'
import AgentTrial from './modules/agentTrial'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    AgentTrial
  }
})

export default store
