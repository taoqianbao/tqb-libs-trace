import store from 'store';
import dateFormat from 'dateformat';
import { APIURL } from './config';

import { uniqueU, getBrowserType, detectOS, searchParse, isFfan } from './tool';
import cookie from './cookie';
import jsBridge from '../jsbridge/index'
import {
	assign,
} from '../jsbridge/util';

export { autoTrace };
export { reSendAutoTrace };
export { setAutoTraceSendFlag };
export { atNoBridgeSend };

export default { autoTrace, reSendAutoTrace, setAutoTraceSendFlag, atNoBridgeSend };

var tempParam = {}, sendListArrForAutoTrace = [], atContent = { "event_log": [{}] }, autoTraceSendFlag = false, loadTime;
var prePage = '';

function getPrePage() {
	document.cookie = "PRE_PAGE" + "='';expires=-1;domain='ffan.com';path=/";
	let prePageCookie = localStorage.PRE_PAGE || '';
	localStorage.PRE_PAGE = window.location.href;
	if (prePage) {
		return prePage;
	}
	else if (document.referrer !== '') {
		return document.referrer;
	}
	else {
		return prePageCookie;
	}
}
// 曝光时长
function pageExposure() {
	atContent = { "event_log": [{}] };
	let eventLog = atContent.event_log[0];
	eventLog.event_time = dateFormat(loadTime, "yyyy-mm-dd HH:MM:ss");
	eventLog.event_id = window.location.href;
	eventLog.show_time = (new Date() - loadTime) / 1000;
	eventLog.event = eventLog.show_time <= 2 ? "page_load" : "page_show";// 初次发送page_load，之后每5s发送page_show
	eventLog.pre_page = getPrePage();
	eventLog.pre_show_page = eventLog.pre_page;

	atContent.u_uid = cookie("U_UID");
	atContent.os_version = detectOS();
	atContent = assign({}, atContent, tempParam);
	sendAutoTrace();
	setTimeout(pageExposure, 5000);
};

// 自动发送准备数据
function autoTrace() {
	atContent = { "event_log": [{}] };
	let eventLog = atContent.event_log[0];
	loadTime = new Date();
	eventLog.event_time = dateFormat(loadTime, "yyyy-mm-dd HH:MM:ss");
	eventLog.event = "page_show";// 页面展示
	eventLog.event_id = window.location.href;
	eventLog.pre_page = getPrePage();
	eventLog.pre_show_page = eventLog.pre_page;
	eventLog.control_title = document.title;

	uniqueU();
	atContent.u_uid = cookie("U_UID");
	atContent.os_version = detectOS();

	if (!autoTraceSendFlag) {
		sendListArrForAutoTrace.push(JSON.stringify(atContent));
	}

	//sendAutoTrace();
	pageExposure();
}

//发送
function sendAutoTrace() {
	let type = 41;
	var url = APIURL;
	url += "content=" + encodeURIComponent(JSON.stringify(atContent)) + "&type=" + type;

	if (process.env.DEBUG) {
		console && console.log(url);
		const eleUrl = document.querySelector('#ele-url');
		eleUrl.innerHTML = eleUrl.innerHTML + url + '<br><br/>'
	}

	if (Promise) {
		return new Promise(function (resolve) {
			var oImg = new Image();
			oImg.src = url;
			oImg = null;
			resolve(url);
		})
	}
}

function setAutoTraceSendFlag() {
	autoTraceSendFlag = true;
}

function reSendFun() {
	autoTraceSendFlag = true;
	let type = 41;
	for (var i = 0; i < sendListArrForAutoTrace.length; i++) {
		var url = APIURL;
		sendListArrForAutoTrace[i] = assign({}, JSON.parse(sendListArrForAutoTrace[i]), tempParam);
		if (prePage !== "") {
			sendListArrForAutoTrace[i].event_log[0].pre_page = prePage;
			sendListArrForAutoTrace[i].event_log[0].pre_show_page = prePage;
		}
		url += "content=" + encodeURIComponent(JSON.stringify(sendListArrForAutoTrace[i])) + "&type=" + type;

		if (Promise) {
			return new Promise(function (resolve) {
				var oImg = new Image();
				oImg.src = url;
				oImg = null;
				resolve(url)
			})
		}
	}
}

//jsBridge完毕后补全信息发送
function reSendAutoTrace(sdk) {
	try {
		sendGetDevEncryption(sdk);
	} catch (e) {
		reSendFun();
	}
}

function sendGetDevEncryption(sdk) {
	sdk.getDevEncryption().then(data => {
		tempParam.device_id = data.ddId || '';

		sendGetDevInfo(sdk);
	}).catch(err => {//getDevEncryption error
		sendGetDevInfo(sdk);
	});
}

function sendGetDevInfo(sdk) {
	sdk.getDevInfo().then(data => {
		var devInfo = JSON.parse(data);
		tempParam.os_version = devInfo.os_version || '';
		tempParam.app_version = devInfo.app_point_version || '';
		tempParam.app_source = devInfo.app_source || '';
		tempParam.IP = devInfo.IP || '';
		tempParam.geo_position = devInfo.GPS || '';

		sendGetLocationCity(sdk);
	}).catch(err => {//getDevInfo error
		sendGetLocationCity(sdk);
	})
}

function sendGetLocationCity(sdk) {
	sdk.getLocationCity().then(data => {
		if (data) {
			tempParam.location_city_id = data.cityId || '';
			tempParam.location_city_name = data.cityName || '';
		}
		sendH5PrePage(sdk);
	}).catch(err => {//getLocationCity error
		sendH5PrePage(sdk);
	})
}

function sendH5PrePage(sdk) {
	var prepageParam = {};
	prepageParam.url = window.location.href;
	sdk.callHandler('common.h5AutoPrePage', prepageParam).then(data => {
		prePage = data.prePage;
		tempParam.ABType = data.ABType || '';
		reSendFun();
	}).catch(err => {//sdk.callHandler('common.h5AutoPrePage') error
		reSendFun();
	});
}

function atNoBridgeSend() {
	let type = 41;
	autoTraceSendFlag = true;
	for (var i = 0; i < sendListArrForAutoTrace.length; i++) {
		var url = APIURL;
		url += "content=" + encodeURIComponent(sendListArrForAutoTrace[i]) + "&type=" + type;
		if (Promise) {
			return new Promise(function (resolve) {
				var oImg = new Image();
				oImg.src = url;
				oImg = null;
				resolve(url)
			})
		}
	}
}
