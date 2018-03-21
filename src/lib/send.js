import store from 'store';
import dateFormat from 'dateformat';
import { APIURL } from './config';

import { getPromotion, setPromotion } from './promotion';
import { uniqueU, getBrowserType, detectOS, searchParse, isFfan } from './tool';
import cookie from './cookie';
import jsBridge from '../jsbridge/index'
import {
    assign,
} from '../jsbridge/util';
import { autoTrace, reSendAutoTrace, setAutoTraceSendFlag, atNoBridgeSend } from './autotrace';

// 公共参数
let commonPara = {};

let sendListArr = [];

let content = {
    "event_log": [
        {}
    ]
};



let sendFlag = false; //发送标志

function sendFun() {
    sendFlag = true;
    var url = APIURL;
    for (var i = 0; i < sendListArr.length; i++) {
        sendListArr[i] = assign({}, JSON.parse(sendListArr[i]), commonPara);
        url += "content=" + encodeURIComponent(JSON.stringify(sendListArr[i])) + "&type=" + LOG_TYPE;
        if (Promise) {
            return new Promise(function (resolve) {
                var oImg = new Image();
                oImg.src = url;
                oImg = null;
                content.event_log[0] = {};
                resolve(url)
            })
        }
    }
}

//公共参数
function paramCom(sdk) {
    sdk.getDevEncryption().then(data => {
        commonPara.device_id = data.ddId || '';
        devInfoSend(sdk);
    }).catch(function (err) {
        devInfoSend(sdk);
    })
}

function abTypeSend(sdk) {
    sdk.callHandler('common.getABType', '').then(data => {
        commonPara.ABType = data || '';
        sendFun();
    }).catch(function (err) {
        sendFun();
    })
}

function devInfoSend(sdk) {
    sdk.getDevInfo().then(data => {
        var devInfo = JSON.parse(data);
        commonPara.os_version = devInfo.os_version || '';
        commonPara.app_version = devInfo.app_point_version || '';
        commonPara.app_source = devInfo.app_source || '';
        commonPara.IP = devInfo.IP || '';
        commonPara.geo_position = devInfo.GPS || '';
        abTypeSend(sdk);
    }).catch(function (err) {
        abTypeSend(sdk);
    })
}

/**
 * [getDevInfo description] jsbridge获取设备信息
 * @return {[type]} [description]
 */
function getDevInfo() {
    if (window.ffanSDK) {
        ffanSDK.ready().then(function (sdk) {
            paramCom(sdk);
            reSendAutoTrace(sdk);
        }).catch(function () {
            atNoBridgeSend();
        });
    } else {
        jsBridge.ready().then(function (sdk) {
            paramCom(sdk);
            reSendAutoTrace(sdk);
        }).catch(function () {
            atNoBridgeSend();
        });
    }
}


const IS_FFAN = isFfan();
let LOG_TYPE = IS_FFAN ? 40 : 50;

if (window._tqbTracking && window._tqbTracking.logType) {
    LOG_TYPE = window._tqbTracking.logType;
}

setPromotion();


const FFANAPP_GlOBAL_DATA = [{
    key: 'app_version'
}, {
    key: 'os_version',
    queryKey: 'app_type'
}, {
    key: 'appkey',
    frozen: 'H5'
}, {
    key: 'device_id',
    queryKey: 'ddId'
}];

const DEFAULT_EVENT_DATA = [{
    key: 'user_id',
    queryKey: 'FFUDID'
}, {
    key: 'plazaId'
}, {
    key: 'cityId'
}];

function mergeData(source, obj) {
    let queryObj = searchParse();

    source.forEach(function (defaultData) {
        var key = defaultData.key,
            queryKey = defaultData.queryKey || key,
            frozen = defaultData.frozen,
            val = defaultData.value;
        if (frozen) {
            val = frozen;
        } else if (queryObj[key] !== undefined) {
            val = queryObj[key];
        } else if (store.get(key) !== undefined) {
            val = store.get(key);
        }
        if (val !== undefined) {
            obj[key] = val;
        }
    });

}

// 增加event_log里的值
function addEventLogParams(event_id) {
    let eventLog = content.event_log[0];

    mergeData(DEFAULT_EVENT_DATA, eventLog);
    eventLog.event_time = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    eventLog.promotion_from = getPromotion();
    eventLog.event_id = event_id;

    if (!eventLog['user_id']) {
        eventLog['user_id'] = cookie('uid');
    }

    let queryObj = searchParse();
    Object.keys(queryObj).forEach(function (key) {
        if (!eventLog[key]) {
            eventLog[key] = queryObj[key];
        }
    });
}

// 增加content字段的值
function addGlobalParams(eventLog) {
    if (IS_FFAN) {
        mergeData(FFANAPP_GlOBAL_DATA, content);
    } else {
        uniqueU();
        content.u_uid = cookie("U_UID");
        content.browser_type = getBrowserType();
        content.os_version = detectOS();
        content.browser_ver = window.navigator.appVersion || '';
    }
}

addGlobalParams();

// TODO
if (!content.os_version || !content.device_id || !content.app_version) {
    getDevInfo();
} else {
    sendFlag = true;
    setAutoTraceSendFlag();
}


/**
 *
 * @param event_id
 * @param flag (true:uv false:pv)
 * @param obj  (¶îÍâµÄ²ÎÊý)
 */
function send(event_id, obj, callback) {
    let eventLog = content.event_log[0];
    addEventLogParams(event_id);

    if (obj) {
        for (var key in obj) {
            eventLog[key] = obj[key]
        }
    }

    if (!sendFlag) {//未抓取到系统信息 将埋点加入待发送队列
        sendListArr.push(JSON.stringify(content));
    }
    else {//已抓取到系统信息 将系统信息加入发送字段直接发送
        content = assign({}, content, commonPara);
    }

    if (process.env.DEBUG) {
        console && console.log(event_id);
        const eleCode = document.querySelector('#ele-event');
        eleCode.innerHTML = eleCode.innerHTML + event_id + '<br/>'
        console && console.log('++++++++++++++');
        console && console.log(content);
        const eleContent = document.querySelector('#ele-content');
        eleContent.innerHTML = JSON.stringify(content, null, 2);
    }

    var url = APIURL;
    url += "content=" + encodeURIComponent(JSON.stringify(content)) + "&type=" + LOG_TYPE;

    if (process.env.DEBUG) {
        console && console.log(url);
        const eleUrl = document.querySelector('#ele-url');
        eleUrl.innerHTML = eleUrl.innerHTML + url + '<br><br/>'
    }

    if (typeof callback === 'function') {
        callback(url)
    }

    if (Promise) {
        return new Promise(function (resolve) {
            var oImg = new Image();
            oImg.src = url;
            oImg = null;
            content.event_log[0] = {};
            resolve(url)
        })
    }


}

export default send;