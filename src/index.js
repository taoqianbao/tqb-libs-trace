import send from './lib/send';
import addAutoTracking from './lib/event';

addAutoTracking();

window.tracking = send;

export default {
  send
};

//function fix(item) {
// return item.replace(/:\s*"([^"]*)"/g, function(match, p1) {
//    return ': "' + p1.replace(/:/g, '@colon@') + '"';
//  })
//    .replace(/:\s*'([^']*)'/g, function(match, p1) {
//      return ': "' + p1.replace(/:/g, '@colon@') + '"';
//    })
//    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')
//    .replace(/@colon@/g, ':')
//}



