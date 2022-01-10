import App from './App'
import { debuggerModule } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'

// #ifndef VUE3
import Vue from 'vue'

const errorHandler = (err, vm, info) => { 
	if(debuggerModule) 
		debuggerModule.addVueError(err, vm, info);
}
 
Vue.config.errorHandler = errorHandler;  
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif