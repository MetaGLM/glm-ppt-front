const context = require.context('./modules', true, /\.js$/)
// 获取moudules文件下所有js文件；
const moduleStores = {}

context.keys().forEach(key => {
  const fileName = key.slice(key.lastIndexOf('/') + 1, -3)
  // 截取名字
  const fileNameInCamelCase = fileName
  const fileModule = context(key).default
  // 通过 context(key)导出文件内容。在文件中时通过 export.default 导出的，所以后边加.default
  moduleStores[fileNameInCamelCase] = {
    ...fileModule,
    namespaced: true // 文件中有写可以省略；不过这样写可以不用给每个文件写入；这个属性不知道自己去查文档；
  }

  moduleStores[fileName] = {
    ...fileModule,
    namespaced: true // 文件中有写可以省略；不过这样写可以不用给每个文件写入
  }
})

const en = {
  ...moduleStores
}

export default en
