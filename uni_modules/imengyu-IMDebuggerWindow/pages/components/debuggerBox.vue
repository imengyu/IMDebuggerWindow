<template>
	<view :class="'debugger-box'+(isFromWindow?' window':'')" :style="{top:`${top}px`}">
		<view v-if="!isFromWindow" class="debugger-title">
			<text class="text">调试输出窗口</text>
			<view class="tool">
				<button class="tool-button" style="width:180rpx;" @touchstart="isDragging=true" @touchmove="onDraggingHeight" @touchend="isDragging=false">调整高度</button>
				<button class="close tool-button" @click="$emit('close')">关闭</button>
			</view>
		</view>
		<view :class="'debugger-tab'+(isFromWindow?' full':'')">
			<view class="debugger-tab-tabs">
				<view v-for="(item,index) in tabs" :key="index" :class="'tab'+(tab==item.id?' active':'')" @click="tab=item.id">
					<text class="text">{{item.text}}</text>
				</view>
			</view>
			<view class="debugger-tab-area">
				
				<!--日志页面-->
				<scroll-view v-if="tab=='console'" class="view" :scroll-x="true" :scroll-y="true">
					<view class="head-area">
						<button class="tool-button" @click="onClearLogs">清空</button>
						<text class="head-text" style="margin-left:8rpx">共 {{logList.length}} 条日志, 点击时间可复制信息</text>
					</view>
					<view v-for="(item,index) in logList" :key="index" :class="'console-item '+item.type">
						<text class="time" @click="onCopy(item.str)">{{item.time}}</text>
						<jsObjectText v-for="(ixx,kxx) in item.solvedObjs" :key="kxx" :obj="ixx" :messageType="item.type" style="margin-right:8rpx" />
					</view>
				</scroll-view>
				
				<!--请求页面-->
				<scroll-view v-if="tab=='network'" class="view" :scroll-x="true" :scroll-y="true">
					<view class="head-area">
						<button class="tool-button" @click="onClearNetworkLogs">清空</button>
						<text class="head-text" style="margin-left:8rpx">共 {{networkList.length}} 条请求数据</text>
					</view>
					<requestItem v-for="(item,index) in networkList" :key="index" :data="item" />
				</scroll-view>
				
				<!--错误信息-->
				<scroll-view v-if="tab=='error'" class="view" :scroll-x="true" :scroll-y="true">
					<view class="head-area">
						<button class="tool-button" @click="onClearErrorLogs">清空</button>
						<text class="head-text" style="margin-left:8rpx">共 {{errorList.length}} 条错误信息, 点击圆点可复制信息</text>
					</view>
					<view v-for="(item,index) in errorList" :key="index" :class="'console-item '+item.type">
						<errtItem :data="item">
							<view class="round red" @click.stop="onCopy(item.str)"></view>
						</errtItem>
					</view>
				</scroll-view>
				
				<!--存储-->
				<scroll-view v-if="tab=='storage'" class="view" :scroll-x="true" :scroll-y="true">
					<view class="head-area">
						<button class="tool-button" @click="loadStorageList">刷新</button>
						<button class="tool-button" @click="onClearCache">清空</button>
						<text class="head-text" style="margin-left:8rpx">共 {{storageList.length}} 条数据, 长按键可复制JSON</text>
					</view>
					<view v-for="(item,index) in storageList" :key="index" :class="'console-item '+item.type">
						<text class="time" @longpress="onCopy(item.str)">{{item.key}}</text>
						<jsObjectText :obj="item.obj" />
					</view>
				</scroll-view>
			
				<!--设置-->
				<scroll-view v-if="tab=='set'" class="view">
						
					<button class="tool-button" style="width:400rpx" @click="onCloseToolBar(false)">隐藏悬浮窗(本次)</button>
					<button class="tool-button" style="width:400rpx" @click="onCloseToolBar(true)">隐藏悬浮窗(永久)</button>
					
				</scroll-view>
			
			</view>
		</view>
		
	</view>
</template>

