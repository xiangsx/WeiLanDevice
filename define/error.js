'use strict';
/**
 * @typedef EnumErrorDefine
 */
export const EnumErrorDefine = {
    SUCCESS: 0,
    ERR_UNKNOWN: -1,
    ERR_LTE_DISCONNECTED: -2,
    ERR_LTE_STATUS_EXCEPTION: -3,
    ERR_LTE_QUERY_TIMEOUT: -4,
    ERR_WS_DISCONNECTED: -100,
};
/**
 * @type {Map<EnumErrorDefine|number, {msg:string}>}
 */
export const ErrorMap = new Map();
ErrorMap.set(EnumErrorDefine.SUCCESS, {msg: 'ok'});
ErrorMap.set(EnumErrorDefine.ERR_UNKNOWN, {msg: '设备未知错误'});
ErrorMap.set(EnumErrorDefine.ERR_LTE_DISCONNECTED, {msg: '设备断开连接'});
ErrorMap.set(EnumErrorDefine.ERR_LTE_STATUS_EXCEPTION, {msg: '当前状态不允许发送此消息'});
ErrorMap.set(EnumErrorDefine.ERR_LTE_QUERY_TIMEOUT, {msg: '设备回复超时'});
ErrorMap.set(EnumErrorDefine.ERR_WS_DISCONNECTED, {msg: 'socketio连接断开'});
