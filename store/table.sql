CREATE TABLE IF NOT EXISTS ue (
    IMSI CHAR(17) NOT NULL DEFAULT '',
    IMEI CHAR(17) NOT NULL DEFAULT '',
    RSSI INT NOT NULL DEFAULT 0,
    prtTime INT NOT NULL DEFAULT 0,
    earfcn INT NOT NULL DEFAULT 0
);