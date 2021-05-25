import fs from 'fs';
import path from 'path';
import defaultConfig from './default.json';
import {mkdirsMultiDirSync} from '../utils/tools';

let config = defaultConfig;
const configLocalFilePath = defaultConfig.configLocalFilePath;

function initConfig() {
    try {
        mkdirsMultiDirSync(path.dirname(configLocalFilePath));
        const fileConfig = JSON.parse(fs.readFileSync(configLocalFilePath, 'utf-8'));
        config = {
            ...defaultConfig,
            ...fileConfig
        };
    } catch (err) {
        if (err) {
            console.error(err);
        }
    }
    fs.writeFileSync(configLocalFilePath, JSON.stringify(config));
}

initConfig();

function setCfg(cfgObj) {
    for (let key in cfgObj) {
        config[key] = cfgObj[key];
    }
    fs.writeFileSync(configLocalFilePath, JSON.stringify(config));
}

export default {
    ...config,
    // 如果需要动态更新配置，同时添加setter和getter方法
    get lteCellInfo() {
        return config.lteCellInfo;
    },
    set lteCellInfo(value) {
        setCfg({lteCellInfo: value});
    }
};
