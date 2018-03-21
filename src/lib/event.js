import send from './send';
import { autoTrace, reSendAutoTrace } from './autotrace'

/**
 * @method parseTrackingData
 * 解析埋点数据
 * @returns {*}
 */
function parseTrackingData(event_obj) {
  try {
    if (event_obj.indexOf('{') === 0 && event_obj.lastIndexOf('}') === event_obj.length - 1) {
      event_obj = eval('(' + event_obj + ')');
      Object.keys(event_obj).forEach(function (event_id) {
        send(event_id, event_obj[event_id]);
      });
    } else {
      send(event_obj);
    }

  } catch (e) {
  }
}

/**
 * @method bindLoadEvent
 * 解析页面打开的埋点
 * @returns {*}
 */
function bindLoadTracking() {
  if (document && document.body) {
    var body = document.body;
    var trackingData = body.getAttribute('tracking-load') || body.getAttribute('data-tracking-load') || body.getAttribute('aria-tracking-load');
    if (trackingData) {
      parseTrackingData(trackingData);
    }
  }
}




/**
 * @method bindTranckingEvent
 * 解析元素点击的埋点，基于业务考虑，目前只需要考虑click时间就可以了
 * @returns {*}
 */
function bindClickTrancking() {
  // 使用捕获方式绑定，防止业务逻辑了阻止冒泡，无法发送埋点日志
  if (document.body.getAttribute('tracking-auto') !== "off") {
    window.addEventListener('click', function (e) {
      var target = e.target;

      while (target) {
        if (typeof target.getAttribute === 'function') {
          if (target.getAttribute('tracking-click')) {
            send(target.getAttribute('tracking-click'));
          }

          if (target.getAttribute('data-tracking-click')) {
            send(target.getAttribute('data-tracking-click'));
          }

          if (target.getAttribute('aria-tracking-click')) {
            send(target.getAttribute('aria-tracking-click'))
          }

          return true
        }

        target = target.parentNode;
      }
      return true;
    }, true);
  }
}

function goAutoTrace() {
  autoTrace();
}

function bindAllTracking() {
  goAutoTrace();
  bindLoadTracking();
  bindClickTrancking();
}

function addAutoTracking() {
  // 如果window已经load，直接解析埋点，否则绑定load之后做绑定，避免阻止业务代码逻辑加载
  if (document.readyState === 'complete') {
    bindAllTracking();
  } else {
    window.addEventListener('load', bindAllTracking, true);
  }
}

export default addAutoTracking;
