const STATUS = {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2
};

function isFn(obj){
  return obj && typeof obj === 'function';
}

function isThenable(obj) {
  return obj && obj.then && isFn(obj.then);
}

function PromiseA(resolver){
  if(!(this instanceof PromiseA)) {
    return new PromiseA(resolver);
  }

  this.status = STATUS.PENDING;
  this.value;
  this.reason;
  this._resolves = [];
  this._rejects = [];

  if(isFn(resolver)) {
    resolver(PromiseA.makeResolve(this), PromiseA.makeReject(this));
  }
  return this;
}

PromiseA.prototype.then = function (doneCallback, failCallback) {
  const status = this.status;

  return new PromiseA((resolve, reject)=>{
    // reject 只执行一次
    const modifiedFailCallback = isFn(failCallback) ? failCallback : reject;
    let modifiedDoneCallback;

    if(isFn(doneCallback)) {
      modifiedDoneCallback = function (data) {
        try {
          const returnVal = doneCallback.call(this, data);
          if (isThenable(returnVal)) {
            returnVal.then(resolve, reject);
          } else {
            resolve(returnVal);
          }
        } catch(e) {
          reject(e);
        }
      };

    } else {
      modifiedDoneCallback = function (data){
        resolve();
      };
    }

    if(STATUS.PENDING === status) {
      this._resolves.push(modifiedDoneCallback);
      this._rejects.push(modifiedFailCallback);
    }

    if(STATUS.REJECTED === status) {
      modifiedFailCallback.call(this, this.reason);
    }

    if(STATUS.RESOLVED === status) {
      modifiedDoneCallback.call(this, this.value);
    }

  });
  
}

PromiseA.prototype.catch = function (failCallback) {
  return this.then(null, failCallback);
}

PromiseA.makeResolve = function (promise) {
  return function (value){
    if(STATUS.REJECTED === promise.status) {
      throw new Error('Illegal call.');
    }
    
    promise.status = STATUS.RESOLVED;
    promise.value = value;

    promise._resolves.forEach(resolve=>{
      resolve(value);
    })

    return promise;
  }
}

PromiseA.makeReject = function (promise) {
  return function (reason) {
    if(STATUS.RESOLVED === promise.status) {
      throw new Error('Illegal call.');
    }
    
    promise.status = STATUS.REJECTED;
    promise.reason = reason;

    promise._rejects.forEach(reject=>{
      reject(reason);
    })
    return promise;
  }
}

export default PromiseA;