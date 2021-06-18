import {exec} from 'child_process';

export const execCMD = async (data) => {
    const {cmd} = data;
    return new Promise(resolve => {
        exec(cmd, {encoding: 'utf-8'}, function (err, stdout) {
            if (err) {
                console.error(err);
            }
            console.debug(`input: ${cmd},output: ${stdout}`);
            resolve(stdout)
        });
    });
};
