interface CSSConstructor {
    (template: TemplateStringsArray, ...spans: string[]): string;
}

export const css: CSSConstructor = (template, ...spans) => {
    let str = template.join('${}');
    let index = 0;
    const regExp = /.*\${}.*/g
    while(regExp.test(str)) {
        str = str.replace('${}', spans[index++]);
    }

    return str;
}