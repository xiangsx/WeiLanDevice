'use strict';
/**
 * @typedef EnumErrorDefine
 */
const EnumErrorDefine = {
    SUCCESS: 0,
    ERR_UNKNOWN: -1
};
/**
 * @type {Map<EnumErrorDefine|number, {msg:string}>}
 */
const ErrorMap = new Map();
ErrorMap.set(EnumErrorDefine.SUCCESS, {msg: 'ok'});
ErrorMap.set(EnumErrorDefine.ERR_UNKNOWN, {msg: '未知错误'});

module.exports = {
    EnumErrorDefine,
    ErrorMap,
};
