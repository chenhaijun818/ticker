export function getRandomString() {
    return (Date.now() * 1000 + ~~(Math.random() * 1000)).toString(36);
}
