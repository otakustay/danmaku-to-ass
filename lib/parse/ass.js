import zlib from 'zlib';

let decode = text => {
    let buffer = Buffer.from(text, 'base64');
    let content = zlib.unzipSync(buffer).toString();
    return JSON.parse(content);
};

export default text => {
    let matches = /;Raw: ([a-zA-Z0-9+/=]+)/.exec(text);

    if (!matches) {
        throw new Error('No raw information included');
    }

    let result = decode(matches[1]);
    // 移除掉原来的屏蔽规则
    result.config.block = [];

    return result;
};
