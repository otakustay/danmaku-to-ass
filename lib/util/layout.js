import Canvas from 'canvas';
import {DanmakuType, FontSize} from '../enum';

// 计算一个矩形移进屏幕的时间（头进屏幕到尾巴进屏幕）
let computeScrollInTime = (rectWidth, screenWidth, scrollTime)  => {
    let speed = (screenWidth + rectWidth) / scrollTime;
    return rectWidth / speed;
};

// 计算一个矩形在屏幕上的时间（头进屏幕到头离开屏幕）
let computeScrollOverTime = (rectWidth, screenWidth, scrollTime) => {
    let speed = (screenWidth + rectWidth) / scrollTime;
    return screenWidth / speed;
};

let splitGrids = ({fontSize, padding, playResY, bottomSpace}) => {
    let defaultFontSize = fontSize[FontSize.NORMAL];
    let paddingTop = padding[0];
    let paddingBottom = padding[2];
    let linesCount = Math.floor((playResY - bottomSpace) / (defaultFontSize + paddingTop + paddingBottom));

    // 首先以通用的字号把屏幕的高度分成若干行，字幕只允许落在一个行里
    return {
        // 每一行里的数字是当前在这一行里的最后一条弹幕区域（算入padding）的右边离开屏幕的时间，
        // 这个时间和下一条弹幕的左边离开屏幕的时间相比较，能确定在整个弹幕的飞行过程中是否会相撞（不同长度弹幕飞行速度不同），
        // 当每一条弹幕加到一行里时，就会把这个时间算出来，获取新的弹幕时就可以判断哪一行是允许放的就放进去
        [DanmakuType.SCROLL]: Array(linesCount).fill({start: 0, end: 0, width: 0}),
        // 对于固定的弹幕，每一行里都存放弹幕的消失时间，只要这行的弹幕没消失就不能放新弹幕进来
        [DanmakuType.TOP]: Array(linesCount).fill(0),
        [DanmakuType.BOTTOM]: Array(linesCount).fill(0)
    };
};

let measureTextWidth = do {
    let canvasContext = (new Canvas()).getContext('2d');
    (fontName, fontSize, bold, text) => {
        canvasContext.font = `${bold ? 'bold' : 'normal'} ${fontSize}px ${fontName}`;
        return Math.round(canvasContext.measureText(text).width);
    };
};

// 找到能用的行
let resolveAvailableFixGrid = (grids, time) => {
    for (let i = 0; i < grids.length; i++) {
        if (grids[i] <= time) {
            return i;
        }
    }

    return -1;
};

let resolveAvailableScrollGrid = (grids, rectWidth, screenWidth, time, duration) => {
    for (let i = 0; i < grids.length; i++) {
        let previous = grids[i];

        // 对于滚动弹幕，要算两个位置：
        //
        // 1. 前一条弹幕的尾巴进屏幕之前，后一条弹幕不能开始出现
        // 2. 前一条弹幕的尾巴离开屏幕之前，后一条弹幕的头不能离开屏幕
        let previousInTime = previous.start + computeScrollInTime(previous.width, screenWidth, duration);
        let currentOverTime = time + computeScrollOverTime(rectWidth, screenWidth, duration);

        if (time >= previousInTime && currentOverTime >= previous.end) {
            return i;
        }
    }

    return -1;
};

let initializeLayout = config => {
    let {playResX, playResY, fontName, fontSize, bold, padding, scrollTime, fixTime, bottomSpace} = config;
    let [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;

    let defaultFontSize = fontSize[FontSize.NORMAL];
    let grids = splitGrids(config);
    let gridHeight = defaultFontSize + paddingTop + paddingBottom;

    return danmaku => {
        let targetGrids = grids[danmaku.type];
        let danmakuFontSize = fontSize[danmaku.fontSizeType];
        let rectWidth = measureTextWidth(fontName, danmakuFontSize, bold, danmaku.content) + paddingLeft + paddingRight;
        let fontSizeOffset = Math.round((defaultFontSize - danmakuFontSize) / 2);
        let gridNumber = danmaku.type === DanmakuType.SCROLL
            ? resolveAvailableScrollGrid(targetGrids, rectWidth, playResX, danmaku.time, scrollTime)
            : resolveAvailableFixGrid(targetGrids, danmaku.time);

        if (gridNumber < 0) {
            console.warn(`[Warn] Collision ${danmaku.time}: ${danmaku.content}`);
            return null;
        }

        if (danmaku.type === DanmakuType.SCROLL) {
            targetGrids[gridNumber] = {width: rectWidth, start: danmaku.time, end: danmaku.time + scrollTime};

            let top = gridNumber * gridHeight + fontSizeOffset;
            let start = playResX + paddingLeft;
            let end = -rectWidth;

            return {...danmaku, top, start, end};
        }
        else if (danmaku.type === DanmakuType.TOP) {
            targetGrids[gridNumber] = danmaku.time + fixTime;

            let top = gridNumber * gridHeight + fontSizeOffset;
            // 固定弹幕横向按中心点计算
            let left = Math.round(playResX / 2);

            return {...danmaku, top, left};
        }

        targetGrids[gridNumber] = danmaku.time + fixTime;

        // 底部字幕的格子是留出`bottomSpace`的位置后从下往上算的
        let top = playResY - bottomSpace - gridHeight * gridNumber - gridHeight + fontSizeOffset;
        let left = Math.round(playResX / 2);

        return {...danmaku, top, left};
    };
};

export let layoutDanmaku = (inputList, config) => {
    let list = Array.from(inputList).sort((x, y) => x.time - y.time);
    let layout = initializeLayout(config);

    return list.map(layout).filter(danmaku => !!danmaku);
};
