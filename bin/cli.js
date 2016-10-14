#! /usr/bin/env node

import minimist from 'minimist';
import {readFileSync, writeFileSync} from 'fs';
import {basename, extname, join} from 'path';
import convert from '../lib/index';

const FILE_TYPE_MAPPING = {
    '.xml': 'bilibili',
    '.json': 'acfun',
    '.ass': 'ass'
};

let getConfigOverrides = argv => {
    if (argv.config) {
        return JSON.parse(readFileSync(argv.config, 'utf-8'));
    }

    let use = s => s;
    let integer = s => parseInt(s, 10);
    let float = s => parseFloat(s);
    let numberArray = s => s.split(',').map(s => s.trim()).map(Number);
    let boolean = s => ({true: true, false: false})[s];
    let declarations = [
        ['fontSize', numberArray],
        ['fontName', use],
        ['color', use],
        ['bold', boolean],
        ['padding', numberArray],
        ['playResX', integer],
        ['playResY', integer],
        ['scrollTime', integer],
        ['fixTime', integer],
        ['opacity', float],
        ['bottomSpace', integer],
        ['includeRaw', boolean]
    ];
    let camelCase = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

    return declarations.reduce(
        (overrides, [name, convert]) => {
            let value = argv[camelCase(name)];
            return value ? Object.assign(overrides, {[name]: convert(value)}) : overrides;
        },
        {}
    );
};

let help = () => {
    let intent = '    ';

    let packageInfo = (() => {
        try {
            return JSON.parse(readFileSync(join(__dirname, '..', 'package.json')));
        }
        catch (ex) {
            return JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json')));
        }
    })();

    let content = [
        'Version:',
        intent + packageInfo.version,
        '',
        'Usage:',
        intent + 'danmaku [args ...] [file ...]',
        '',
        'Required args:',
        intent + '--out: Output filename, only process one input file and write to filename',
        intent + '--out-dir: Output dir, process all input files and write to dir with .ass extension',
        '',
        'Config args:',
        intent + '--config: Specify a config file, all other config args will be ignored',
        intent + '--font-size: List of font size, must be 3 number (smaller to larger) concat with comma, eg. 18,25,36',
        intent + '--font-name: Name of font used',
        intent + '--color: Default danmaku color, use either "ff3300", "fc9730", "#fff" or "000" format',
        intent + '--bold: Wether text should be bold, true to enable',
        intent + '--opacity: Opacity of font, must be a float between [0, 1)',
        intent + '--padding: Padding around each danmaku, must be 4 number concat with comma, eg. 2,2,2,2',
        intent + '--play-res-x: Width of video play area',
        intent + '--play-res-y: Height of video play area',
        intent + '--scroll-time: Display duration in seconds for scroll danmaku',
        intent + '--fix-time: Display duration in seconds for fixed (top or bottom) danmaku',
        intent + '--bottom-space: Bottom space to avoid danmaku overlap on original subtitles',
        intent + '--include-raw: Wether to include raw infomations in .ass file, defaults to true, use false to disable'
    ];

    return content.join('\n');
};

let argv = minimist(process.argv.slice(2));

if (!argv.out && !argv['out-dir']) {
    console.log(help());
    process.exit(1);
}

let configOverrides = getConfigOverrides(argv);

let convertOne = (file, output) => {
    let text = readFileSync(file, 'utf-8');
    let source = FILE_TYPE_MAPPING[extname(file)];
    try {
        let content = convert(text, configOverrides, {source: source, filename: basename(file)});
        writeFileSync(output, content, 'utf-8');
        console.log(`${file} --> ${output}`);
    }
    catch (ex) {
        console.error(`Failed to convert ${file}: ${ex.message}`);
    }
};

let files = argv._;
if (argv.out) {
    convertOne(files[0], argv.out);
}
else {
    for (let file of files) {
        let output = join(argv['out-dir'], basename(file, extname(file)) + '.ass');
        convertOne(file, output);
    }
}
