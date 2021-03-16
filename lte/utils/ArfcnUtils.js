import earfcnList from './earfcn.json';
import {OperatorInfos, MAX_PCI, MAX_TAC, MAX_CELL_ID} from '../define/LTEProto'

/**
 * 获取频点对应的信息
 * @param earfcn 频点
 * @return {{band:number,FDL_low:number,NOffs_DL:number,
 * NDL_min:number,NDL_max:number,FUL_low:number,NOffs_UL:number,NUL_min:number,NUL_max:number}|{}}
 */
function getEarfcnInfo (earfcn) {
    // eslint-disable-next-line
    for (const band in earfcnList) {
        const info = earfcnList[band];
        if (info.NDL_min <= +earfcn && info.NDL_max >= +earfcn) {
            return info;
        }
    }
    return undefined;
}

export function getFrequencyFromEarfcn(earfcn) {
    if (typeof earfcn === 'number') {
        const info = getEarfcnInfo(earfcn);
        if (!info) {
            return undefined;
        }
        const {NOffs_DL, FDL_low} = info;
        if (NOffs_DL !== undefined && FDL_low !== undefined) {
            return (earfcn - NOffs_DL) / 10 + FDL_low;
        }
        return undefined;
    }
    return undefined;
}

/**
 *
 * @param frequency
 * @return {OperatorInfo|undefined} 存在对应运营商则返回，不存在返回undefined
 */
export function getOperatorFromFrequency(frequency) {
    if (typeof frequency === 'number') {
        // eslint-disable-next-line
        for (const operator in OperatorInfos) {
            const info = OperatorInfos[operator];
            for (const range of info.frequencyRange) {
                if (frequency >= range[0] && frequency <= range[1]) {
                    return info;
                }
            }
        }
    }
    return undefined;
}

/**
 * @param dlEarfcn
 * @return {OperatorInfo|undefined}
 */
export function getOperatorFromEarfcn(dlEarfcn) {
    if (typeof dlEarfcn === "number") {
        return getOperatorFromFrequency(getFrequencyFromEarfcn(dlEarfcn));
    }
    return undefined;
}

/**
 * 获取频点对应的band
 * @param earfcn 频点
 * @return {number|undefined} 如果存在频点对应的band则返回，不存在则返回undefined
 */
// eslint-disable-next-line import/prefer-default-export
export function getBandFromEarfcn(earfcn) {
    const info = getEarfcnInfo(earfcn);
    if (info) {
        return info.band;
    }
    console.warn(`ArfcnUtils.getBandFromEarfcn failed , invalid earfcn :[${earfcn}]`);
    return undefined;
}

export function getOtherDataByEarfcn (earfcn) {
    const dlEarfcn = +earfcn;
    if (dlEarfcn.isNaN) {
        return undefined;
    }
    const Band = getBandFromEarfcn(dlEarfcn);
    if (!Band) {
        return undefined;
    }
    const frequency = getFrequencyFromEarfcn(dlEarfcn);
    if (!frequency) {
        return undefined;
    }
    const operatorInfo = getOperatorFromFrequency(frequency);
    if (!operatorInfo) {
        return undefined;
    }
    const PLMN = String(operatorInfo.PLMNList[0]);
    return { Band: String(Band) || '', PLMN: PLMN || '' };
}

export const getPLMNFormEarfcn = (earfcn) => {
    const dlEarfcn = +earfcn;
    if (dlEarfcn.isNaN) {
        return undefined;
    }
    const frequency = getFrequencyFromEarfcn(+dlEarfcn);
    if (!frequency) {
        return undefined;
    }
    const operatorInfo = getOperatorFromFrequency(frequency);
    if (!operatorInfo) {
        return undefined;
    }
    return operatorInfo.PLMNList[0];
};

/**
 * 获取随机TAC
 * @return {number}
 */
export function getRandomTAC () {
    return Math.floor(Math.random() * MAX_TAC);
}

/**
 * 获取随机PCI
 * @return {number}
 */
export function getRandomPCI () {
    return Math.floor(Math.random() * MAX_PCI);
}

/**
 * 获取随机cellID
 * @return {number}
 */
export function getRandomCellID () {
    return Math.floor(Math.random() * MAX_CELL_ID)
}