<script>
	import jsObjectText from './jsObjectText.vue'
	import requestItem from './requestItem.vue'
	import errtItem from './errtItem.vue'
	import { setClipboardText } from '../../common/clipboard.js'
	export default {
		data() {
			return {
				tab: 'console',
				tabs: [
					{id:'console', text: 'Console'},
					{id:'network', text: 'Network'},
					{id:'error', text: 'Error'},
					{id:'storage', text: 'Storage'},
					{id:'set', text: 'Settings'},
				],
				logList: [],
				errorList: [],
				networkList: [],
				storageList: [],
				screenHeight: 0,
				isDragging: false,
				top: 200,
			};
		},
		mounted() {
			this.loadLogsList();
			this.loadErrorList();
			this.loadNetworkList();
			this.loadStorageList();
			
			const lastTop = uni.getStorageSync('im-debuggerFloatingTop');
			const that = this;
			
			if(!this.isFromWindow && lastTop != "")
				this.top = parseInt(lastTop);
			else
				this.top = 0;
			
			uni.getSystemInfo({
				success(res) {
					that.screenHeight = res.screenHeight;
				}
			})
			uni.$emit('debugger-view-opened');
			uni.$on('debugger-refresh-network', () => {
				const arr = getApp().globalData.debuggerNetworkLogData;
				this.networkList.push(arr[arr.length - 1]);
			});
			uni.$on('debugger-refresh-app-err', () => this.loadErrorList());
			uni.$on('debugger-refresh-vue-err', () => this.loadErrorList());
			uni.$on('debugger-refresh-log', (removeFirst) => {
				const arr = getApp().globalData.debuggerLogData;
				if(removeFirst)
					this.logList.unshift();
				this.logList.push(this.solveLogItem(arr[arr.length - 1]));
			});
		},
		beforeDestroy() {
			uni.setStorageSync('im-debuggerFloatingTop', '' + this.top);
			uni.$emit('debugger-view-closed');
			uni.$off('debugger-refresh-network');
			uni.$off('debugger-refresh-app-err');
			uni.$off('debugger-refresh-vue-err');
			uni.$off('debugger-refresh-log');
		},
		components: {
			jsObjectText,
			requestItem,
			errtItem,
		},
		props: {
			isFromWindow: {
				type: Boolean,
				default: false,
			}
		},
		methods: {
			stop() {},
			solveLogItem(k) {
				if(!k || !k.objects)
					return '';
				
				const solve = (str) => {
					const finalArr = [];
					let next_speical = '';
					
					const str_arr = str.split('---');
					for(let i = 0; i < str_arr.length; i++) {
						const str_item = str_arr[i];
						if(str_item == 'UNDEFINED') {
							finalArr.push(undefined);
						} else if(str_item.indexOf('BEGIN:') == 0) {
							next_speical = str_item.substr(6);
						} else if(str_item.indexOf('END:') == 0) {
							if(next_speical == str_item.substr(4)) {
								next_speical = '';
							}
						} else {
							switch(next_speical) {
								case 'BOOLEAN':
									finalArr.push(new Boolean(str_item) ? true : false);
									break;
								case 'NUMBER':
									finalArr.push(parseFloat(str_item));
									break;
								case 'JSON':
									finalArr.push(JSON.parse(str_item));
									break;
								default:
									finalArr.push(str_item);
									break;
							}
						}
					}
					return finalArr
				};
				
				k.str = k.objects.toString();
				const obj_arr = k.str.split('---COMMA---');
				if(obj_arr.length > 1) {
					k.solvedObjs = [];
					for (let i = 0; i < obj_arr.length; i++) 
						solve(obj_arr[i]).forEach(l => k.solvedObjs.push(l))
				}
				else k.solvedObjs = [ ...solve(obj_arr[0]) ];
				return k;
			},
			loadLogsList() { 
				const data = getApp().globalData.debuggerLogData; 
				data.forEach((k) => this.solveLogItem(k))
				this.logList = data;
			},
			loadErrorList() { this.errorList = getApp().globalData.debuggerErrLogData; },
			loadNetworkList() { this.networkList = getApp().globalData.debuggerNetworkLogData; },
			loadStorageList() { 
				const that = this;
				this.storageList = []; 
				uni.getStorageInfo({
					success(res) {
						res.keys.forEach(item => {
							that.storageList.push({
								key: item,
								obj: uni.getStorageSync(item)
							})
						})
					}
				})
			},
			
			onDraggingHeight(e) {
				if(e.touches.length > 0) {
					let top = e.touches[0].clientY - 40;
					if(top > this.screenHeight - 200)
						top = this.screenHeight - 200;
					if(top < 0)  
						top = 0;
					this.top = top;
				}
				e.stopPropagation();
			},
			onClearNetworkLogs() {
				getApp().globalData.debuggerNetworkLogData = [];
				this.networkList = [];
			},
			onClearErrorLogs() {
				getApp().globalData.debuggerErrLogData = [];
				this.errorList = [];
			},
			onClearLogs() {
				getApp().globalData.debuggerLogData = [];
				this.logList = [];
			},
			onCloseToolBar(forever) {
				if(forever) {
					uni.showModal({
						title: '提示',
						content: '是否要隐藏调试悬浮窗? 永久隐藏后，可以卸载再安装以显示悬浮窗',
						success(res) {
							if(res.confirm) {
								uni.setStorageSync('im-noNorDebuggerFloating', 'yes')
								uni.$emit('debugger-view-close');
								uni.navigateBack()
							}
						},
					})
				} else {
					uni.$emit('debugger-view-close');
					uni.navigateBack()
				}
			},
			onClearCache() {
				const that = this;
				uni.showModal({
					title: '提示',
					content: '是否要清除缓存?',
					success(res) {
						if(res.confirm) {
							uni.clearStorageSync();
							uni.showToast({
								icon: 'success',
								title: '已清除!',
							});
							that.loadStorageList();
						}
					},
				})
			},
			onCopy(str) {
				setClipboardText(str);
				uni.showToast({
					icon: 'none',
					title: '已复制!',
				})
			},
		},
	}
