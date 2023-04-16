### 一、安装和使用
#### (一) 安装插件
##### 1. 将代码拷贝到本地
##### 2. 加载扩展程序
 - 在您的浏览器中访问 chrome://extensions（或者单击多功能框最右边的按钮： 打开 Chrome 浏览器菜单，并选择工具(L)菜单下的扩展程序(E)，进入相同的页面）。
    - ![开启开发者工具](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme1.png)
 - 确保右上角开发者模式复选框已打开。 
    - ![确保右上角开发者模式复选框已打开。](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme2.png)
 - 单击“加载正在开发的扩展程序”，弹出文件选择对话框。
    - ![加载正在开发的扩展程序](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme3.png)
 - 浏览至代码所在的目录，选择目录下的“Eolink2TsType”，点击“选择文件夹”按钮(显示如下插件，并且没有提示错误，表示插件加载成功)。 
    - ![加载成功](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/readme4.png)

#### (一) 使用插件(只需两步)
1. 打开“开发者工具”(F12)，找到并打开“Eolink2TsType”工具面板
    - ![打开EolinkApi2Typescript](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/public/images/popup1.png)
2. 打开Eolink网页页面，点击你要查看了Eolink接口，Eolink接口页面加载完成后将自动解析。
    - ![接口解析](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/public/images/popup2.png)  

点击相关模块的“复制”按键，即可复制相应内容；点击“全部复制”按键，将复制所有模块内容(调用方法在最后)。 

### 二、更多功能
#### (一) 配置调用方法模板 
> 调用方法模块意在生成一个可直接复制使用的调用方法，通用配置调用方法模板，将相应关键字进行替换，以生成符合项目的接口方法。

![接口解析](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/01.png)  

1. 点击调用方法块左侧的“配置调用方法模板”，即可对方法模板进行管理。
2. 在调用方法模板管理弹窗中，可以对方法模板进行增、删、改及设置默认模板。
3. 方法模板应该是一个字符串，以下以“[]”括起来的关键字将做以下替换：

| 关键字 | 替换内容 |
| --- | --- |
|  [functionName] | 方法名称(通过方法名生成函数控制) |
| [restfulParams] | restful接口入参 |
| [params] | body入参接口名称或类型字符串 |
| [method] | 接口请求方法(默认小写) |
| [url] | 接口路径 |
| [resultType] | 返回参数接口名称 |  

4. 添加模板后，可在调用方法模板，模板选择框，选择想要使用的模板。

#### (二) 解析指定参数 
![解析指定参数](https://gitee.com/FattyShu/eolink-api-2-ts-type/raw/master/images/02.png) 
1. 请求参数和出参，支持解析指定属性(公共属性通过接口继承时或者泛型统一时，可以不解析公共参数)。
2. 在请求参入或出参模式的，解析属性下拉框，可选择解析指定属性。  




### 其它
 - 解析发生的错误，可点击最下方的显示原始数据，然后复制，发送到作者邮箱(q473658336@163.com)或者提issue进行反馈。
 - 如果有任何建议，也可使用上述方式反馈； 
### 最后
欢迎关注我的公众号进行交流。  
![communicate.png](https://note.youdao.com/yws/api/personal/file/WEB3b96590e70726ee84723bb9e5c7920af?method=download&shareKey=b789853015cf159143b6250e24bc49fd)