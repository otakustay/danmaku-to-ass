import dialogue from './dialogue';

export default (list, config) => {
    let content = [
        '[Events]',
        'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
        ...list.map(danmaku => dialogue(danmaku, config))
    ];

    return content.join('\n');
};
