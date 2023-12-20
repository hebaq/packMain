const { convertImageToBase64 } = require('./util');
const { pack } = require('./pack');

new Sys().then(main => {
    run(main);
})

const run = (main) => {
    const msg = new main.Msg();

    // 注册图片获取
    convertImageToBase64(msg);

    // 注册打包
    pack(main, msg);
}