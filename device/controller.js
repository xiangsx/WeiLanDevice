import {execCMD} from "../utils/shell";

export function Hello(data) {
    return [null, `recv:${JSON.stringify(data)}, hello`];
}

export async function Exec(data) {
    return [null,await execCMD(data)];
}
