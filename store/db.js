import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {table} from './dbInit';

const dbPath = path.join(__dirname, './ss.db');
const tableSqlPath = path.join(__dirname, './table.sql');

const db = new Database(dbPath, {verbose: console.debug});

export function initDB() {
    db.exec(table);
}

export function getOfflineUEList() {
    const now = new Date().getTime();
    const stmt = db.prepare('SELECT * from ue where prtTime <= ?');
    const rows = stmt.all(now);
    return {
        rows,
        deleteRows: () => {
            try {
                const stmt = db.prepare('DELETE FROM ue WHERE prtTime <= ?');
                return stmt.run(now).changes;
            } catch (e) {
                if (e) {
                    console.error('delete data failed, error = ', e);
                    return 0;
                }
            }
        }
    };
}

export function saveOfflineUE(ueList) {
    try {
        const stmt = db.prepare('INSERT INTO UE (IMSI,IMEI,RSSI,prtTime) VALUES (@IMSI,@IMEI,@RSSI,@prtTime)');
        for (const ueInfo of ueList) {
            stmt.run(ueInfo);
        }
        return ueList.length;
    } catch (err) {
        if (err) {
            console.error('saveOfflineUE failed, err = ', err);
            return 0;
        }
    }
}

if (require.main === module) {
    initDB();
    const {rows, deleteRows} = getOfflineUEList();
    console.log(rows.length);
}