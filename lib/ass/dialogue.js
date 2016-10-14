import {formatColor, getDecoratingColor, isWhite} from '../util/index';
import {DanmakuType} from '../enum';
// Dialogue: 0,0:00:00.00,0:00:08.00,R2L,,20,20,2,,{\move(622.5,25,-62.5,25)}标准小裤裤
// Dialogue: 0,0:00:08.35,0:00:12.35,Fix,,20,20,2,,{\pos(280,50)\c&HEAA000}没男主吗

let formatTime = seconds => {
    let div = (i, j) => Math.floor(i / j);
    let pad = n => (n < 10 ? '0' + n : '' + n);

    let integer = Math.floor(seconds);
    let hour = div(integer, 60 * 60);
    let minute = div(integer, 60) % 60;
    let second = integer % 60;
    let minorSecond = Math.floor((seconds - integer) * 100); // 取小数部分2位

    return `${hour}:${pad(minute)}:${pad(second)}.${minorSecond}`;
};

let encode = text => text.replace(/\{/g, '｛').replace(/\}/g, '｝').replace(/\r|\n/g, '');

let scrollCommand = ({start, end, top}) => `\\move(${start},${top},${end},${top})`;
let fixCommand = ({top, left}) => `\\an8\\pos(${left},${top})`;
let colorCommand = color => `\\c${formatColor(color)}`;
let borderColorCommand = color => `\\3c${formatColor(color)}`;

export default (danmaku, config) => {
    let {fontSizeType, content, time} = danmaku;
    let {scrollTime, fixTime} = config;

    let commands = [
        danmaku.type === DanmakuType.SCROLL ? scrollCommand(danmaku) : fixCommand(danmaku),
        // 所有网站的原始默认色是白色，所以白色的时候不用额外加和颜色相关的指令
        isWhite(danmaku.color) ? '' : colorCommand(danmaku.color),
        isWhite(danmaku.color) ? '' : borderColorCommand(getDecoratingColor(danmaku.color))
    ];
    let fields = [
        0, // Layer,
        formatTime(time), // Start
        formatTime(time + (danmaku.type === DanmakuType.SCROLL ? scrollTime : fixTime)), // End
        'F' + fontSizeType, // Style
        '', // Name
        '0000', // MarginL
        '0000', // MarginR
        '0000', // MarginV
        '', // Effect
        '{' + commands.join('') + '}' + encode(content) // Text
    ];

    return 'Dialogue: ' + fields.join(',');
};
