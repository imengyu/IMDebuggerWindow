<template>
	<view class="item">
		<view :class="'head '+statusClass" @click="expand=!expand">
			<text :class="'status '+statusClass">{{data.info.status}}</text>
			<text class="expand">{{expand?'▼ ':'▶ '}}</text>
			<text class="text">{{data.info.method}}</text>
			<text class="text" style="max-width:730rpx">{{data.info.url}}</text>
		</view>
		<view v-if="expand" class="expand-area">
			<view class="sitem line">
				<text class="text">Url: </text>
				<text class="value">{{data.info.url}}</text>
			</view>
			<view class="sitem line">
				<text class="text">SourceUrl: </text>
				<text class="value">{{data.info.sourceUrl}}</text>
			</view>
			<view class="sitem line">
				<text class="text">Method: </text>
				<text class="value">{{data.info.method}}</text>
			</view>
			<view class="sitem line">
				<text class="text">Status: </text>
				<text class="value">{{data.info.status}}</text>
			</view>
			<view class="sitem">
				<text class="text">Options: </text>
				<jsObjectText :obj="data.options" /> 
			</view>
			<view class="sitem">
				<text class="text">Data: </text>
				<jsObjectText :obj="data.data" />
			</view>
		</view>
	</view>
</template>

<script>
import jsObjectText from './jsObjectText.vue'
export default {
	components: {
		jsObjectText
	},
	props: {
		data: {
			
		}
	},
	methods: {
		
	},
	computed: {
		statusClass() {
			if(this.data.info.status < 300 )
				return 'success';
			if(this.data.info.status < 500)
				return 'warn';
			if(this.data.info.status >= 500)
				return 'error';
			return '';
		},
	},
	data() {
		return {
			expand: false
		}
	},
}
</script>

<style lang="scss" scoped>
.item {
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	justify-content: center;
	border-bottom: 1px solid #f6f6f6;
	width: 750rpx;
	
	.head {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		padding: 8rpx 15rpx;
		
		.text {
			font-size: 25rpx;
			margin-right: 6rpx;
			word-break: break-all;
		}
		
		&.success {
			background-color: #f1ffe5;
			border-bottom-color: #e3ffc2;

			.text {
				color: #5c3c00;
			}
		}		
		&.warn {
			background-color: #fffbe5;
			border-bottom-color: #fff5c2;

			.text {
				color: #295c00;
			}
		}		
		&.error {
			background-color: #fff0f0;
			border-bottom-color: #ffd6d6;

			.text {
				color: #f00;
			}
		}
		
		.expand {
			font-size: 20rpx;
			margin-right: 6rpx;
		}
	}
}
.expand-area {
	padding: 10rpx 0;
}
.sitem {
	display: flex;
	flex-direction: column;
	padding: 0 20rpx;
	
	&.line {
		flex-direction: row;
	}
	
	.text {
		font-size: 25rpx;
	}
	.value {
		margin-left: 10rpx;
		font-size: 25rpx;
		color: #999;
		white-space: nowrap;
	}
}
.status {
	width: 60rpx;
	height: 32rpx;
	border-radius: 6rpx;
	margin-right: 10rpx;
	font-size: 26rpx;
	color: #fff;
	line-height: 32rpx;
	text-align: center;
	
	&.error {
		background-color: #f96800;
	}
	&.warn {
		background-color: #f9c802;
	}
	&.success {
		background-color: #64ca10;
	}
}
</style>
