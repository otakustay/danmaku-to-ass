import {formatColor, getDecoratingColor} from '../util/index';

export default ({fontName, fontSize, color: configColor, outlineColor, backColor, bold, outline, shadow, opacity}) => {
    let fields = [
        'Name',
        'Fontname', 'Fontsize',
        'PrimaryColour', 'SecondaryColour', 'OutlineColour', 'BackColour',
        'Bold', 'Italic', 'Underline', 'StrikeOut',
        'ScaleX', 'ScaleY',
        'Spacing', 'Angle',
        'BorderStyle', 'Outline', 'Shadow',
        'Alignment', 'MarginL', 'MarginR', 'MarginV',
        'Encoding'
    ];
    // 默认白底黑框
    let primaryColorValue = formatColor(configColor, opacity);
    // 边框和阴影颜色没给的话算一个出来，不是黑就是白
    let secondaryColor = getDecoratingColor(configColor);
    let outlineColorValue = formatColor(outlineColor || secondaryColor, opacity);
    let backColorValue = formatColor(backColor || secondaryColor, opacity);
    let colorStyle = `${primaryColorValue},${primaryColorValue},${outlineColorValue},${backColorValue}`;

    let boldValue = bold ? '1' : '0';
    let fontStyle = `${boldValue},0,0,0,100,100,0,0,1,${outline},${shadow},7,0,0,0,0`;

    let fontDeclaration = (size, i) => `Style: F${i},${fontName},${size},${colorStyle},${fontStyle}`;
    let content = [
        '[V4+ Styles]',
        'Format: ' + fields.join(','),
        ...fontSize.map(fontDeclaration)
    ];
    return content.join('\n');
};
