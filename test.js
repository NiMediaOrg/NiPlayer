let p1 = Promise.resolve("111");
let p2 = Promise.reject("error");

Promise.all([p1,p2]).then((res)=>{
    console.log(res);
},(err)=>{
    console.log(err)
})