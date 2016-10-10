export default ({playResX, playResY}, {filename}) => {
    let content = [
        '[Script Info]',
        'Title: danmaku-to-ass',
        `Original Script: 根据 ${filename} 的弹幕信息，由 danmaku-to-ass 生成`,
        'ScriptType: v4.00+',
        'Collisions: Reverse',
        `PlayResX: ${playResX}`,
        `PlayResY: ${playResY}`,
        'Timer: 100.0000'
    ];
    return content.join('\n');
};
