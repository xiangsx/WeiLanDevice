import fs from 'fs';
import path from 'path';
import defaultConfig from './default.json';
import {mkdirsMultiDirSync} from '../utils/tools';

let config = defaultConfig;
const configLocalFilePath = defaultConfig.configLocalFilePath;
let configRunFilePath = defaultConfig.configRunFilePath[process.env.PN];

function initConfig() {
    try {
        for (const filePath of configLocalFilePath) {
            if (fs.existsSync(filePath)) {
                const thisConf = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                config = {
                    ...config,
                    ...thisConf,
                };
            }
        }
        mkdirsMultiDirSync(path.dirname(configRunFilePath));
        const runConfig = JSON.parse(fs.readFileSync(configRunFilePath, 'utf-8'));
        config = {
            ...config,
            ...runConfig,
        };
    } catch (err) {
        if (err) {
            console.error(err);
        }
    }
    fs.writeFileSync(configRunFilePath, JSON.stringify(config));
}

initConfig();

function setCfg(cfgObj) {
    for (let key in cfgObj) {
        config[key] = cfgObj[key];
    }
    fs.writeFileSync(configRunFilePath, JSON.stringify(config));
}

export default {
    ...config,
    // 如果需要动态更新配置，同时添加setter和getter方法
    get lteCellInfo() {
        return config.lteCellInfo;
    },
    set lteCellInfo(value) {
        setCfg({lteCellInfo: value});
    },
    get ueList() {
        return config.ueList || [];
    },
    set ueList(value) {
        setCfg({ueList: value});
    },
};
