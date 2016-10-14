#! /usr/bin/env node

import minimist from 'minimist';
import {readFileSync, writeFileSync} from 'fs';
import {basename, extname, join} from 'path';
import {assign} from '../lib/util/index';
import convert from '../lib/index';

const FILE_TYPE_MAPPING = {
    '.xml': 'bilibili',
    '.json': 'acfun',
    '.ass': 'ass'
};

let getConfigOverrides = argv => {
    let use = s => s;
    let integer = s => parseInt(s, 10);
    let float = s => parseFloat(s);
    let multiple = i => [].concat(i);
    let numberArray = s => s.split(',').map(s => s.trim()).map(Number);
    let boolean = s => ({true: true, false: false})[s];
    let declarations = [
        ['fontSize', numberArray],
        ['fontName', use],
        ['color', use],
        ['outlineColor', use],
        ['backColor', use],
        ['outline', integer],
        ['shadow', integer],
        ['bold', boolean],
        ['padding', numberArray],
        ['playResX', integer],
        ['playResY', integer],
        ['scrollTime', integer],
        ['fixTime', integer],
        ['opacity', float],
        ['bottomSpace', integer],
        ['includeRaw', boolean],
        ['mergeIn', integer],
        ['blockFile', use],
        ['block', multiple]
    ];
    let camelCase = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

    let overrides = declarations.reduce(
        (overrides, [name, convert]) => {
            let value = argv[camelCase(name)];
            return value ? Object.assign(overrides, {[name]: convert(value)}) : overrides;
        },
        {}
    );

    // 处理屏蔽列表的合并
    if (overrides.blockFile) {
        try {
            let blockList = readFileSync(overrides.blockFile, 'utf-8').split(/\r?\n/).filter(s => !!s.length);
            overrides.block = (overrides.block || []).concat(blockList);
            delete overrides.blockFile;
        }
        catch (ex) {
            console.error(`Error reading block file ${overrides.blockFile}`);
            process.exit(1);
        }
    }
    let staticConfig = argv.config ? JSON.parse(readFileSync(argv.config, 'utf-8')) : {};
    let blockList = (staticConfig.block || []).concat(overrides.block || []);

    return assign(staticConfig, overrides, {block: blockList});
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
        intent + '--outline-color: Color for text outline',
        intent + '--back-color: Color for text shadow',
        intent + '--outline: Width of text outline in pixels',
        intent + '--shadow: Width of text shadow in pixels',
        intent + '--bold: Wether text should be bold, true to enable',
        intent + '--opacity: Opacity of font, must be a float between [0, 1)',
        intent + '--padding: Padding around each danmaku, must be 4 number concat with comma, eg. 2,2,2,2',
        intent + '--play-res-x: Width of video play area',
        intent + '--play-res-y: Height of video play area',
        intent + '--scroll-time: Display duration in seconds for scroll danmaku',
        intent + '--fix-time: Display duration in seconds for fixed (top or bottom) danmaku',
        intent + '--bottom-space: Bottom space to avoid danmaku overlap on original subtitles',
        intent + '--include-raw: Wether to include raw infomation in .ass file, defaults to true, use false to disable',
        intent + '--merge-in: Merge danmaku with same content in given time, the value should be a integer of seconds',
        intent + '--block: Blocks danmaku with given rule, can be appear multiple times',
        intent + '--block-file: Provide a file containing a list of block rule (one rule per line)',
        '',
        'Block rule:',
        intent + 'A block rule can be either a regular expression or a built-in rule keyword, which is one of:',
        intent + intent + 'COLOR: To block all colorized danmaku',
        intent + intent + 'TOP: To block all top fixed danmaku',
        intent + intent + 'BOTTOM: To block all bottom fixed danmaku',
        intent + 'If the input file is a .ass file, it\'s original block rules are ignored'
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
