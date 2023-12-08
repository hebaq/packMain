const cp = require(`child_process`)
const fs = require(`fs`)

console.log(`构建相关文件`)
cp.execSync(`npx shx rm -rf dist`, {stdio: `inherit`})

cp.execSync(`npx shx mkdir dist`, {stdio: `inherit`})
cp.execSync(`npm run vue:build`, {stdio: `inherit`})

fs.writeFileSync(`dist/package.json`, JSON.stringify({
  "page": "index.html",
}, null, 2))

cp.execSync(`npx shx cp main.exe dist/main.exe `, {stdio: `inherit`})
cp.execSync(`npx shx cp -r rar dist/rar `, {stdio: `inherit`})

console.log(`打包 exe`) // 调用 rar 打包成单 exe


