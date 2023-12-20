const fs = require(`fs`)

/** 获取图片base64地址 */
const convertImageToBase64 = (msg) => {
    msg.on('iconPath', (path) => {
        const [filePath] = path;
        try {
            // 读取文件数据
            const fileData = fs.readFileSync(filePath);
            // 将文件数据转换为base64编码的字符串
            const base64String = Buffer.from(fileData).toString('base64');
            msg.emit('iconBase64', base64String);
        } catch (error) {
            console.error('Error:', error);
            msg.emit('iconBase64', '');
        }
    })
}

module.exports = {
    convertImageToBase64
}