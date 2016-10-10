import getConfig from './config';
import * as parse from './parse/index';
import {layoutDanmaku} from './util/index';
import ass from './ass/create';

export default (text, configOverrides, {source, filename}) => {
    let config = getConfig(configOverrides);
    let list = parse[source](text);
    let layoutList = layoutDanmaku(list, config);
    let content = ass(layoutList, config, {filename});

    return content;
};
