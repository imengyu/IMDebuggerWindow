let view;
let app = null;

function getAppWrap() {
	if(app == null)
		app = getApp();
	return app;
} 

function init() {
	const app = getAppWrap();
	app.globalData.debuggerLogData = [];
	app.globalData.debuggerNetworkLogData = [];
	app.globalData.debuggerErrLogData = [];
	
	uni.$on('debugger-view-closed', () => {
		view.show();
	});
	uni.$on('debugger-view-opened', () => {
		view.hide();
	});
	uni.$on('debugger-view-close', () => {
		view.close();
	});
}

//======================
//调试器使用方法

function addNetworkLog(info, options, data) {
	const app = getAppWrap();
	if(app.globalData.debuggerNetworkLogData.length > 512)
		app.globalData.debuggerNetworkLogData.shift();
	app.globalData.debuggerNetworkLogData.push({ info, options, data });
	uni.$emit('debugger-refresh-network');
}
function addAppErr(err) {
	const app = getAppWrap();
	if(app.globalData.debuggerErrLogData.length > 128)
		app.globalData.debuggerErrLogData.shift();
	app.globalData.debuggerErrLogData.push({ err: err.toString(), stack: err.stack });
	uni.$emit('debugger-refresh-app-err');
}
function addVueError(err, vm, info) {
	const app = getAppWrap();
	if(app.globalData.debuggerErrLogData.length > 128)
		app.globalData.debuggerErrLogData.shift();		
	app.globalData.debuggerErrLogData.push({ err: err.toString(), stack: err.stack + '\n' + info });
	uni.$emit('debugger-refresh-vue-err');
}
function addLog(info) {
	const app = getAppWrap();
	let removeFirst = false;
	if(app.globalData.debuggerLogData.length > 768) {
		app.globalData.debuggerLogData.shift();	
		removeFirst = true;
	}
	app.globalData.debuggerLogData.push(info);
	uni.$emit('debugger-refresh-log', removeFirst);
}

export const debuggerModule = {
	addNetworkLog,
	addAppErr,
	addVueError,
	addLog,
};

//======================
//调试器初始化方法

function pad(num, n) {
  let strNum = num.toString();
  let len = strNum.length;
  while (len < n) {
    strNum = "0" + strNum;
    len++;
  }
  return strNum;
}
function getNowTimeString() {
	const d = new Date();
	return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
}
function installConsoleHook() {
	console.log('installConsoleHook');
	
	if(debuggerModule) {
		let console_log = console.log
		let console_error = console.error
		let console_info = console.info
		let console_warn = console.warn
		
		console.log = function(...arg) {
			debuggerModule.addLog({ time: getNowTimeString(), type: 'log', objects: arg });
			console_log(...arg)
		}
		console.error = function(...arg) {
			debuggerModule.addLog({ time: getNowTimeString(), type: 'error', objects: arg });
			console_error(...arg)
		}
		console.info = function(...arg) {
			debuggerModule.addLog({ time: getNowTimeString(), type: 'info', objects: arg });
			console_info(...arg)
		}
		console.warn = function(...arg) {
			debuggerModule.addLog({ time: getNowTimeString(), type: 'warn', objects: arg });
			console_warn(...arg)
		}
	}
}
function installRequestHook() {
	/* 拦截请求 */
	uni.addInterceptor('request', {
		invoke(args) {
			// request 触发前拼接 url 
			const addInterceptorRequestData = {
				data: args.data,
				method: args.method || 'GET',
				sourceUrl: args.url,
				url: args.url,
				status: 0,
			}
			let _complete = args.complete;
			args.complete = function(e) {
				_complete && _complete(e)
				addInterceptorRequestData.status = e.statusCode
				addNetworkLog(
					addInterceptorRequestData, 
					args,
					e.data
				);
			}
		},
	})
}

function createView() {
	const ss = uni.getStorageSync('noNorDebuggerFloating');
	if(ss == 'yes')
		return;
		
// #ifdef APP-PLUS
	let page = {}, onType = false
	view = new plus.nativeObj.View('HF', {
		bottom: '0px',
		left: '60%',
		height: '40px',
		width: '40px',
	});
	view.drawRect({
		color: '#FF4A46',
		radius: '20px'
	}, {
		top: '0px',
		left: '0px',
		width: '100%',
		height: '100%'
	});
	view.drawText('调试', {
		top: '0px',
		left: '0px',
		width: '100%',
		height: '100%'
	}, {
		size: '16px',
		color: '#FFFFFF'
	});
	view.addEventListener("touchstart", (touch) => {
		page = touch
	})
	view.addEventListener("touchmove", (touch) => {
		if ((touch.pageY - 20 > 0 && touch.pageX - 50 > 0) 
			&& (Math.abs(touch.pageX - page.pageX) > 20 
			|| Math.abs(touch.pageY - page.pageY) > 20)) {
			view.setStyle({
				top: (touch.pageY - 20) + 'px',
				left: (touch.pageX - 50) + 'px'
			})
			onType = true
		} else {
			onType = false
		}
	})
	view.addEventListener("click", (e) => {
		!onType && showDebuggerWindow()
	})
	view.show();
	view.setStyle({
		top: '500px',
		left: '0px'
	})
// #endif
}

/**
 * 显示调试器窗口
 */
export function showDebuggerWindow() {
	uni.navigateTo({
		url: '/uni_modules/imengyu-IMDebuggerWindow/pages/debugger',
		animationType: 'none',
	})
	view.hide();
}
/**
 * 获取调试器是否已经安装
 */
export function debuggerEnabled() {
	return getApp().globalData._debuggerEnabled;
}
/**
 * 安装调试器
 * @param {type} options 自定义参数
 */
export function installDebugger(options) {
	init();
	if(options.showGlobalFloatWindow)
		createView();
	installConsoleHook();
	if(options.enableRequestInterceptor)
		installRequestHook();
	getApp().globalData._debuggerEnabled = true;
}