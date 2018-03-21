# 注意事项
* **引用jsbridge的js文件时需要放置在埋点tracking之前**
* js发布至opads CMS服务提供的CDN下，拥有可解读的文件地址

```javascript
<script type="text/javascript">
  var _tqbTracking = _tqbTracking || {};
  /*该type值需要和大数据确认，比如 70是H5营销*/
  _tqbTracking.logType = 70;
</script>
/*引用jsbridge的js文件时需要放置在埋点tracking之前*/
<script src="//nres.ffan.com/autoTrace/0.0.3/autotrace.min.js">
```

# 埋点业务
* **页面PV，UV:**

```html
<body tracking-load="XXXXXXXX">
</body>
```

* **点击事件追踪:**

```javascript
window.tracking('XXXXXXXX');
```
* **检查埋点是否成功:**

抓包页面会发出类似请求：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content={"event_log":[{"event_time":"2016-11-24 10:15:52","promotion_from":"","event_id":"H5_1111_QCZDY","user_id":""}],"u_uid":"9bcdeb6f-875f-4291-8138-ffe34ec53ebe","browser_type":"webKit","os_version":"other","browser_ver":"5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36"}&type=70
```

# 无埋点  
### 无埋点type: 
1.  41 (H5)
2.  11 (Native) 

### 参数说明：  
event_id：页面url  
pre_page：前置页面  
pre_show_page：H5同前置页面  
control_title：页面title  
event：page_load(页面加载)、page_show(页面展示)  
show_time：曝光时长  

# 说明
* **埋点&无埋点同时发送**  

### 埋点
1.  TYPE:站内 40/站外 50 
2.  初始化发送：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content={"event_log":[{"plazaId":"1100723","cityId":"310100","event_time":"2017-08-29 04:36:37","promotion_from":"","event_id":"XXXXXXX1","user_id":"","app_bundleid":"com.wanda.app.wanhui","pLoginToken":"0e2a3974295bffbecdc706d83b22e166","mobile":"18610275274","wdId":"bf372487e172514e17931498d523b81e","fspmid":"notSet","app_version":"421000000","puid":"EBCCB38F31C2458B834F08F5A8F38531","imei":"f45dc0d9eab947d88388f517c992596b2c325733","loginToken":"a50458beab8438c6681c0b7a58045637","uid":"15000000000989956","app_type":"Android","pre_page":"notSet","ddId":"f45dc0d9eab947d88388f517c992596b2c325733"}],"app_version":"421000000","appkey":"H5"}&type=40
```

3.  如引入JsBridge则使用引入的JsBridge，若无引入JsBridge则执行脚本自带的JsBridge
4.  JsBridge ready后补充完数据发送：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content={"event_log":[{"plazaId":"1100723","cityId":"310100","event_time":"2017-08-29 04:36:37","promotion_from":"","event_id":"XXXXXXX1","user_id":"","app_bundleid":"com.wanda.app.wanhui","pLoginToken":"0e2a3974295bffbecdc706d83b22e166","mobile":"18610275274","wdId":"bf372487e172514e17931498d523b81e","fspmid":"notSet","app_version":"421000000","puid":"EBCCB38F31C2458B834F08F5A8F38531","imei":"f45dc0d9eab947d88388f517c992596b2c325733","loginToken":"a50458beab8438c6681c0b7a58045637","uid":"15000000000989956","app_type":"Android","pre_page":"notSet","ddId":"f45dc0d9eab947d88388f517c992596b2c325733"}],"app_version":"4.21.0.0","appkey":"H5","device_id":"f45dc0d9eab947d88388f517c992596b2c325733","os_version":"Android6.0"}&type=40
```

5.  无JsBridge则不发送

### 无埋点
1.  TYPE:H5 41
2.  初始化加入队列
3.  如引入JsBridge则使用引入的JsBridge，若无引入JsBridge则执行脚本自带的JsBridge
4.  JsBridge ready后补充完数据发送：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content={"event_log":[{"event_time":"2017-08-29 04:36:37","event":"page_load","event_id":"http://10.156.20.15:3010/?app_bundleid=com.wanda.app.wanhui&pLoginToken=0e2a3974295bffbecdc706d83b22e166&mobile=18610275274&plazaId=1100723&wdId=bf372487e172514e17931498d523b81e&fspmid=notSet&app_version=421000000&puid=EBCCB38F31C2458B834F08F5A8F38531&imei=f45dc0d9eab947d88388f517c992596b2c325733&loginToken=a50458beab8438c6681c0b7a58045637&uid=15000000000989956&app_type=Android&pre_page=notSet&ddId=f45dc0d9eab947d88388f517c992596b2c325733&cityId=310100","pre_page":"0d78f7630cd9a7177b49b4af153968d1","pre_show_page":"","control_title":"autotrace","pre_pagepre_show_page":"0d78f7630cd9a7177b49b4af153968d1"}],"u_uid":"","device_id":"f45dc0d9eab947d88388f517c992596b2c325733","os_version":"Android6.0","app_version":"4.21.0.0","ABType":"A"}&type=41
```

5.  无JsBridge则发送：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content="{"event_log":[{"event_time":"2017-08-29 16:32:27","event":"page_load","event_id":"http://at.local.sit.ffan.com/","pre_page":"","pre_show_page":"","control_title":"autotrace"}],"u_uid":"e9be00b7-eb7b-4ace-8bf1-0147316a81b2"}"&type=41
```

6.  曝光时长：心跳模式，5s请求一次，发送：

```javascript
http://api.sit.ffan.com/ffan/v1/mxlog?content={"event_log":[{"event_time":"2017-08-29T08:32:27.607Z","event":"page_show","event_id":"http://at.local.sit.ffan.com/","show_time":5.003}],"u_uid":"e9be00b7-eb7b-4ace-8bf1-0147316a81b2"}&type=41  
```

# 更新日志  

### v0.0.1
更新时间:2017年9月1日  
1.  整合原页面ABType
2.  整合无埋点系统  

### v0.0.2
更新时间:2017年9月11日  
1.  规范化埋点字段
2.  无埋点APP H5新增location_city_id、location_city_name
3.  为规范化埋点，jsBridge中getDevInfo返回新字段：app_point_version，用作业务埋点和无埋点的app_version
4.  加入自动纠错功能，catch自动执行下一步 直至发送成功

### v0.0.3
更新时间:2017年9月14日  
1.  优化了原先业务埋点错误处理  
2.  BUG Fixed 

 ### v0.0.3.1
更新时间:2017年10月24日  
1.  优化了pre page获取方式  
2.  PRE_PAGE从cookie中删除，改为localstroage存储  