function cookie(name){
  var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  // fix to no-cond-assign
  arr=document.cookie.match(reg);
  if(arr)
    return unescape(arr[2]);
  else
    return "";
}

export default cookie;