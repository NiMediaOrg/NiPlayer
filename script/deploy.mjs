//TODO 控制项目的github线上部署
import sh from "shelljs"
import ora from "ora";
import inquirer from "inquirer"

const exec = sh.exec;
let spinner = null;

//TODO 执行git add .
async function gitAdd() {
    console.log("----------------git add . -----------------")
    let spinner = ora("正在执行git add方法").start();
    try {
        exec("git add .");
        spinner.succeed("成功执行git add");
    } catch(e) {
        console.log(error, "error");
    } finally {
        spinner.stop();
    }
}
//TODO 执行git commit -m ""
async function gitCommit() {
    let commitMessage = "";
    console.log("----------------git commit----------------");
    try {
        const answer = await inquirer.prompt({
            type: "input",
            name: "commit",
            message: "输入你的commit message",
            default: "update: tiny update"
        })
        commitMessage = answer.commit;
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
}

//TODO 执行git push origin xxx脚本
async function gitPush() {
    console.log("--------------git push------------------");
    const branchList = exec("git branch -r");
    const list = branchList["stdout"].split("\n").map(str => str.trim().replace("origin/", "")).filter(str => str !== '');
    let choiceBranch = "";
    try {
        const { branck: choiceBranch } = await inquirer.prompt({
            type: "list",
            name: "branck",
            message: "选择你要push的分支",
            choices: [...list],
            default: "dev"
        })
    } catch(error) {
        console.error(`发生错误： ${error}`);
    }
    spinner = ora("正在执行git push方法").start();
    try {
        console.log("你选择的分支是", choiceBranch)
        exec(`git push origin ${choiceBranch}`);
        spinner.succeed("成功执行git push");
    } catch(error) {
        console.error(`发生错误： ${error}`);
    } finally {
        spinner.stop();
    }
}

async function deploy() {
    await gitAdd();
    await gitCommit();
    await gitPush();
    console.log("项目deploy成功！！！")
}

deploy();