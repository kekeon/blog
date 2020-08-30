(function () {


  let p = new Proxy({}, {
    get: function (target, p, receiver) {
      console.log('target, p, get', target, p, receiver)
      return target[p]
    },
    set: function (target, p, value) {
      console.log('target, p, set', target, p, value)
      target[p] = value
    },
    has: function (target, propKey) {
      console.log('target, p, hasOwnProperty', target, propKey)
      return Reflect.has(target, propKey)
    }
  });

  console.log(p.name);
  console.log(p.name = 1);
  console.log('name' in p);

})();