</script>

<style lang="scss">
.debugger-box {
	display: flex;
	flex-direction: column;
	border-top: 1px solid #f6f6f6;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	
	&.window {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}
}
.debugger-title {
	display: flex;
	width: 750rpx;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 2px 15rpx;
	height: 80rpx;
	border-bottom: 1px solid #f6f6f6;
	
	> .text {
		font-size: 40rpx;
		font-weight: bold;
		color: #333232;
	}
	
	.tool {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
}
.debugger-tab {
	position: absolute;
	top: 80rpx;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	
	&.full {
		top: 0;
	}
}
.debugger-tab-tabs {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	border-bottom: 1px solid #f6f6f6;
	height: 70rpx;
	
	.tab {
		padding: 6rpx 12rpx;
		border-right: 1px solid #f1f1f1;
		
		&.active {
			.text {
				font-weight: bold;
				color: #007AFF;
			}
		}
		
		.text {
			font-size: 34rpx;
		}
	}
	
}
.debugger-tab-area {
	position: absolute;
	top: 70rpx;
	right: 0;
	bottom: 0;
	left: 0;
	
	.view {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
}

.head-area {
	display: flex;
	padding: 10rpx;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}
.head-text {
	font-size: 28rpx;
}
.tool-button {
	width: 130rpx;
	height: 60rpx;
	font-size: 26rpx;
	margin-left: 10rpx;
}
.console-item {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	border-bottom: 1px solid #f6f6f6;
	padding: 0rpx 10rpx;
	
	.time {
		font-size: 30rpx;
		color: #999;
		margin-right: 10rpx;
	}
}
.round {
	width: 32rpx;
	height: 32rpx;
	border-radius: 16rpx;
	margin-right: 10rpx;
	
	&.red, &.error {
		background-color: #f96800;
	}
	&.warning {
		background-color: #f9c802;
	}
	&.success {
		background-color: #64ca10;
	}
}
</style>
