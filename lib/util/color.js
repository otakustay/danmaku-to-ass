let pad = s => (s.length < 2 ? '0' + s : s);
let decimalToHex = n => pad(n.toString(16));

// 本函数实现复制自[us-danmaku](https://github.com/tiansh/us-danmaku)项目
let isDarkColor = ({r, g, b}) => r * 0.299 + g * 0.587 + b * 0.114 < 0x30;

const WHITE = {r: 255, g: 255, b: 255};
const BLACK = {r: 0, g: 0, b: 0};

export let hexColorToRGB = hex => {
    if (hex.indexOf('#') === 0) {
        hex = hex.substring(1);
    }

    let [r, g, b] = hex.length === 3 ? hex.split('').map(c => c + c) : hex.match(/../g);

    return {
        r: parseInt(r, 16),
        g: parseInt(g, 16),
        b: parseInt(b, 16)
    };
};

export let decimalColorToRGB = decimal => {
    let div = (i, j) => Math.floor(i / j);

    return {
        r: div(decimal, 256 * 256),
        g: div(decimal, 256) % 256,
        b: decimal % 256
    };
};

export let formatColor = ({r, g, b}, opacity) => {
    let color = [b, g, r];

    if (opacity !== undefined) {
        let alpha = Math.round((1 - opacity) * 255);
        color.unshift(alpha);
    }

    return '&H' + color.map(decimalToHex).join('').toUpperCase();
};

export let getDecoratingColor = color => (isDarkColor(color) ? WHITE : BLACK);

export let isWhite = color => color.r === 255 && color.g === 255 && color.b === 255;
