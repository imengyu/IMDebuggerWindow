<template>
	<view class="item">
		<view class="head" @click="expand=!expand">
			<text class="expand">{{expand?'▼ ':'▶ '}}</text>
			<slot></slot>
			<text class="text">{{data.err}}</text>
		</view>
		<view v-if="expand" class="expand-area">
			<text class="text">{{data.stack}}</text>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		data: {}
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
		background-color: #fff0f0;
		border-bottom-color: #ffd6d6;
		
		.text {
			color: #f00;
			font-size: 25rpx;
			margin-right: 6rpx;
			word-break: break-all;
		}
		
		
		.expand {
			font-size: 20rpx;
			margin-right: 6rpx;
		}
	}
}
.expand-area {
	padding: 10rpx 0;
	
	.text {
		font-size: 25rpx;
		word-break: break-all;
	}
}
</style>
