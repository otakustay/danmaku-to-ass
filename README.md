# A站B站弹幕转字幕文件

## 安装方式

```shell
npm install -g danmaku-to-ass
```

## 使用方式

```shell
danmaku {弹幕文件}
```

默认输入为`.xml`文件时解析为B站弹幕，为`.json`文件（尚未实现）时解析为A站弹幕。

### 参数

- `--out {输出文件}`：使用该参数时将输出保存至参数指定的文件，不使用该参数则将字幕文件内容打印在命令行上。

## 程序调用（尚未实现）

同样可以使用程序进行调用：

```javascript
import {bilibili} from 'danmaku-to-ass';
import {readFileSync} from 'fs';

let text = readFileSync('bilibili.xml', 'utf-8');
let ass = bilibili(text);
```
