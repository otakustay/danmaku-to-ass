import {formatColor, getDecoratingColor} from '../util/index';

export default ({fontName, fontSize, color: configColor, bold, opacity}) => {
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
    let primaryColor = formatColor(configColor, opacity);
    let secondaryColor = formatColor(getDecoratingColor(configColor), opacity);
    let boldValue = bold ? '1' : '0';
    let colorStyle = `${primaryColor},${primaryColor},${secondaryColor},${secondaryColor}`;
    let fontStyle = `${boldValue},0,0,0,100,100,0,0,1,2,0,7,0,0,0,0`;
    let fontDeclaration = (size, i) => `Style: F${i},${fontName},${size},${colorStyle},${fontStyle}`;
    let content = [
        '[V4+ Styles]',
        'Format: ' + fields.join(','),
        ...fontSize.map(fontDeclaration)
    ];
    return content.join('\n');
};
