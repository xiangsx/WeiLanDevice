import {Struct} from "struct";

/**
 * @readonly
 * @enum {string}
 */
export const STRUCT_TYPE = {
    word8: 'word8',
    word8Sbe: 'word8Sbe',
    word8Sle: 'word8Sle',
    word8Ube: 'word8',
    word8Ule: 'word8',
    word16Sbe: 'word16Sbe',
    word16Sle: 'word16Sle',
    word16Ube: 'word16Ube',
    word16Ule: 'word16Ule',
    word24Sbe: 'word24Sbe',
    word24Sle: 'word24Sle',
    word24Ube: 'word24Ube',
    word24Ule: 'word24Ule',
    word32Sbe: 'word32Sbe',
    word32Sle: 'word32Sle',
    word32Ube: 'word32Ube',
    word32Ule: 'word32Ule',
    word48Sbe: 'word48Sbe',
    word48Sle: 'word48Sle',
    word48Ube: 'word48Ube',
    word48Ule: 'word48Ule',
    word64Sbe: 'word64Sbe',
    word64Sle: 'word64Sle',
    word64Ube: 'word64Ube',
    word64Ule: 'word64Ule',
    array: 'array',
    chars: 'chars',
    charsnt: 'charsnt',
    doublebe: 'doublebe',
    doublele: 'doublele',
    floatbe: 'floatbe',
    floatle: 'floatle',
    struct: 'struct',
};

// eslint-disable-next-line import/prefer-default-export
export class MsgStruct {
    /**
     * @description 此处传入的参数定义格式为[[type,fieldName,[options..]]...]
     * @param defineArr 结构体定义
     */
    constructor (defineArr) {
        this._defineArr = defineArr;
        this._struct = this.getStruct();
        this.length = this._struct.allocate().buffer().length;
    }

    static CustomStruct = Struct;

    getStruct () {
        let msgStruct = Struct();
        for (const value of this._defineArr) {
            const type = value[0];
            const fieldName = value[1];
            const optionArr = value[2] || [];
            if (type && fieldName) {
                if (type === STRUCT_TYPE.struct) {
                    if (optionArr.length === 1) {
                        const innerMsgStruct = optionArr[0];
                        if (innerMsgStruct instanceof MsgStruct) {
                            msgStruct = msgStruct[type](fieldName, innerMsgStruct.getStruct());
                        }
                        else {
                            // eslint-disable-next-line max-len
                            console.log(`inner struct define invalid,please input custom MsgStruct,err define :${this._defineArr}`);
                        }
                    }
                    else {
                        console.error(`msg struct define invalid, invalid struct :${JSON.stringify(this._defineArr)}`)
                    }
                }
                // else if (type === STRUCT_TYPE.array) {
                //     if (optionArr >= 2) {
                //         console.error('do not define struct contains type array')
                //     }
                //     else {
                //         // eslint-disable-next-line max-len
                //         console.error(`invalid struct define with array, error in length option list,error define
                //         :${this._defineArr}`)
                //     }
                // }
                else {
                    msgStruct = msgStruct[type](fieldName, ...optionArr);
                }
            }
            else {
                console.error(
                    `msg struct define error，fieldName:[${fieldName}],type:[${type}],optionArr:[${optionArr}]`);
            }
        }
        return msgStruct;
    }

    /**
     * 获取对应的结构体
     * @param buffer
     */
    getObj (buffer) {
        // 这里不判断是否buffer 为Buffer类型了
        this._struct._setBuff(buffer);
        return this._struct.fields;
    }


    /**
     * 获取buff
     * @param {Object} obj
     * @returns {Buffer}
     */
    getBuff (obj) {
        // todo 验证struct类型传入能否正确转换
        this._struct.set(obj);
        return this._struct.buffer();
    }
}