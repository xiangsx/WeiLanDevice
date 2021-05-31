import path from 'path';
import Config from '../config/config';

const dbPath = path.join(__dirname, './ss.db');

let db;

export function getOfflineUEList() {
    const lenNow = Config.ueList.length;
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
