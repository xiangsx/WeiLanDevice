import Config from '../config/config';

export function getOfflineUEList() {
    let lenNow = Config.ueList.length;
    if (lenNow > 100){
        lenNow = 100;
    }
    const rows = Config.ueList.slice(0, lenNow);
    return {
        rows,
        deleteRows: () => {
            Config.ueList = Config.ueList.slice(lenNow, Config.ueList.length);
        }
    };
}

export function saveOfflineUE(list) {
    Config.ueList = Config.ueList.concat(list);
    return Config.ueList.length;
}

if (require.main === module) {
    const {rows, deleteRows} = getOfflineUEList();
    console.log(rows.length);
}
