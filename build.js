const cp = require(`child_process`)
const fs = require(`fs`)

console.log(`构建相关文件`)
cp.execSync(`npx shx rm -rf dist`, {stdio: `inherit`})

cp.execSync(`npx shx mkdir dist`, {stdio: `inherit`})
cp.execSync(`npm run vue:build`, {stdio: `inherit`})

fs.writeFileSync(`dist/package.json`, JSON.stringify({
  "page": "index.html",
  "main": "node/index.js",
}, null, 2))

cp.execSync(`npx shx cp main.exe dist/main.exe `, {stdio: `inherit`})
cp.execSync(`npx shx cp -r lib dist/lib `, {stdio: `inherit`})

// 打包node
cp.execSync(`npm run node:build`, {stdio: `inherit`})
cp.execSync(`npx shx mkdir dist/node`, {stdio: `inherit`})
cp.execSync(`npx shx cp -r node/dist/index.js dist/node/index.js `, {stdio: `inherit`})

console.log(`打包 exe`) // 调用 rar 打包成单 exe


