import Handlebars from "handlebars";

// todo: 使用模板解析变量
Handlebars.registerHelper('split', function(text: string, separator, trim: boolean) {
    let list = text.split(separator);
    if (trim) {
        list = list.map(item => item = item.trim());
    }
    return list;
})

function parseTemplate(template: string, context: any) {
    const compiled = Handlebars.compile(template);
    const parsed = compiled(context);
    return parsed;
}

export {
    parseTemplate,
}