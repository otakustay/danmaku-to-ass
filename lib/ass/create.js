import info from './info';
import style from './style';
import event from './event';
import raw from './raw';

export default (list, config, context = {}) => {
    let content = [
        info(config, context),
        style(config),
        event(list, config)
    ];

    if (config.includeRaw) {
        content.push(raw(list, config, context));
    }

    return content.join('\n\n') + '\n';
};
