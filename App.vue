<script>
	import { debuggerModule, installDebugger } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			//这里配置是在调试模式下才开启，您也可以去掉判断，在任何时候都开启
			if(process.env.NODE_ENV === 'development') 
				installDebugger({
					enableRequestInterceptor: true
				});
		},
		onUnhandledRejection: function(err) {
			if(debuggerModule) debuggerModule.addAppErr(err);
		},
		onError: function(err) {  
			if(debuggerModule) debuggerModule.addAppErr(err);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
