export let assign = (source, ...targets) => {
    for (let target of targets) {
        for (let key of Object.keys(target)) {
            source[key] = target[key];
        }
    }

    return source;
};

export let arrayOfLength = (length, defaultValue) => {
    let array = new Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = defaultValue;
    }
    return array;
};
