### 一、安装和使用
#### (一) 安装插件
##### 1. 将代码拷贝到本地
##### 2. 加载扩展程序
 - 在您的浏览器中访问 chrome://extensions（或者单击多功能框最右边的按钮： 打开 Chrome 浏览器菜单，并选择工具(L)菜单下的扩展程序(E)，进入相同的页面）。
    - ![开启开发者工具](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme1.png)
 - 确保右上角开发者模式开关已打开。 
    - ![确保右上角开发者模式复选框已打开。](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme2.png)
 - 点击“加载正在开发的扩展程序”，弹出目录选择对话框。
    - ![加载正在开发的扩展程序](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme3.png)
 - 浏览至代码所在的目录，选择目录下的“Eolink2TsType”文件夹，点击“选择文件夹”按钮(显示如下插件，且没有提示错误，表示插件加载成功)。 
    - ![加载成功](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme4.png)

#### (二) 使用(只需两步)
1. 打开“开发者工具”(F12)，找到并打开“Eolink2TsType”工具面板
    - ![打开EolinkApi2Typescript](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/public/images/popup1.png)
2. 打开Eolink网页页面，点击你要查看了Eolink接口（如已打开，刷新当前Eolink页面即可），Eolink接口页面加载完成后将自动解析。
    - ![接口解析](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/public/images/popup2.png)  

点击相关模块的“复制”按键，即可复制相应内容；点击“全部复制”按键，将复制所有模块内容(调用方法在最后)。 

### 二、更多功能
#### (一) 配置调用方法模板 
> `调用方法模块`旨在生成一个可直接复制使用的调用方法。通过将`调用方法模块`相应关键字进行替换，以生成符合业务场景直接可用的接口方法。

![接口解析](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/01.png)  

1. 点击调用方法折叠块标题左侧的“配置调用方法模板”，即可对方法模板进行管理。
2. 在调用方法模板管理弹窗中，可以对方法模板进行增、删、改及设置默认模板。
3. 方法模板应该是一个字符串，下列以“[]”括起来的关键字将做以下替换：

| 关键字 | 替换内容 |
| --- | --- |
|  [functionName] | 方法名称(通过方法名生成函数控制) |
| [restfulParams] | restful接口入参 |
| [queryParams] | 接口URl入参 |
| [params] | body入参接口名称或类型字符串 |
| [method] | 接口请求方法(默认小写) |
| [url] | 接口路径 |
| [resultType] | 返回参数接口名称 |  

4. 添加模板后，可在调用方法模板，模板选择框，选择想要使用的模板。

#### (二) 解析指定参数 
![解析指定参数](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/02.png) 
1. 对于请求参数和出参，支持解析指定属性(公共属性通过接口继承时或者使用泛型统一时，不需要解析公共参数)。
2. 在请求参入或出参折叠块中的解析属性选择框，可选择解析指定属性。  

#### (三) 将请求参数或返回参数直接插入模板
> 调用方法生成，当请求参数或返回参数个数较少时，一般不需要单独使用接口进行类型声明，可勾选相应选项，将参数直接插入模板。  

![将参数直接插入模板](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/03.png) 


### 三 开发
#### (一) 插件核心实现
1. 使用`chrome.devtools.network.onRequestFinished`监听`Eolink`页面的`api/apiManagementPro/Api/getApi`接口请求，获取接口数据。
2. 通过`window.postMessage`方式进行通知和接口数据传递。
```js
// public/devtools/devtools.js
...
chrome.devtools.panels.create("EolinkApi2TsType",
  "",
  "/devtools/panel.html",
  function (panel) {
    panel.onShown.addListener((win) => {
      win.postMessage('init', '*');

      chrome.devtools.network.onRequestFinished.addListener(
        function (req) {
          if (req.request.method === 'OPTIONS') return false;
          if (/\/api\/apiManagementPro\/Api\/getApi$/.test(req.request.url)) {

            req.getContent((body) => {
              let data = { isEolinkData: true, apiData: {} }
              data.apiData[getFormDataAttrVal(req.request)] = JSON.parse(body)
              win.postMessage(data, '*');
            })
          }
        }
      );
    })
  }
);
```
3. 监听`window.postMessage`对应消息，解析数据，进行转换。
```js
// src/index.tsx
...
window.addEventListener('message', (event) => {
  if (event.data === 'init') {
    return true;
  }
  if (!event.data?.isEolinkData) {
    return false;
  }

  if (!event.data) return false;
  let keys = Object.keys(event.data?.apiData || {})
  updateState && updateState({ ...scopeState, activeKey: keys[0], apiObj: { ...scopeState.apiObj, ...event.data?.apiData } })
})

```

