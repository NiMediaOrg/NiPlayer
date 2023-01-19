const p = new Promise((res,rej)=>{
    setTimeout(()=>{
        console.log("111")
    })

    console.log("222")
})

Promise.resolve("123").then(()=>{
    console.log("3333")
})

process.nextTick(()=>{
    console.log("4444")
})

console.log("555");