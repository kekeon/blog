(function () {
    console.log("%c proxy start", "color: red;")

    let obj = new Proxy({}, {
        get: function (target, propKey, receiver) {
            console.log(`getting ${propKey}!`, target, receiver);
            return Reflect.get(target, propKey, receiver);
        },
        set: function (target, propKey, value, receiver) {
            console.log(`setting ${propKey}!`);
            return Reflect.set(target, propKey, value, receiver);
        }
    });

    ++obj.count

})()