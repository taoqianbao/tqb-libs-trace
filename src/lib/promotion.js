import url from 'url';
import store from 'store';
import { searchParse } from './tool';

export { getPromotion };
export { setPromotion };

export default {
  getPromotion,
  setPromotion
};

const storeIsDisabled = function(){
  console.error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
};

let promotion;

function setReferExpDate(hour){
  var date=new Date().getTime()+hour*60*60*1000;
  return new Date(date).getTime();
}

function setPromotion(){
  let searchObj = searchParse();
  let promotion_from = searchObj['promotion_from'];
  if (promotion_from) {
    promotion = promotion_from;
    try {
      store.set('refer', JSON.stringify({
          "promotion_from":promotion_from,
          "expired":setReferExpDate(1)
      }));
    } catch(e) {
      if (!store.enabled) {
        storeIsDisabled();
      }
    }
  }
}

function getPromotion(){
  if(promotion){
    return promotion;
  }
  var refer={},
    date=new Date().getTime();
  try {
    if(store.get("refer")){
      refer=JSON.parse(store.get("refer"));
      if(date>=refer.expired){
        store.remove("refer");
        return ""
      }
      return refer.promotion_from
    }
  } catch(e) {
    if (!store.enabled) {
      storeIsDisabled();
    }
  }
  return "";
}
