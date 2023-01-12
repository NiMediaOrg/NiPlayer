let s = "$RepresentationID$-270146-i-$Number$.m4s";

function generateTemplate(s) {
    let splitStr = [];
    let format = [];
    for(let i=0;i<s.length;i++) {
        let str = s.slice(0,i+1);
        if(/\$.+?\$/.test(str)) {
            format.push(str.match(/\$(.+?)\$/)[1]);
            splitStr.push(str.replace(/\$.+?\$/,""),"%format%");
            s = s.slice(i+1);
            i = 0;
            continue;
        }
    }

    return {splitStr,format};
}

console.log(generateTemplate(s));