import info from './info';
import style from './style';
import event from './event';

export default (list, config, context) => {
    let content = [
        info(config, context),
        style(config),
        event(list, config)
    ];

    return content.join('\n\n');
};
