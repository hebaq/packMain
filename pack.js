const cp = require(`child_process`)
const fs = require(`fs`)

const defaultIcon = `${__dirname}\\app\\favicon.ico` // 图标

new Sys().then(async main => {
    const msg = new main.Msg();
    msg.on('pack', async (info) => {
        const { out, file, icon } = info[0];
        const cmd = `lib\\winrar a -r -ep1 -inul -ibck -y -sfx -iicon"${icon || defaultIcon}" -z"${getComment()}" ${out} ${file}`
        try {
            await main.ws.call(`run`, [
                `
                var arg = ...
                var prcs = process.popen(arg)
                var text = prcs.readAll() // 读取命令所有输出
                return text // 把数据抛给 js
                `, cmd])
        } catch (error) {
            console.log('error', error);
        }
        msg.emit('finish');
    })
})

function getComment() {
    const toPath = `app_${Date.now()}` // 解压到哪里
    const os = require(`os`)
    const comment = `${os.tmpdir}/comment.txt`
    fs.writeFileSync(comment, `
    Path=${toPath}
    Setup=main
    Silent=1
    Overwrite=1
    Update=U
  `.split(`\n`).map(item => item.trim()).join(`\n`).trim())
    return comment
}