import Canvas from 'canvas';
import {DanmakuType, FontSize} from '../enum';

// 找到能用的行
let resolveAvailabelGrid = (grids, time) => {
    for (let i = 0; i < grids.length; i++) {
        if (grids[i] <= time) {
            return i;
        }
    }

    return -1;
};

// 计算一个矩形移进屏幕的时间
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
        [DanmakuType.SCROLL]: Array(linesCount).fill(0),
        // 对于固定的弹幕，每一行里都存放弹幕的消失时间，只要这行的弹幕没消失就不能放新弹幕进来
        [DanmakuType.TOP]: Array(linesCount).fill(0),
        [DanmakuType.BOTTOM]: Array(linesCount).fill(0)
    };
};

let measureTextWidth = do {
    let canvasContext = (new Canvas()).getContext('2d');
    (fontName, fontSize, text) => {
        canvasContext.font = `${fontSize}px ${fontName}`;
        return Math.round(canvasContext.measureText(text).width);
    };
};

let initializeLayout = config => {
    let {playResX, playResY, fontName, fontSize, padding, scrollTime, fixTime, bottomSpace} = config;
    let [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;

    let defaultFontSize = fontSize[FontSize.NORMAL];
    let grids = splitGrids(config);
    let gridHeight = defaultFontSize + paddingTop + paddingBottom;

    return danmaku => {
        let targetGrids = grids[danmaku.type];
        let danmakuFontSize = fontSize[danmaku.fontSizeType];
        let rectWidth = measureTextWidth(fontName, danmakuFontSize, danmaku.content) + paddingLeft + paddingRight;
        // 对于滚动弹幕，要算弹幕的左边到达屏幕左边的时间，此时只要前面一条弹幕已经离开，就说明不会碰撞
        let collisionTime = danmaku.type === DanmakuType.SCROLL
            ? danmaku.time + computeScrollOverTime(rectWidth, playResX, scrollTime)
            : danmaku.time;
        let gridNumber = resolveAvailabelGrid(targetGrids, collisionTime);

        if (gridNumber < 0) {
            // console.log(targetGrids, computeScrollOverTime(rectWidth, playResX, scrollTime));
            console.warn(`[Warn] Discard ${danmaku.time}: ${danmaku.content}`);
            return null;
        }

        if (danmaku.type === DanmakuType.SCROLL) {
            targetGrids[gridNumber] = danmaku.time + scrollTime;

            let top = gridNumber * gridHeight;
            let start = playResX + paddingLeft;
            let end = -rectWidth;

            return {...danmaku, top, start, end};
        }
        else if (danmaku.type === DanmakuType.TOP) {
            targetGrids[gridNumber] = danmaku.time + fixTime;

            let top = gridNumber * (defaultFontSize + paddingTop + paddingBottom);
            // 固定弹幕横向按中心点计算
            let left = Math.round(playResX / 2);


            return {...danmaku, top, left};
        }

        targetGrids[gridNumber] = danmaku.time + fixTime;

        // 底部字幕的格子是留出`bottomSpace`的位置后从下往上算的
        let top = playResY - bottomSpace - gridHeight * gridNumber - gridHeight;
        let left = Math.round(playResX / 2);

        return {...danmaku, top, left};
    };
};

export let layoutDanmaku = (inputList, config) => {
    let list = Array.from(inputList).sort((x, y) => x.time - y.time);
    let layout = initializeLayout(config);

    return list.map(layout).filter(danmaku => !!danmaku);
};
