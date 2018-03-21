import cookie from './cookie';

export { getBrowserType };
export { detectOS };
export { uniqueU };
export { searchParse };
export { isFfan }

export default {
  getBrowserType,
  detectOS,
  uniqueU,
  searchParse,
  isFfan
}

function getBrowserType() {
  var u = navigator.userAgent, app = navigator.appVersion;
  if (u.indexOf("Trident") > -1) {
    return "trident";       //IEÄÚºË
  }
  if (u.indexOf("Presto") > -1) {
    return "Presto";     //operaÄÚºË
  }
  if (u.indexOf("AppleWebKit") > -1) {
    return "webKit";   //Æ»¹û¡¢¹È¸èÄÚºË
  }
  if (u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1) {
    return "gecko";      //»ðºüÄÚºË
  }
  if (!!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/)) {
    return "mobile";      //ÒÆ¶¯ÖÕ¶Ë
  }
  if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
    return "ios";   //iosÖÕ¶Ë
  }
  if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
    return "android";   //androidÖÕ¶Ë»òÕßucä¯ÀÀÆ÷
  }
  if (u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1) {
    return "iPhone";   //iphne»òQQHDä¯ÀÀÆ÷
  }
  return "other";
}

function detectOS() {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var isWin = (navigator.platform.toLowerCase() === "win32") || (navigator.platform.toLowerCase() === "windows");
  var bIsIpad = sUserAgent.indexOf('ipad') != -1;
  var bIsIphoneOs = sUserAgent.indexOf('iphone') != -1 || sUserAgent.indexOf('ios') != -1;
  var isUnix = (navigator.platform.toLowerCase() === 'x11') && !isWin && !isMac;
  var isLinux = (String(navigator.platform.toLowerCase()).indexOf("linux") > -1);
  var bIsAndroid = sUserAgent.indexOf('android') != -1;
  var bIsCE = sUserAgent.indexOf('windows ce') != -1;
  var bIsWM = sUserAgent.indexOf('windows mobile') != -1;

  if (bIsAndroid) {
    return "Android";
  }
  if (bIsIpad||bIsIphoneOs) {
    return "iOS";
  }
  // if (bIsIphoneOs) {
  //   return "Iphone";
  // }
  // if (isUnix) {
  //   return "Unix";
  // }
  // if (isLinux) {
  //   return "Linux";
  // }
  // if (bIsCE || bIsWM) {
  //   return 'wm';
  // }

  return "other";
}

function uniqueU() {
  if (cookie('U_UID')) {
    return;
  }
  let hostname = window.location.hostname.split('.'),
    webDomain = hostname[(hostname.length - 2)] + '.' + hostname[(hostname.length - 1)];
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1);
  expireDate.setHours(0);
  expireDate.setMinutes(0);
  expireDate.setMilliseconds(0);
  expireDate.setSeconds(0);
  document.cookie = 'U_UID' + "=" + uuid() + ";domain=" + webDomain + ";path=/";

  function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }
}

function searchParse() {
  var resultObj = {};
  var search = window.location.search;
  if (search && search.length > 1) {
    var search = search.substring(1);
    var items = search.split('&');
    for (var index = 0; index < items.length; index++) {
      if (!items[index]) {
        continue;
      }
      var kv = items[index].split('=');
      resultObj[kv[0]] = typeof kv[1] === "undefined" ? "" : kv[1];
    }
  }
  return resultObj;
}

function isFfan() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('wanhui') > -1 || ua.indexOf('wanda') > -1 || ua.indexOf('feifan') > -1) {
    return true;
  }
  return false;
}