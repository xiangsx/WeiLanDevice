import {getLteCtrl} from "../tcp/LTEControllers";
import {EnumErrorDefine} from "../../define/error";

const configMap = new Map();
export const Hello = () => {
    return [null, 'hello'];
};

/**
 * 统一处理key
 * @param data
 * @return {number[]|*}
 * @constructor
 */
export const HandleConfig = (data) => {
    const {configKey, configData} = data;
    if (configKey) {
        if (!Number.isNaN(parseInt(configKey))) {
        }
        else {
            if (configMap.has(configKey)) {
                return configMap.get(configKey)(configData);
            }
        }
    }
    else {
        console.warn(`invalid configKey [${configKey}]`);
    }
    return [EnumErrorDefine.ERR_INVALID_CONFIG_KEY];
};

configMap.set('SetAutoModEarfcn', (data) => {
    const {dlEarfcnList, earfcnAutoModing, modInterval, host} = data;
    const lteCtrl = getLteCtrl(host);
    lteCtrl.setModEarfcnInfo({
        earfcnAutoModing: !!earfcnAutoModing,
        dlEarfcnList: dlEarfcnList.map(item => parseInt(item)).filter(item => Number.isInteger(item)),
        modInterval: parseInt(modInterval)
    });
    return [null, null];
});
