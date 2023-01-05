
export function formatDate(date: any, fmt = 'yyyy-mm-dd') {
    const d = new Date(date);
    const o: any = {
        'y+': d.getFullYear() + '',  //年
        'm+': d.getMonth() + 1 + '', // 月
        'd+': d.getDate() + '', // 日
    }
    let res = fmt;
    for (let k in o) {
        let reg = new RegExp(`(${ k })`);
        if (reg.test(fmt)) {
            let replacement = o[k].padStart(RegExp.$1.length, '0');
            res = res.replace(reg, replacement);
        }
    }
    return res
}
