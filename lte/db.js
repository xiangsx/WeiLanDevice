import Config from '../config/config';

export function getOfflineUEList() {
    let lenNow = Config.ueList.length;
    if (lenNow > Config.maxOfflineUploadSize){
        lenNow = Config.maxOfflineUploadSize;
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
    if (Config.ueList.length >= Config.maxOfflineSize) {
        Config.ueList = Config.ueList.slice(Config.ueList.length - Config.maxOfflineSize, Config.ueList.len);
    }
    // console.log(Config.ueList.length, Buffer.from(JSON.stringify(Config.ueList)).length,
    //     Buffer.from(JSON.stringify(Config.ueList)).length / Config.ueList.length);
    return Config.ueList.length;
}

if (require.main === module) {
    const {rows, deleteRows} = getOfflineUEList();
    console.log(rows.length);
}
