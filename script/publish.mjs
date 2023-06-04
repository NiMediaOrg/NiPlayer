//TODO 控制整个包的发版脚本
import sh from "shelljs"
import ora from "ora";
import fs from "fs-extra"
import { compareVersion } from "./compare.mjs";

const cwd = process.cwd();
const { argv } = process;
// 获取到命令行中传入的版本参数
const version = argv[2].split("=")[1];

//TODO 开始发布包的最新版本
const publish = () => {
    let pkg = fs.readJSONSync(`${cwd}/package.json`);
    const currentVersion = pkg.version;
    const newVersion = version;
    if(compareVersion(newVersion, currentVersion) === 1) {
        pkg = {
            ...pkg,
            version: newVersion
        }
        const writeData = JSON.stringify(pkg, null ,2);
        fs.writeFileSync(`${cwd}/packages/quark-react/package.json`, writeData);
        console.warn("已同步最新 NiPlayer 版本");

        const spinner = ora("loading ~~~~").start();
        try {
            console.log("-----------------------开始发版-------------------------");
            sh.exec("npm publish");
            spinner.succeed("~~");
        } catch (error) {
            console.log(error, "error");
        }
        spinner.stop();
    } else {    
        console.warn('最新发布的版本大小不能低于当前版本');
    }   
    
}

publish();