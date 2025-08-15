/**
 * npm: https://www.npmjs.com/package/await-to-js
 * github: https://github.com/scopsy/await-to-js
 * @param {Promise} promise Promise
 * @param {Object} errorExt 自定义错误信息
 * @returns
 */
export function to(promise, errorExt) {
  return promise
    .then(data => [null, data])
    .catch(err => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt)
        return [parsedError, undefined]
      }
      return [err, undefined]
    })
}
export default to
