let pad = s => (s.length < 2 ? '0' + s : s);
let decimalToHex = n => pad(n.toString(16));

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

export let isDarkColor = ({r, g, b}) => r * 0.299 + g * 0.587 + b * 0.114 < 0x30;

export let isWhite = ({r, g, b}) => r === 255 && g === 255 && b === 255;
