let decimalToHex = n => n.toString(16).padStart(2, 0);
let formatColor = (opacity, {r, g, b}) => '&H' + [opacity, b, g, r].map(decimalToHex).join('');

export default ({fontName, fontSize, opacity}) => {
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
    let alpha = Math.round((1 - opacity) * 255);
    let primaryColor = formatColor(alpha, {r: 255, g: 255, b: 255});
    let secondaryColor = formatColor(alpha, {r: 0, g: 0, b: 0});
    let colorStyle = `${primaryColor},${primaryColor},${secondaryColor},${secondaryColor}`;
    let fontStyle = '1,0,0,0,100,100,0,0,1,2,0,7,0,0,0,0';
    let fontDeclaration = (size, i) => `Style: F${i},${fontName},${size},${colorStyle},${fontStyle}`;
    let content = [
        '[V4+ Styles]',
        'Format: ' + fields.join(','),
        ...fontSize.map(fontDeclaration)
    ];
    return content.join('\n');
};
