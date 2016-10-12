import {gzipSync} from 'zlib';

export default (list, config, context) => {
    let raw = {list, config, context};
    let rawText = JSON.stringify(raw);
    return ';Raw: ' + gzipSync(rawText).toString('base64');
};
