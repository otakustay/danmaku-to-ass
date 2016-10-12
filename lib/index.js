import getConfig from './config';
import * as parse from './parse/index';
import {layoutDanmaku} from './util/index';
import ass from './ass/create';

export default (text, configOverrides, {source, filename}) => {
    let {list, config = {}, context = {}} = parse[source](text);
    Object.assign(config, getConfig(configOverrides));
    Object.assign(context, {source, filename});
    let layoutList = layoutDanmaku(list, config);
    let content = ass(layoutList, config, {filename});

    return content;
};
