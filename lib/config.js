import fontManager from 'font-manager';
import {assign, uniqueArray, hexColorToRGB} from './util/index';

let convertBlockRule = rule => (/^[A-Z]+$/.test(rule) ? rule : new RegExp(rule));

export default (overrides = {}) => {
    let font = fontManager.substituteFontSync('', '中文测试');
    let defaults = {
        fontSize: [25, 36, 48],
        fontName: font.family,
        color: '#ffffff',
        outlineColor: null,
        backColor: null,
        outline: 2,
        shadow: 0,
        bold: false,
        padding: [2, 2, 2, 2],
        playResX: 1280,
        playResY: 720,
        scrollTime: 8,
        fixTime: 4,
        opacity: 0.6,
        bottomSpace: 60,
        includeRaw: true,
        mergeIn: -1,
        block: []
    };

    let config = assign(defaults, overrides);
    config.color = hexColorToRGB(config.color);
    config.outlineColor = config.outlineColor && hexColorToRGB(config.outlineColor);
    config.backColor = config.backColor && hexColorToRGB(config.backColor);
    config.block = uniqueArray(config.block).map(convertBlockRule);

    return config;
};
