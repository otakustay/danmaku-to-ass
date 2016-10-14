import fontManager from 'font-manager';
import {assign, hexColorToRGB} from './util/index';

export default (overrides = {}) => {
    let font = fontManager.substituteFontSync('', '中文测试');
    let defaults = {
        fontSize: [25, 36, 48],
        fontName: font.family,
        color: '#ffffff',
        bold: false,
        padding: [2, 2, 2, 2],
        playResX: 1280,
        playResY: 720,
        scrollTime: 8,
        fixTime: 4,
        opacity: 0.6,
        bottomSpace: 60,
        includeRaw: true
    };

    let config = assign(defaults, overrides);
    config.color = hexColorToRGB(config.color);

    return config;
};
