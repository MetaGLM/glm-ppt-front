module.exports = {
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier'
  ],
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  rules: {
    'annotation-no-unknown': true,
    'selector-anb-no-unmatchable': true,
    'selector-class-pattern': null
  }
}
