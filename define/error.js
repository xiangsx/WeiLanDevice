'use strict';
/**
 * @typedef EnumErrorDefine
 */
export const EnumErrorDefine = {
    SUCCESS: 0,
    ERR_UNKNOWN: -1
};
/**
 * @type {Map<EnumErrorDefine|number, {msg:string}>}
 */
export const ErrorMap = new Map();
ErrorMap.set(EnumErrorDefine.SUCCESS, {msg: 'ok'});
ErrorMap.set(EnumErrorDefine.ERR_UNKNOWN, {msg: '设备未知错误'});
