import { OperatorInfos } from '../define/LTEProto';

const s130 = '^46001(\\d{3})(\\d)[0,1]\\d+';
const s131 = '^46001(\\d{3})(\\d)9\\d+';
const s132 = '^46001(\\d{3})(\\d)2\\d+';
const s134 = '^460020(\\d)(\\d{3})\\d+';
const s13x0 = '^46000(\\d{3})([5,6,7,8,9])\\d+';
const s13x = '^46000(\\d{3})([0,1,2,3,4])(\\d)\\d+';
const s150 = '^460023(\\d)(\\d{3})\\d+';
const s151 = '^460021(\\d)(\\d{3})\\d+';
const s152 = '^460022(\\d)(\\d{3})\\d+';
const s155 = '^46001(\\d{3})(\\d)4\\d+';
const s156 = '^46001(\\d{3})(\\d)3\\d+';
const s157 = '^460077(\\d)(\\d{3})\\d+';
const s158 = '^460028(\\d)(\\d{3})\\d+';
const s159 = '^460029(\\d)(\\d{3})\\d+';
const s147 = '^460079(\\d)(\\d{3})\\d+';
const s185 = '^46001(\\d{3})(\\d)5\\d+';
const s186 = '^46001(\\d{3})(\\d)6\\d+';
const s187 = '^460027(\\d)(\\d{3})\\d+';
const s188 = '^460078(\\d)(\\d{3})\\d+';
const s1705 = '^460070(\\d)(\\d{3})\\d+';
const s170x = '^46001(\\d{3})(\\d)8\\d+';
const s178 = '^460075(\\d)(\\d{3})\\d+';
const s145 = '^46001(\\d{3})(\\d)7\\d+';
const s182 = '^460026(\\d)(\\d{3})\\d+';
const s183 = '^460025(\\d)(\\d{3})\\d+';
const s184 = '^460024(\\d)(\\d{3})\\d+';
// 电信的，下面的还没有找到规则
const s180 = '^46003(\\d)(\\d{3})7\\d+';
const s153 = '^46003(\\d)(\\d{3})8\\d+';
const s189 = '^46003(\\d)(\\d{3})9\\d+';

function compile(reg, imsi) {
  const re = new RegExp(reg);
  const matcher = re.exec(imsi);
  const str = [];
  if (matcher !== null) {
    matcher.shift();
    for (let i = 0; i < matcher.length; i += 1) {
      str.push(matcher[i]);
    }
  }
  return str;
}

function getPhoneNum(imsi) {
  let result = compile(s130, imsi);
  if (result != null && result.length === 2) {
    return `130${result[1]}${result[0]}`;
  }
  result = compile(s131, imsi);
  if (result != null && result.length === 2) {
    return `131${result[1]}${result[0]}`;
  }
  result = compile(s132, imsi);
  if (result != null && result.length === 2) {
    return `132${result[1]}${result[0]}`;
  }
  result = compile(s134, imsi);
  if (result != null && result.length === 2) {
    return `134${result[0]}${result[1]}`;
  }
  result = compile(s13x0, imsi);
  if (result != null && result.length === 2) {
    return `13${result[1]}0${result[0]}`;
  }
  result = compile(s13x, imsi);
  if (result != null && result.length === 3) {
    return `13${parseInt(result[1], 10) + 5}${result[2]}${result[0]}`;
  }
  result = compile(s150, imsi);
  if (result != null && result.length === 2) {
    return `150${result[0]}${result[1]}`;
  }
  result = compile(s151, imsi);
  if (result != null && result.length === 2) {
    return `151${result[0]}${result[1]}`;
  }
  result = compile(s152, imsi);
  if (result != null && result.length === 2) {
    return `152${result[0]}${result[1]}`;
  }
  result = compile(s155, imsi);
  if (result != null && result.length === 2) {
    return `155${result[1]}${result[0]}`;
  }
  result = compile(s156, imsi);
  if (result != null && result.length === 2) {
    return `156${result[1]}${result[0]}`;
  }
  result = compile(s157, imsi);
  if (result != null && result.length === 2) {
    return `157${result[0]}${result[1]}`;
  }
  result = compile(s158, imsi);
  if (result != null && result.length === 2) {
    return `158${result[0]}${result[1]}`;
  }
  result = compile(s159, imsi);
  if (result != null && result.length === 2) {
    return `159${result[0]}${result[1]}`;
  }
  result = compile(s147, imsi);
  if (result != null && result.length === 2) {
    return `147${result[0]}${result[1]}`;
  }
  result = compile(s185, imsi);
  if (result != null && result.length === 2) {
    return `185${result[1]}${result[0]}`;
  }
  result = compile(s186, imsi);
  if (result != null && result.length === 2) {
    return `186${result[1]}${result[0]}`;
  }
  result = compile(s187, imsi);
  if (result != null && result.length === 2) {
    return `187${result[0]}${result[1]}`;
  }
  result = compile(s188, imsi);
  if (result != null && result.length === 2) {
    return `188${result[0]}${result[1]}`;
  }
  result = compile(s1705, imsi);
  if (result != null && result.length === 2) {
    return `170${result[0]}${result[1]}`;
  }
  result = compile(s170x, imsi);
  if (result != null && result.length === 2) {
    return `170${result[1]}${result[0]}`;
  }
  result = compile(s178, imsi);
  if (result != null && result.length === 2) {
    return `178${result[0]}${result[1]}`;
  }
  result = compile(s145, imsi);
  if (result != null && result.length === 2) {
    return `145${result[1]}${result[0]}`;
  }
  result = compile(s182, imsi);
  if (result != null && result.length === 2) {
    return `182${result[0]}${result[1]}`;
  }
  result = compile(s183, imsi);
  if (result != null && result.length === 2) {
    return `183${result[0]}${result[1]}`;
  }
  result = compile(s184, imsi);
  if (result != null && result.length === 2) {
    return `184${result[0]}${result[1]}`;
  }
  result = compile(s180, imsi);
  if (result != null && result.length === 2) {
    return `180${result[0]}${result[1]}`;
  }
  result = compile(s153, imsi);
  if (result != null && result.length === 2) {
    return `153${result[0]}${result[1]}`;
  }
  result = compile(s189, imsi);
  if (result != null && result.length === 2) {
    return `189${result[0]}${result[1]}`;
  }
  return '';
}

const getCarrieroperator = (imsi) => {
  if (imsi === '') {
    return OperatorInfos.OTHER;
  }
  const MNC = imsi.substring(3, 5);
  if (MNC === '00' || MNC === '02' || MNC === '07' || MNC === '08' || MNC === '02' || MNC === '04') {
    return OperatorInfos.CMCC;
  }
  if (MNC === '01' || MNC === '06' || MNC === '09') {
    return OperatorInfos.CUCC;
  }
  if (MNC === '03' || MNC === '05' || MNC === '11') {
    return OperatorInfos.CTCC;
  }
  return OperatorInfos.OTHER;
};

function attachOperatorToUEList (ueList) {
  if (ueList && Array.isArray(ueList)) {
    for (const ue of ueList) {
      ue.operatorName = getCarrieroperator(ue.IMSI).text;
      ue.phoneNum = getPhoneNum(ue.IMSI);
    }
    return ueList;
  }
  return [];
}

/**
 * 检测imsi是否合法
 * @param imsi
 * @return {boolean|boolean}
 */
export function checkIMSI(imsi) {
  return typeof imsi === "string" && imsi.length === 15 && (!Number.isNaN(parseInt(imsi, 10)));
}

export {
  getCarrieroperator,
  getPhoneNum,
  attachOperatorToUEList,
};