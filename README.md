# A站B站弹幕转字幕文件

![](./screenshot/strike-witches.png)

本工具主要解决部分已经下架的视频的弹幕播放问题，转为ass字幕后可以使用任意支持字幕的播放器播放。

具体获取A站、B站弹幕的方法请自行搜索，B站可考虑使用[BiliPlus](https://www.biliplus.com/)或[哔哩哔哩唧唧](http://www.bilibilijj.com/)

感谢[tiansh/us-danmaku](https://github.com/tiansh/us-danmaku)提供诸多指导。

## 安装方式

由于本工具使用了`node-canvas`进行字符长度的计算，而需要计算汉字的宽度，需要安装`pango`库，因此先参考[node-canvas的安装说明](https://github.com/Automattic/node-canvas#installation)进行安装。macOS除正常的依赖外，请额外安装`pango`库：

```shell
brew install pango
```

之后使用npm进行安装：

```shell
npm install -g danmaku-to-ass
```

## 使用方式

```shell
danmaku [参数] [文件列表]
```

默认输入为`.xml`文件时解析为B站弹幕，为`.json`文件（尚未实现）时解析为A站弹幕。

也可以提供一个由本工具生成的`.ass`文件（必须以`--inlude-raw=true`参数生成），以达到调整生成参数的目的，如以下命令可以将字号变小并覆盖原字幕文件：

```shell
danmaku --font-size=12,18,24 --out-dir=./subtitle ./subtitle
```

当然也可以使用`--out`参数单独处理一个文件，或指定不同的`--out-dir`保留旧文件。

### 参数

#### 必要参数

- `--out {输出文件}`：使用该参数时将输出保存至参数指定的文件，与`--out-dir`二选一。
- `--out-dir {输出目录}`：使用该参数可以将多个文件进行批量转换并保存到指定的目录下，如果使用该参数则不要使用`--out`参数。

#### 配置参数

- `--config`：指定一个配置文件，格式见后文，指定该参数后其它配置参数都会失效。
- `--font-size`：指定字号列表，必须是3个从小到大的数字并用逗号连接，比如`18,25,36`。
- `--font-name`：指定字体名称。
- `--bold`：指定是否使用粗体，值为`true`时表示使用粗体。
- `--opacity:` 指定字体的透明度，必须是0-1之间的小数。
- `--padding:` 指定每条弹幕四周的空白，必须是4个数字并用逗号连接，比如`2,2,2,2`。
- `--play-res-x`：视频播放区域的宽度。
- `--play-res-y`：视频播放区域的高度，这个参数与宽度共同决定视频的长宽比例，具体数值不是很重要。
- `--scroll-time`：滚动弹幕的持续时间，单位为秒。
- `--fix-time`：固定弹幕（上方或下方）的持续时间，单位为秒。
- `--bottom-space`：底部留空的区域大小，以防止弹幕覆盖原始字幕。
- `--include-raw`：是否在生成的文件中保留原始信息，保留原始信息可以在后期重新使用本工具修改弹幕生成的参数，但会导致文件变大约1/3。该参数默认值为`true`，可提供`false`强制不保留原始信息。

#### 参考配置文件

以下除`fontName`名均为默认值。

```json
{
    "fontSize": [25, 36],
    "fontName": "黑体",
    "bold": false,
    "padding": [2, 2, 2, 2],
    "playResX": 1280,
    "playResY": 720,
    "scrollTime": 8,
    "fixTime": 4,
    "opacity": 0.6,
    "bottomSpace": 60,
    "includeRaw": true
}
```

## 程序调用

同样可以使用程序进行调用：

```javascript
import convert from 'danmaku-to-ass';
import {readFileSync} from 'fs';

let text = readFileSync('av12345.xml', 'utf-8');
let ass = convert(text, {}, {source: 'bilibili', filename: 'av12345.xml'});
```

函数签名：

```
{string} convert({string} text, {Object} configOverrides, {Object} context);
```

参数说明：

- `text`：弹幕文件内容，如果是Bilibili则为XML文本，Acfun为JSON文本。
- `configOverrides`：覆盖默认配置的内容，见上文的配置文件参考。
- `context`：转换的上下文信息，需要2个属性：
    - `{string} source`：内容的来源类型，为`"bilibili"`或`"acfun"`（注意全小写）。
    - `{string} filename`：来源文件名，如果没有的话可以随便写一个，主要放在ass文件的信息部分。

