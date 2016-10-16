import {isWhite} from './color';
import {DanmakuType} from '../enum';

let getBlockInfo = (danmaku, rule) => {
    if (rule instanceof RegExp) {
        return [rule.test(danmaku.content), `custom rule ${rule}`];
    }

    switch (rule) {
        case 'COLOR':
            return [!isWhite(danmaku.color), 'color danmaku'];
        case 'TOP':
            return [danmaku.type === DanmakuType.TOP, 'top fixed danmaku'];
        case 'BOTTOM':
            return [danmaku.type === DanmakuType.BOTTOM, 'bottom fixed danmaku'];
        default:
            return [false, ''];
    }
};

let matchBlock = (danmaku, block) => {
    for (let rule of block) {
        let [blocked, reason] = getBlockInfo(danmaku, rule);
        if (blocked) {
            return {danmaku, blocked, reason};
        }
    }

    return {
        danmaku: danmaku,
        blocked: false,
        reason: null
    };
};

export let filterDanmaku = (list, block) => {
    let blockInfo = list.map(danmaku => matchBlock(danmaku, block));

    for (let {reason, danmaku} of blockInfo.filter(info => info.blocked)) {
        console.log(`[Info] blocked ${danmaku.time}: ${danmaku.content} (${reason})`);
    }

    return blockInfo.filter(info => !info.blocked).map(info => info.danmaku);
};
