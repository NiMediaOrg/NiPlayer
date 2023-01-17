let str = "$Number$-header-$Number$-$ID$-m4s"

let reg = /\$(.+?)\$/ig

while(r = reg.exec(str)) {
    console.log(r)
}