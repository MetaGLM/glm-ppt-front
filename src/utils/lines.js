// jshint multistr:true

const TABLE_NAME = 'hljs-ln'
const LINE_NAME = 'hljs-ln-line'
const CODE_BLOCK_NAME = 'hljs-ln-code'
const NUMBERS_BLOCK_NAME = 'hljs-ln-numbers'
const NUMBER_LINE_NAME = 'hljs-ln-n'
const DATA_ATTR_NAME = 'data-line-number'
const BREAK_LINE_REGEXP = /\r\n|\r|\n/g

addStyles()

function addStyles() {
  const css = document.createElement('style')
  css.type = 'text/css'
  css.innerHTML = format(
    '.{0}{border-collapse:collapse}' + '.{0} td{padding:0}' + '.{1}:before{content:attr({2})}',
    [TABLE_NAME, NUMBER_LINE_NAME, DATA_ATTR_NAME]
  )
  document.getElementsByTagName('head')[0].appendChild(css)
}

function initLineNumbersOnLoad(options) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    documentReady(options)
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      documentReady(options)
    })
  }
}

function documentReady(options) {
  try {
    const blocks = document.querySelectorAll('code.hljs,code.nohighlight')

    for (const i in blocks) {
      // eslint-disable-next-line no-prototype-builtins
      if (blocks.hasOwnProperty(i)) {
        if (!isPluginDisabledForBlock(blocks[i])) {
          lineNumbersBlock(blocks[i], options)
        }
      }
    }
  } catch (e) {
    window.console.error('LineNumbers error: ', e)
  }
}

function isPluginDisabledForBlock(element) {
  return element.classList.contains('nohljsln')
}

function lineNumbersBlock(element, options) {
  if (typeof element !== 'object') return
  element.innerHTML = lineNumbersInternal(element, options)
}

function lineNumbersInternal(element, options) {
  const internalOptions = mapOptions(element, options)

  duplicateMultilineNodes(element)

  return addLineNumbersBlockFor(element.innerHTML, internalOptions)
}

function addLineNumbersBlockFor(inputHtml, options) {
  const lines = getLines(inputHtml)

  // if last line contains only carriage return remove it
  if ((lines[lines.length - 1] || '').trim() === '') {
    lines.pop()
  }

  if (lines.length > 1 || options.singleLine) {
    let html = ''

    for (let i = 0, l = lines.length; i < l; i++) {
      html += format(
        '<tr>' +
          '<td class="{0} {1}" {3}="{5}">' +
          '<div class="{2}" {3}="{5}"></div>' +
          '</td>' +
          '<td class="{0} {4}" {3}="{5}">' +
          '{6}' +
          '</td>' +
          '</tr>',
        [
          LINE_NAME,
          NUMBERS_BLOCK_NAME,
          NUMBER_LINE_NAME,
          DATA_ATTR_NAME,
          CODE_BLOCK_NAME,
          i + options.startFrom,
          lines[i].length > 0 ? lines[i] : ' '
        ]
      )
    }

    return format('<table class="{0}">{1}</table>', [TABLE_NAME, html])
  }

  return inputHtml
}

/**
 * @param {HTMLElement} element Code block.
 * @param {Object} options External API options.
 * @returns {Object} Internal API options.
 */
function mapOptions(element, options) {
  options = options || {}
  return {
    singleLine: getSingleLineOption(options),
    startFrom: getStartFromOption(element, options)
  }
}

function getSingleLineOption(options) {
  const defaultValue = false
  if (options.singleLine) {
    return options.singleLine
  }
  return defaultValue
}

function getStartFromOption(element, options) {
  const defaultValue = 1
  let startFrom = defaultValue

  if (isFinite(options.startFrom)) {
    startFrom = options.startFrom
  }

  // can be overridden because local option is priority
  const value = getAttribute(element, 'data-ln-start-from')
  if (value !== null) {
    startFrom = toNumber(value, defaultValue)
  }

  return startFrom
}

/**
 * Recursive method for fix multi-line elements implementation in highlight.js
 * Doing deep passage on child nodes.
 * @param {HTMLElement} element
 */
function duplicateMultilineNodes(element) {
  const nodes = element.childNodes
  for (const node in nodes) {
    // eslint-disable-next-line no-prototype-builtins
    if (nodes.hasOwnProperty(node)) {
      const child = nodes[node]
      if (getLinesCount(child.textContent) > 0) {
        if (child.childNodes.length > 0) {
          duplicateMultilineNodes(child)
        } else {
          duplicateMultilineNode(child.parentNode)
        }
      }
    }
  }
}

/**
 * Method for fix multi-line elements implementation in highlight.js
 * @param {HTMLElement} element
 */
function duplicateMultilineNode(element) {
  const className = element.className

  if (!/hljs-/.test(className)) return

  const lines = getLines(element.innerHTML)

  for (var i = 0, result = ''; i < lines.length; i++) {
    const lineText = lines[i].length > 0 ? lines[i] : ' '
    result += format('<span class="{0}">{1}</span>\n', [className, lineText])
  }

  element.innerHTML = result.trim()
}

function getLines(text) {
  if (text.length === 0) return []
  return text.split(BREAK_LINE_REGEXP)
}

function getLinesCount(text) {
  return (text.trim().match(BREAK_LINE_REGEXP) || []).length
}

/**
 * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
 * @param {string} format
 * @param {array} args
 */
function format(format, args) {
  return format.replace(/\{(\d+)\}/g, function(m, n) {
    return args[n] !== undefined ? args[n] : m
  })
}

/**
 * @param {HTMLElement} element Code block.
 * @param {String} attrName Attribute name.
 * @returns {String} Attribute value or empty.
 */
function getAttribute(element, attrName) {
  return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null
}

/**
 * @param {String} str Source string.
 * @param {Number} fallback Fallback value.
 * @returns Parsed number or fallback value.
 */
function toNumber(str, fallback) {
  if (!str) return fallback
  const number = Number(str)
  return isFinite(number) ? number : fallback
}

export { lineNumbersBlock, initLineNumbersOnLoad }
