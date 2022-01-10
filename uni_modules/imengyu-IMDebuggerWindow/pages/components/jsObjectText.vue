<template>
	<view class="js-obj">
		<text @click="tryExpandObject" :class="
			'js-obj-text '+ 
			type + (type == 'string'?(' ' + messageType):'')+
			(expandable ? ' expandable': '')+
			(expanded?' expanded':'')"
			:style="{whiteSpace:isKeyObj?'nowrap':'',wordBreak:'break-all'}"
		>{{expandable?(expanded?'▼ ':'▶ '):''}}{{shortObjString}}</text>
		<view v-if="expandObjs && expanded"
			class="js-child-host"
			:style="{
				marginLeft: `-${identWidth}rpx`,
			}">
			<view class="js-child" v-for="(ixx,kxx) in expandObjs" :key="kxx" >
				<text @longpress="onCopy(ixx.key, ixx.obj)" class="js-child-key">{{ixx.key}}: </text>
				<jsObjectText
					:obj="ixx.obj" 
					:isKeyObj="true"
					:identWidth="ixx.key.length*12"
				/>
			</view>
		</view>
	</view>
</template>

<script>
import { setClipboardText } from '../../common/clipboard.js'
export default {
	name: 'jsObjectText',
	props: {
		obj: {
			default: null,
		},
		isKeyObj: {
			type: Boolean,
			default: false,
		},
		messageType: {
			type: String,
			default: '',
		},
		identWidth: {
			type: Number,
			default: 0,
		},
	},
	watch: {
		obj() {
			this.loadObjectInfo();
		},
	},
	methods: {
		onCopy(key, obj) {
			setClipboardText(JSON.stringify(obj));
			uni.showToast({
				icon: 'none',
				title: `已复制字段 ${key} !`,
			})
		},
		tryExpandObject(e) {
			if(this.type == 'object') {
				if(this.expandObjs == null) {
					this.expandObjs = [];
					if(this.obj instanceof Array) {
						for (let i = 0; i < this.obj.length; i++) {
							this.expandObjs.push({
								key: i,
								obj: this.obj[i]
							})
						}
					}
					else {
						for (let key in this.obj) {
							this.expandObjs.push({
								key: key,
								obj: this.obj[key]
							})
						}
					}
					this.expanded = true;
				} else {
					this.expanded = !this.expanded;
				}
				e.stopPropagation();
			}
		},
		loadObjectInfo() {
			const maxPropLen = 30;
			const maxPropStrLen = 10;
			let type = typeof this.obj;
			let finalString = '';
			let finalExpandable = '';
			if(type == 'object') {
				if(this.obj == null) {
					finalString = 'null';
					type = 'null';
					finalExpandable = false;
				} else {
					if(Object.prototype.toString.call(this.obj) == '[object Array]') {
						let str = '[ ';
						for (let i = 0; i < this.obj.length; i++) {
							let item = this.obj[i];
							if(typeof item === 'object')
								str += '{...}'
							else if(typeof item === 'string') {
								if(item.length < maxPropStrLen)
									str += `"${item}"`
								else
									str += `"${item.substr(0, maxPropStrLen)}..."`
							} else 
								str += '' + item;
								
							if(str.length > maxPropLen) {
								if(i < this.obj.length - 1)
									str += ', ...'
								break;
							} else if(i != this.obj.length - 1) {
								str += ','
							}
						}
						finalString = str + ' ]';
					}
					else {
						
						let str = '{ ', i = 0, keys = Object.keys(this.obj);
						for (let i = 0; i < keys.length; i++) {
							const key = keys[i];
							const item = this.obj[key];
							if(typeof item === 'object')
								str += `${key}: {...}`
							else if(typeof item === 'string') {
								if(item.length < maxPropStrLen)
									str += `${key}: '${item}'`
								else
									str += `${key}: '${item.substr(0, maxPropStrLen)}...'`
							} else 
								str += `${key}: ${item}`
								
							if(str.length > maxPropLen) {
								if(i < keys.length - 1)
									str += ', ...'
								break;
							} else if(i != keys.length - 1) {
								str += ','
							}
						}
						finalString = str + ' }';
					}
					this.expandObjs = null;
					finalExpandable = true;
				}
				
			} else if(type == 'number' || type == 'boolean') {
				finalString = this.obj;
				finalExpandable = false;
			} else if(type == 'function') {
				finalString = "f " + this.obj.toString().match(/function\s*([^(]*)\(/)[1] + "()";
				finalExpandable = false;
			} else if(type == 'undefined') {
				finalString = 'undefined';
				finalExpandable = false;
			} else if(type == 'string') {
				finalString = this.isKeyObj ? `"${this.obj}"` : this.obj;
				finalExpandable = false;
			} else {
				finalString = this.obj;
				finalExpandable = false;
			}
			
			this.$nextTick(() => {
				this.type = type;
				this.shortObjString = finalString;
				this.expandable = finalExpandable;
			})
		},
	},
	data() {
		return {
			type: '',
			shortObjString: '',
			expandObjs: null,
			expandable: false,
			expanded: false,
		}
	},
	mounted() {
		this.loadObjectInfo();
	},
}
</script>

<style lang="scss">
.js-obj {
	display: flex;
	flex-direction: column;
}
.js-child-host {
	display: flex;
	flex-direction: column;
	padding-left: 10rpx;
}
.js-child {
	display: flex;
	flex-direction: row;
}
.js-child-key {
	font-size: 30rpx;
	margin-right: 5rpx;
	color: #d10dc1;
}
.js-obj-text {
	font-size: 30rpx;
	flex: 1;
	
	&.expandable {
		background-color: #f0f0f0;
		padding: 2rpx 6rpx;
		border-radius: 4rpx;
		color: #b80aad;
	}
	&.expanded {
		background-color: #fff;
	}
	
	&.object {
		color: #555;
	}
	&.undefined, &.boolean, &.null {
		color: #d10dc1;
	}
	&.number {
		color: #006eff;
	}
	&.string {
		color: #cb0000;
	}
	&.function {
		font-style: italic;
	}
	
	&.error {
		color: #f06806;
	}
	&.info {
		color: #0abbf0;
	}
	&.log {
		color: #555;
	}	
	&.warn {
		color: #f0c723;
	}
}
</style>
