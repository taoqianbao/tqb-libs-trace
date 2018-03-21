const toString = Object.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;

const assign = typeof Object.assign == 'function' ? Object.assign : function (target){
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
            for (var key in source) {
                if (hasOwn.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}

const isPlainObject = (obj)=>{
    let proto, Ctor;
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if ( !obj || toString.call( obj ) !== "[object Object]" ) {
        return false;
    }

    proto = Object.getPrototypeOf( obj );

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if ( !proto ) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    return typeof Ctor === "function" && hasOwn.toString.call( Ctor ) === hasOwn.toString.call(Object);
}

const isUndefined = function (obj){
  return typeof obj === 'undefined';
};
const isFn = function (obj) {
  return typeof obj === 'function';
};

export {
    assign,
    isPlainObject,
    isUndefined,
    isFn
}