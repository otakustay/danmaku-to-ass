export let decimalColorToRGB = decimal => {
    let div = (i, j) => Math.floor(i / j);

    return {
        r: div(decimal, 256 * 256),
        g: div(decimal, 256) % 256,
        b: decimal % 256
    };
};
