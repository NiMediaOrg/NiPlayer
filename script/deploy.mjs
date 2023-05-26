//TODO 控制项目的github线上部署
import sh from "shelljs"
import ora from "ora";
import inquirer from "inquirer"
import { fileURLToPath } from "url";
import { createRequire } from 'module'

const __dirname = fileURLToPath(new URL(".", import.meta.url))
// 在esm模块中自定义使用cjs才存在的模块导入方法 -- require
const require = createRequire(import.meta.url)
const exec = sh.exec;
let commitMessage = "";
console.log("----------------git add . -----------------")
let spinner = ora("正在执行git add方法").start();
try {
    await exec("git add .");
    spinner.succeed("成功执行git add");
} catch(e) {
    console.log(error, "error");
} finally {
    spinner.stop();
}

console.log("----------------git commit----------------");
try {
    const answer = await inquirer.prompt({
        type: "input",
        name: "commit",
        message: "输入你的commit message",
        default: "update: tiny update"
    })
    commitMessage = answer;
} catch(error) {
    console.error(`发生错误： ${error}`);
}

spinner = ora("正在执行git commit方法").start();
try {
    exec(` git commit -am "${commitMessage}" `);
    spinner.succeed("成功执行git commit");
} catch(error) {
    console.error(`发生错误： ${error}`);
} finally {
    spinner.stop();
}

console.log("--------------git push------------------");
const branchList = exec("git branch -r");
console.log("@@@", branchList)