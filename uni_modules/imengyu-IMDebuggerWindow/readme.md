# IMDebuggerWindow

一款调试工具，方便您在APP上无法连接电脑时查看Console，网络请求，报错，Storage。

## 安装

导入插件后，请在您的代码中安装，让 IMDebuggerWindow 正常运行。

1. 在 `pages.json` 中添加页面：

```json
{
  "pages": [
    ...,
    {
      "path": "uni_modules/imengyu-IMDebuggerWindow/pages/debugger",
      "style": {
        "navigationBarTitleText": "调试输出窗口",
        "disableScroll": true,
        "background": "transparent"
      }
    }
  ]
}
```

2. 在 main.js 中安装钩子：

```js
import { debuggerModule } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'

const errorHandler = (err, vm, info) => { 
  if(debuggerModule) debuggerModule.addVueError(err, vm, info);
}
 
Vue.config.errorHandler = errorHandler;  
```

3. 在 App.vue 中安装钩子：

```js
import { debuggerModule, installDebugger } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'
export default {
  onLaunch: function() {
    //这里配置是在调试模式下才开启，您也可以去掉判断，在任何时候都开启
    if(process.env.NODE_ENV === 'development') 
      installDebugger({
        enableRequestInterceptor: false //默认为false，指示是否拦截网络请求，参见下一条
        showGlobalFloatWindow: true //默认为true，指定是否添加一个全局的调试按钮，点击可跳转至窗口
      });
  },
  onUnhandledRejection: function(err) {
    if(debuggerModule) debuggerModule.addAppErr(err);
  },
  onError: function(err) {  
    if(debuggerModule) debuggerModule.addAppErr(err);
  }
}
```

4. 设置自定义网络日志

* 如果您在 installDebugger 中指定了 enableRequestInterceptor: true ，则默认会拦截 uni.request 并将其请求信息输出至窗口。
* 假如您使用第三方请求库进行请求，则无法拦截到请求，您可以在自己的第三方请求库中设置拦截器，然后调用 IMDebuggerWindow 的 addNetworkLog 将其输出至调试窗口。例如下面是axois的拦截器示例：
```js
import { debuggerEnabled, debuggerModule } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'
instance.interceptors.response.use(
  response => {
    if(debuggerEnabled())
      debuggerModule.addNetworkLog({
          url: response.config.url,
          method: response.config.method,
          sourceUrl: response.config.url,
          status: response.status,
        },
        response.config,//请求数据，将显示在Option字段中
        response.data//返回数据，将显示在Data字段中
      )
    return response
  },
  error => {
    if(debuggerEnabled())
      debuggerModule.addAppErr(error) //可输出错误至错误窗口
    return Promise.reject(error.response.status) // 返回接口返回的错误信息
  }
)
```

5. 如果您在 App/H5 模式运行，则会自动在页面上添加一个红色的“调试”按钮，默认位于左下角。假如您运行在小程序或其他平台，则无法自动添加全局按钮。您可以在自己的页面上添加按钮，在按钮中调用 showDebuggerWindow API 来手动显示窗口：
```js
import { showDebuggerWindow } from 'uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js'
onClick() {
  showDebuggerWindow(); //显示调试窗口
}
```

## 组件式调试窗口

默认情况下，uniapp 无法添加一个全局的弹出框，IMDebuggerWindow实现是采用一个全局页面，点击“调试”按钮，会跳转至页面，从而达到显示一个虚假“弹出框”的效果。

这种页面是不能边交互边看日志的，需要返回再打开，很麻烦。

IMDebuggerWindow还有一个组件化调试输出窗口，可以在您的页面上弹出，并可以调整大小，方便您边交互边看日志，示例代码如下：（也可参考示例项目中的示例）

```vue
<template>
  <view class="content">
    <button @click="showDebuggerWindow=true">以组件模式弹出调试窗口</button>
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
        showDebuggerWindow: false,
      }
    },
  }
</script>
```

你可以在自己项目的公共组件中包括上面的调试窗口代码，然后在一个按钮中打开，这样每个页面都可以弹出调试器了。

## API

* `installDebugger(options): void` 安装调试窗口以及拦截器，推荐在 App.vue 中安装。
  * options 参数：
    * `enableRequestInterceptor: boolean` 默认 false, 指示是否拦截uni.request网络请求，为false时需要手动记录网络请求数据。
    * `showGlobalFloatWindow: boolean` 默认为true，指定是否在全局页面左下角添加一个的调试按钮，点击可跳转至窗口
* `showDebuggerWindow(): void` 手动显示调试窗口。
* `debuggerEnabled(): boolean` 获取当前调试窗口是否已经安装
* `debuggerModule` 调试日志模块，包含一些方法可供手动写入日志，如下：
  * `addNetworkLog(info, options, data) : void` 添加网络请求日志。日志显示在 Network 中。
    * info 包含当前请求的信息，调试器窗口中主要显示如下字段：
      * method: string 当前请求的方法
      * sourceUrl: string 当前请求来源URL
      * url: string 当前请求URL
      * status: number  当前请求状态码
    * options 当前请求的参数
    * data 当前请求返回的数据
  * `addAppErr(err : Error) : void` 添加报错日志。日志显示在 Error 中。
  * `addLog(info) : void` 手动添加console日志。
    * info 包含日志信息，调试器窗口中主要显示如下字段：
      * time: string 日志发生时间
      * type: 'log'|'info'|'warn'|'error' 日志等级
      * objects: ...object 这个字段是 console.log(...) 中的参数，调试器会自动解析并显示它。