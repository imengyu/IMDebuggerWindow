<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
			
		</view>
		<view>
			<button @click="testLog">测试输出日志</button>
			<button @click="testRequest">测试网络请求</button>
			<button @click="testError">测试报错日志</button>
			<button @click="testStorage">测试storage</button>
			<button @click="showDebuggerWindow=true">以组件模式弹出调试窗口</button>
		</view>
		
		<debuggerBox v-if="showDebuggerWindow" @close="showDebuggerWindow=false" />
	</view>
</template>

<script>
	import debuggerBox from '@/uni_modules/imengyu-IMDebuggerWindow/pages/components/debuggerBox.vue'
	export default {
		components: {
			debuggerBox
		},
		data() {
			return {
				title: 'Hello',
				showDebuggerWindow: false,
			}
		},
		onLoad() {

		},
		methods: {
			testLog() {
				console.log('这是测试日志输出');
				console.info('这是测试日志输出 console.info');
				console.warn('这是测试日志输出 console.warn');
				console.error('这是测试日志输出 console.error');
				console.log('测试日志输出对象');
				console.log(true);
				console.log(13.5);
				console.log({
					test1: true,
					test2: 0.4,
					test3: 'hhhhhh',
					testJson: 'testJson',
					testJsonChild: {
						code: 200,
						message: "success",
						status: true,
					},
				});
				console.log(this.testError);
			},
			testRequest() {
				uni.request({
					url: 'https://www.fastmock.site/mock/1edf6f91ca8d445522154c4fd8fd489b/super-test/api/test'
				})
			},
			testError() {
				new Promise((resolve, reject) => {
					reject('Test reject');
				})
				hhhhh.afsafa();
			},
			testStorage() {
				uni.setStorageSync('test1', {
					"id": 1,
					"user_name": "guojing",
					"name": "郭靖",
					"avatar": "https://pic.qqtn.com/up/2017-11/2017112817293589289.jpg",
					"emp_id": "9527",
					"status": 1,
					"created_at": null,
					"updated_at": "2021-10-29T02:39:37.000000Z"
				});
				
				uni.setStorageSync('test2', "user_name:12345");
				uni.setStorageSync('test3', JSON.stringify({
						"user_name": "guojing",
						"avatar": "https://pic.qqtn.com/up/2017-11/2017112817293589289.jpg",
						"emp_id": "9527",
						"status": 1,
				}));
			},
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
