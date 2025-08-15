module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'prismjs',
      {
        languages: ['json', 'shell', 'xml', 'java', 'javascript', 'python', 'css', 'markup'],
        plugins: ['line-numbers'],
        theme: 'twilight',
        css: true
      }
    ],
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
}
