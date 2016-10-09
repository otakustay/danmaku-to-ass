import fontManager from 'font-manager';

export default (overrides = {}) => {
    let font = fontManager.substituteFontSync('', '中文测试');
    let defaults = {
        fontSize: [25, 36],
        fontName: font.family,
        padding: [2, 2, 2, 2],
        playResX: 1280,
        playResY: 720,
        scrollTime: 8,
        fixTime: 4,
        opacity: 0.6,
        bottomSpace: 60
    };
    return Object.assign(defaults, overrides);
};
