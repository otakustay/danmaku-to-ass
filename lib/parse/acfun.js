import {DanmakuType, FontSize} from '../enum';
import {decimalColorToRGB} from '../util/index';

// AcFun的弹幕是一个JSON文件，内容为一个二维数组，每一个子数组都可能是弹幕列表
//
// 每一条弹幕格式如下：
//
// ```json
// {
//     "c": "37.128,65280,1,25,1480747,1474256948,13124cc1-4efe-4435-8178-4c6e34b98033",
//     "m": "上升气流在哪里"
// }
//
// 其中`m`字段为内容，`c`字段为信息，使用逗号分隔分别为以下属性：
//
// 1. 弹幕发送时间，相对于视频开始时间，以秒为单位
// 2. 弹幕颜色，RGB颜色转为十进制后的值
// 3. 弹幕类型，1为滚动弹幕、4为底部、5为顶端、7为高级，其它未知
// 4. 字体大小，25为中，18为小，当前Bilibili只有这2个字号
//
// 其它字段未知，转换时只需要使用前4项即可

const DANMAKU_TYPE_MAPPING = {
    1: DanmakuType.SCROLL,
    4: DanmakuType.TOP,
    5: DanmakuType.BOTTOM
};

const FONT_SIZE_MAPPING = {
    16: FontSize.SMALL,
    25: FontSize.NORMAL,
    37: FontSize.LARGE
};

let nodeToDanmaku = node => {
    let [time, color, type, fontSize] = node.c.split(',');
    let danmaku = {
        time: parseFloat(time),
        type: DANMAKU_TYPE_MAPPING[type],
        fontSizeType: fontSize in FONT_SIZE_MAPPING ? FONT_SIZE_MAPPING[fontSize] : FontSize.NORMAL,
        color: decimalColorToRGB(color),
        content: node.m
    };

    if (!danmaku.content) {
        console.warn(`[Warn] Dropped empty danmaku at ${danmaku.time}`);
        return null;
    }

    if (danmaku.type) {
        return danmaku;
    }

    console.warn(`[Warn] Dropped unsupported ${danmaku.time}: ${danmaku.content}`);
    return null;
};

export default text => {
    let wrap = JSON.parse(text);
    let comments = wrap.reduce((result, comments) => result.concat(comments.map(nodeToDanmaku)), []);
    return {list: comments.filter(danmaku => !!danmaku)};
};