#### (二) 进行插件开发
1. 插件使用`react`+`antd`进行开发。
2. 项目仅仅处理了面板内容的生成，也只需要处理面板相关的内容，其它`chrome`插件的内容放置在`public`目录下，打包时直接拷贝。
3. 为了便于开发，本地开发可直接在浏览器开发，通过执行`window.postMessage`模拟传入数据，步骤：
   -  安装依赖(npm版本：^5.2);
   - 在`webpack.config.js`中注释`mode: 'production'`,取消注释`mode: 'development'`;
   - 执行`npx webpack serve`命令
   - 浏览器打开：http://localhost:9000/devtools/panel.html
   - 在控制台执行`window.postMessage`:
```
// 这里有apiData内可以是你想要调试的接口数据
window.postMessage({
   isEolinkData: true,
    apiData:{2270442: {"type":"api","statusCode":"000000","apiInfo":{"baseInfo":{"apiName":"get\u793a\u4f8b\u63a5\u53e3","apiURI":"\/eolink\/api\/2","apiProtocol":0,"apiSuccessMock":"","apiFailureMock":"","apiRequestType":1,"apiStatus":0,"starred":0,"apiNoteType":1,"apiNoteRaw":"","apiNote":"","apiRequestParamType":2,"apiRequestRaw":"","apiRequestBinary":"","apiFailureStatusCode":"200","apiSuccessStatusCode":"200","apiFailureContentType":"text\/html; charset=UTF-8","apiSuccessContentType":"text\/html; charset=UTF-8","apiRequestParamJsonType":0,"advancedSetting":null,"beforeInject":"","afterInject":"","createTime":"2023-02-04 21:56:45","apiUpdateTime":"2023-04-16 08:09:21","apiTag":"","beforeScriptMode":1,"afterScriptMode":1,"beforeScriptList":[],"afterScriptList":[],"removed":0,"sampleURI":"https:\/\/result.eolink.com","mockCode":"LzVvLBC69cf38a0c32ea26620a97cbd5ecbc0e6e6262cba?uri=\/eolink\/api\/2","apiID":49932125,"groupID":2270442,"groupPath":"2270442","apiRequestMetadata":[],"responseMetadata":[],"responseTrailingMetadata":[],"groupName":"\u9ed8\u8ba4\u5206\u7ec4","apiManagerConnID":388999,"creator":"user_ydtjm6fbq8","updater":"user_ydtjm6fbq8","apiManager":"user_ydtjm6fbq8"},"responseHeader":[],"headerInfo":[],"authInfo":{"status":"0"},"requestInfo":[{"paramNotNull":"0","paramType":"0","paramName":"\u540d\u79f0","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","childList":[]},{"paramNotNull":"0","paramType":"14","paramName":"\u5e74\u9f84","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"age","paramValue":"","childList":[]}],"urlParam":[],"restfulParam":[],"resultInfo":[{"responseID":9681714,"responseCode":"200","responseName":"\u6210\u529f","responseType":0,"paramJsonType":0,"paramList":[{"paramNotNull":"0","paramType":"0","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"code","paramValue":"","paramMock":"@natural(1,100)","childList":[]},{"paramNotNull":"0","paramType":"8","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"success","paramValue":"","childList":[]},{"paramNotNull":"0","paramType":"13","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"data","paramValue":"","childList":[{"paramNotNull":"0","paramType":"0","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","paramMock":"@ctitle","childList":[]},{"paramNotNull":"0","paramType":"10","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"age","paramValue":"","childList":[]},{"paramNotNull":"0","paramType":"12","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"hobby","paramValue":"","childList":[{"paramNotNull":"0","paramType":"0","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","paramMock":"@ctitle","childList":[]},{"paramNotNull":"0","paramType":"10","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"duration","paramValue":"","childList":[]},{"paramNotNull":"0","paramType":"0","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"level","paramValue":"","childList":[]}]},{"paramNotNull":"0","paramType":"12","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"attributes","paramValue":"","childList":[{"structureID":"1400439","updateData":[],"childList":[]},{"paramNotNull":"0","paramType":"12","paramName":"\u6bd5\u4e1a\u5b66\u6821","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"school","paramValue":"","childList":[{"structureID":"1400440","updateData":[],"childList":[]}]}]}]},{"paramNotNull":"0","paramType":"12","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"relations","paramValue":"","childList":[{"structureID":"1400443","updateData":[],"childList":[]}]}],"raw":"","binary":"","isDefault":1}],"resultParamJsonType":0,"resultParamType":0,"fileID":"","requestParamSetting":{},"resultParamSetting":{},"customInfo":{"messageEncoding":"utf-8"},"soapVersion":null,"version":1040,"tagID":[],"wsdlContent":"","testData":"","defaultResponseID":9681714,"mockList":[{"name":"\u7cfb\u7edf\u9ed8\u8ba4\u671f\u671b","source":"\u9ad8\u7ea7Mock","url":"\/LzVvLBC69cf38a0c32ea26620a97cbd5ecbc0e6e6262cba\/eolink\/api\/2","mockServer":"https:\/\/mockapi.eolink.com"},{"name":"\u6210\u529f(200)","source":"\u63a5\u53e3\u8fd4\u56de","url":"\/LzVvLBC69cf38a0c32ea26620a97cbd5ecbc0e6e6262cba\/eolink\/api\/2?responseId=9681714","mockServer":"https:\/\/mockapi.eolink.com"}],"apiType":"http","dbFieldObj":{},"manager":"user_ydtjm6fbq8","creator":"user_ydtjm6fbq8","updater":"user_ydtjm6fbq8","noticeType":0,"fileList":[],"dataStructureList":{"1400439":{"structureID":1400439,"structureName":"attributes","structureDesc":"\u4e2a\u4eba\u5c5e\u6027","updateTime":"2023-02-05 08:41:33","structureData":[{"paramNotNull":"0","paramType":"14","paramName":"\u4f53\u91cd","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"weight","paramValue":"","childList":[],"paramID":"60368c8e-7ef6-43fd-8ea1-93a67b9624ab"},{"paramNotNull":"0","paramType":"14","paramName":"\u8eab\u9ad8","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"height","paramValue":"","childList":[],"paramID":"6c833f01-c564-49f2-8181-d45623a92964"}],"structureType":"15","removed":0,"paramStructIdList":[]},"1400440":{"structureID":1400440,"structureName":"school","structureDesc":"\u6bd5\u4e1a\u5b66\u6821","updateTime":"2023-02-05 08:44:00","structureData":[{"paramNotNull":"0","paramType":"0","paramName":"\u5b66\u672f\u540d\u79f0","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","paramID":"a2e198e4-a6e5-4915-ba7e-515babcaae56"},{"paramNotNull":"0","paramType":"0","paramName":"\u6bd5\u4e1a\u8bc1\u4e66","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"dgree","paramValue":"","paramID":"c26eca5e-22f2-436d-8ec7-0cb422ca37f4"},{"paramNotNull":"0","paramType":"7","paramName":"\u6bd5\u4e1a\u65f6\u95f4","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"dgreedate","paramValue":"","paramID":"7357acc4-84e3-49cd-bbda-363d91c8c007"}],"structureType":"15","removed":0,"paramStructIdList":[]},"1400443":{"structureID":1400443,"structureName":"relations","structureDesc":"\u5173\u7cfb","updateTime":"2023-02-05 09:12:35","structureData":[{"paramNotNull":"0","paramType":"0","paramName":"\u5173\u7cfb\u4eba\u540d\u79f0","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","paramID":"a3286aa0-c4f5-4136-899d-74f5accd6d7e"},{"paramNotNull":"0","paramType":"0","paramName":"\u5173\u7cfb","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"relation","paramValue":"","paramID":"c9c43d8b-81d9-4252-915b-21db2cf097cd"},{"paramNotNull":"0","paramType":"12","paramName":"","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"relationSchool","paramValue":"","childList":[{"paramNotNull":"0","paramType":"0","paramName":"\u5b66\u672f\u540d\u79f0","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"name","paramValue":"","paramID":"a2e198e4-a6e5-4915-ba7e-515babcaae56"},{"paramNotNull":"0","paramType":"0","paramName":"\u6bd5\u4e1a\u8bc1\u4e66","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"dgree","paramValue":"","paramID":"c26eca5e-22f2-436d-8ec7-0cb422ca37f4"},{"paramNotNull":"0","paramType":"7","paramName":"\u6bd5\u4e1a\u65f6\u95f4","paramLimit":"","paramNote":"","paramValueList":[],"default":0,"paramKey":"dgreedate","paramValue":"","paramID":"7357acc4-84e3-49cd-bbda-363d91c8c007"}],"paramID":"35188289-73a4-491f-9a1c-8b99fd68c483"}],"structureType":"15","removed":0,"paramStructIdList":[]}}},"hasUnreadComment":0}
}})
```
4. 开发完成后打包测试步骤：
   - 在`webpack.config.js`中取消注释`mode: 'production'`,注释`mode: 'development'`;
   - 执行`npx webpack`进行打开
   - 在`chrome`中按照[安装插件](https://gitee.com/FattyShu/eolink-api-2-ts-type/tree/39a91a30fed2710163e616892a39995fe527609a/#%E4%B8%80-%E5%AE%89%E8%A3%85%E6%8F%92%E4%BB%B6)步骤进行插件添加。如已安装关闭再打开一次开发者工具后，插件就会更新。  

##### 项目目录说明
```
// 项目目录文件简单说明
├─Eolink2TsType                     // 插件打包生成目录  
├─images                            // readme文档相关图片
├─public                            // 公共目录，目录下相应的代码会直接拷贝到Eolink2TsType目录下                
|  ├─devtools                       // chrome插件devtools_page配置的目录
|  ├─images                         // 插件icon及popup弹窗图片
|  ├─popup                          // chrome插件popup页面--仅有一个简单的使用说明
|  ├─manifest.json                  // chrome插件配置入口文件
├─src                               // panel页面的的源代码目录
|  ├─components                     // 接口通用类型
|  |  ├─api-fun-template            // 调用方法模板管理组件
|  |  ├─api-function-collapse.tsx   // 调用方法折叠块
|  |  ├─panel-content.tsx           // 出参入参具体代码
|  |  ├─params-collapse.tsx         // 出参入参折叠块
|  ├─hooks     
|  |  ├─params-filter.tsx           // 解析指定参数,选择过滤处理hooks
|  |  ├─table-data-maintain.tsx     // 一个维护(更新、设置默认)本地表格(key,name,content)数据的hooks                    
|  ├─index.tsx                      // 整个panel.js的入口，监听消息、维护tab和所有api数据
|  ├─model.ts                       // 相关类型及公共map值的声明
|  ├─panel.html                     // 模板文件
|  ├─tab-content.tsx                // 接口tab内容
|  ├─utils.ts                       // 相关工具方法
├─webpack.config.js                 // 打包配置
```


### 其它
 - 解析发生的错误，可点击最下方的显示原始数据，然后复制，发送到作者邮箱(q473658336@163.com)或者提issue进行反馈。
 - 如果有任何建议，也可使用上述方式反馈； 
### 最后
欢迎关注我的公众号进行交流。  
![communicate.png](https://note.youdao.com/yws/api/personal/file/WEB3b96590e70726ee84723bb9e5c7920af?method=download&shareKey=b789853015cf159143b6250e24bc49fd)