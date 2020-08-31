(function () {
    // 老写法
    try {
        Object.defineProperty(target, property, attributes);
        // success
    } catch (e) {
        // failure
    }

    // 新写法
    if (Reflect.defineProperty(target, property, attributes)) {
        // success
    } else {
        // failure
    }

})()