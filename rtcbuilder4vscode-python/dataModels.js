const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class GeneratedResult {
    constructor() {
        this.name = '';
        this.mode = '';
        this.code = '';
        this.isNotBom = false;
        this.canMerge = false;
        this.original = '';
        this.encode = 'utf-8';
    }
}

class IdlFileParam {
    constructor({ idlPath = '', parent = ''} = {}) {
        this.idlPath = idlPath;
        this.parent = parent;
        this.targetTypes = [];
        this.isDataPort = false;
        this.includeIdlPathes = [];
        this.idlSearchPathes = [];
        this.serviceClass = [];
        this.testServiceClass = [];
    }
    getIdlFile() {
        if (!this.idlPath || this.idlPath.trim() === '') {
            return '';
        }

        const parts = this.idlPath.split(/[\\/]/);
        return parts[parts.length - 1];
    }

    async checkDefault() {
        const defaultPath = await getRtmRoot();
        return this.idlPath.startsWith(defaultPath);
    }

    getIdlFileNoExt() {
        const parts = this.idlPath.split(/[\\/]/);
        const fileName = parts[parts.length - 1];
        const index = fileName.lastIndexOf('.');

        if (index > 0 && index < fileName.length - 1) {
            return fileName.substring(0, index);
        }

        return "";
    }

}

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
  GeneratedResult,
  IdlFileParam
};
