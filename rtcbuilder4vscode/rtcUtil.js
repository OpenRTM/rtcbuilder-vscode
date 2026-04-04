const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getRtmRoot() {
    const isWindows = process.platform === 'win32';
    let rtm_dir;
    if(isWindows) {
        rtm_dir = process.env.RTM_ROOT;
    } else {
        try {
            const { stdout, stderr } = await exec('rtm2-config --rtm-includedir');
            rtm_dir = stdout.trim();
        } catch {
            rtm_dir = "";
        }
    }
    return rtm_dir;
}

module.exports = {
  getRtmRoot
};
