import {getLteCtrl, getLteCtrlMap} from "../tcp/LTEControllers";

export const Hello = () => {
    return [null, 'hello'];
};

export const SetAutoModEarfcn = (data) => {
    for (const host in data) {
        const {dlEarfcnList, earfcnAutoModing, modInterval} = data[host];
        const lteCtrl = getLteCtrl(host);
        lteCtrl.setModEarfcnInfo(dlEarfcnList, modInterval);
        if (earfcnAutoModing) {
            lteCtrl.startAutoModEarfcn();
        }
        else {
            lteCtrl.stopAutoModEarfcn();
        }
    }
    return [null, null];
};
