require('es6-promise/auto');

import {
  assign,
  isPlainObject,
  isFn,
  isUndefined
} from './util';

const noop = function() {};

const setupWVJSBridge = (callback) => {
  if (window.WebViewJavascriptBridge) {
    return callback(WebViewJavascriptBridge);
  }
  // for android
  document.addEventListener('WebViewJavascriptBridgeReady', function() {
    callback(WebViewJavascriptBridge);
  }, false);
  // for ios
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];

  const WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(() => {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
};

const serialize = (obj) => {
  const s = [];
  for (let key in obj) {
    let val = obj[key] === null ? "" : obj[key];
    s.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
  }
  return s.join('&');
};

function setupCommonApiList(bridge) {
  const apiList = [
    'getUid',
    'getSid',
    'getPuid',
    'getPsid',
    'getUserInfo',
    'getDevInfo',
    'getClientInfo',
    'getDevEncryption',
    'getCity',
    'getLocationCity',
    'getLocation',
    'isLogin',
    'login',
    'logout',
    'httpRequest',
    'share',
    'shareTo',
    'customShare',
    'customShareTo',
    'initNativeConfig',
    'setTitle'
  ];

  const _defaults = {
    success: noop,
    fail: noop,
    data: null
  };

  apiList.forEach(function(item) {
    jsBridge[item] = function(params) {
      return new Promise(function(resolve, reject) {
        const {
          success,
          fail,
          data
        } = assign({}, _defaults, params);

        const doneCallback = function(res) {
          if (res && res.status == 200) {
            success(res.data);
            resolve(res.data);
          } else {
            fail(res);
            reject(res);
          }
        };
        bridge.callHandler('common.' + item, data, doneCallback);
      })
    }
  })
}

function setupHttpRequestApi(bridge) {
  const _defaults = {
    cache: false,
    cookie: true,
    encrypt: false,
    devInfo: true,
    https: true,
    data: null,
    success: noop,
    fail: noop,
    always: noop
  };

  const dataFormat = (opt) => {
    if (!opt || !opt.url) throw Error('missing url');
    opt.url = opt.url[0] == '/' ? opt.url.substr(1) : opt.url;
    const params = assign({}, _defaults, opt);
    if (isPlainObject(params.data)) {
      params.data = serialize(params.data)
    }
    return {
      data: {
        type: params.type,
        url: params.url,
        cache: params.cache,
        cookie: params.cookie,
        encrypt: params.encrypt,
        devInfo: params.devInfo,
        https: params.https,
        data: params.data,
      },
      success: params.success,
      fail: params.fail,
      always: params.always
    };
  }

  jsBridge.http = {
    get: function(opt) {
      opt.type = 'get';
      return jsBridge['httpRequest'](dataFormat(opt));
    },
    post: function(opt) {
      opt.type = 'post';
      return jsBridge['httpRequest'](dataFormat(opt));
    }
  };
}

function initialize(bridge) {
  // for android
  bridge.init && bridge.init((message, responseCallback) => {
    responseCallback({});
  });

  setupCommonApiList(bridge);
  setupHttpRequestApi(bridge);

  jsBridge.callHandler = function (cmd, data){
    const _data = data || null;
    return new Promise(function(resolve, reject) {
      bridge.callHandler(cmd, _data, function (res){
        if (res && res.status == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
    })
  }

  jsBridge.register = (handleName, fn) => {
    if (!handleName) throw new Error("missing register handleName");
    bridge.registerHandler("common." + handleName, (data, responseCallback) => {
      fn && fn(data, responseCallback);
    })
    return this;
  }

  initialize = noop;
}

const jsBridge = {
  ready: function(callback) {
    return new Promise((resolve, reject) => {
      const _tqbSdk = this;
      let Timer = setInterval(function() {
        if (document.readyState === 'complete') {
          clearInterval(Timer);
          setTimeout(function() {
            reject('jsbridge ready timeout.');
          }, 1000);
        }
      }, 2000);

      if (_tqbSdk._debug && !window.WebViewJavascriptBridge) {
        window.WebViewJavascriptBridge = {
          callHandler: function(name, data, responseCallback) {
            let _name = name.split('.')[1];
            if (_name === 'httpRequest') {
              const {
                type
              } = data;
              responseCallback(_tqbSdk._mockData && _tqbSdk._mockData.http && _tqbSdk._mockData.http[type]);
            } else {
              responseCallback(_tqbSdk._mockData && _tqbSdk._mockData[_name]);
            }
          },
          registerHandler: noop
        };
      }

      setupWVJSBridge(function(bridge) {
        clearInterval(Timer);
        try {
          initialize(bridge);
          callback && callback(jsBridge);
          resolve(jsBridge);
        } catch (e) {
          reject(e);
        }
      })
    })
  },

  _debug: false,

  _mockData: null,

  mock: function(data) {
    this._mockData = data;
    return this;
  },

  debug: function(isDebug) {
    this._debug = !!isDebug;
    return this;
  },

  config: function(option) {
    const {
      debug,
      mock
    } = option;
    if (!isUndefined(debug)) {
      this.debug(debug);
    }

    if (!isUndefined(mock)) {
      this.mock(isFn(mock) ? mock() : mock);
    }

    return this;
  },

  version: '0.0.3'
};

// @see => https://github.com/webpack/webpack/issues/706
module.exports = jsBridge;
