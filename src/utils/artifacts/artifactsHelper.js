const innerDepsMap = {
  react: 'https://esm.sh/react@18.2.0',
  'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
  'react-dom/': 'https://esm.sh/react-dom@18.2.0/',
  'react-dom': 'https://esm.sh/react-dom@18.2.0/',
  'lucide-react': 'https://esm.sh/lucide-react/?deps=react@18.2.0',
  'react-error-boundary': 'https://esm.sh/react-error-boundary/?deps=react@18.2.0',
  antd: 'https://esm.sh/antd?standalone&deps=react@18.2.0'
}

/**
 * 从代码中提取所有导入语句，生成importmap
 * @param {string} code 源代码字符串
 * @returns {Object} importmap对象
 */
export function generateImportMap(code) {
  const imports = {
    react: proxyCdnUrl('https://esm.sh/react@18.2.0'),
    'react-dom/': proxyCdnUrl('https://esm.sh/react-dom@18.2.0/'),
    'react-error-boundary': proxyCdnUrl('https://esm.sh/react-error-boundary/?deps=react@18.2.0')
  }

  // 匹配 import 语句的正则表达式
  const importRegex =
    /import(?:(?:(?:[ \n\t]+([^ *\n\t{},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'{}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t{}]+)[ \n\t]+)from[ \n\t]*['"]([^'"]+)['"]|import[ \n\t]+['"]([^'"]+)['"];?/g

  let match
  while ((match = importRegex.exec(code)) !== null) {
    // 获取包名（从正则表达式的第4或第5个捕获组）
    const packageName = match[4] || match[5] || ''

    if (packageName) {
      // 优先使用 innerDepsMap 中预定义的URL
      if (packageName in innerDepsMap) {
        imports[packageName] = proxyCdnUrl(innerDepsMap[packageName])
      } else {
        // 如果包名包含 react，添加 react 依赖
        let url = packageName.includes('react')
          ? `https://esm.sh/${packageName}?deps=react@18.2.0`
          : `https://esm.sh/${packageName}`

        // 添加代理
        url = proxyCdnUrl(url)
        imports[packageName] = url
      }
    }
  }

  return { imports }
}

/**
 * 为CDN链接添加代理前缀
 * @param {string} url 原始URL
 * @returns {string} 添加代理前缀后的URL
 */
export function proxyCdnUrl(url) {
  // 只处理 http 或 https 开头的URL，忽略相对路径
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    const proxiedUrl = `https://artifacts-cdn.chatglm.site/${url}`
    return proxiedUrl
  }
  return url
}

/**
 * 处理 iframe 中的所有外部资源链接，添加代理。在加载前就处理完了。
 * @param {string} htmlContent iframe内的HTML内容
 */
export function proxyIframeResources(htmlContent) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')

    // 处理 script 标签
    const scripts = doc.querySelectorAll('script[src]')
    scripts.forEach(script => {
      const originalSrc = script.getAttribute('src') || ''
      if (originalSrc.startsWith('http')) {
        const newSrc = proxyCdnUrl(originalSrc)
        script.setAttribute('src', newSrc)
      }
    })

    // 处理 link 标签
    const links = doc.querySelectorAll('link[href]')
    links.forEach(link => {
      const originalHref = link.getAttribute('href') || ''
      if (originalHref.startsWith('http')) {
        const newHref = proxyCdnUrl(originalHref)
        link.setAttribute('href', newHref)
      }
    })

    // 处理 img 标签
    const images = doc.querySelectorAll('img[src]')
    images.forEach(img => {
      const originalSrc = img.getAttribute('src') || ''
      if (originalSrc.startsWith('http')) {
        const newSrc = proxyCdnUrl(originalSrc)
        img.setAttribute('src', newSrc)
      }
    })

    // 处理 style 标签中的CSS
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => {
      if (style.textContent) {
        style.textContent = style.textContent.replace(
          /url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/g,
          (match, url) => `url('${proxyCdnUrl(url)}')`
        )
      }
    })

    // 处理内联样式
    const elementsWithStyle = doc.querySelectorAll('[style*="url("]')
    elementsWithStyle.forEach(el => {
      const styleAttr = el.getAttribute('style')
      if (styleAttr && styleAttr.includes('url(')) {
        const newStyle = styleAttr.replace(
          /url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/g,
          (match, url) => `url('${proxyCdnUrl(url)}')`
        )
        el.setAttribute('style', newStyle)
      }
    })

    // 返回处理后的HTML
    return doc.documentElement.outerHTML
  } catch (error) {
    // console.error('处理HTML资源时出错:', error)
    return htmlContent
  }
}

export const isSupportPreview = (lang, content = '') =>
  ['html', 'svg'].includes(lang) || (lang === 'xml' && content.includes('svg'))

export const checkCodePreview = content => {
  const codeBlockContents = content.match(/```[\s\S]*?```/g)
  let enable = false
  if (codeBlockContents) {
    codeBlockContents.forEach(block => {
      const lang = block.split('\n')[0].replace('```', '').trim().toLowerCase()
      const code = block.replace(/```[\s\S]*?\n/, '').replace(/```$/, '')
      if (isSupportPreview(lang, code)) {
        enable = true
      }
    })
  }
  return enable
}

export const handleHTMLContent = htmlContent => {
  const proxyHtmlContent = proxyIframeResources(htmlContent)

  return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        background-color: white; /* Ensure the iframe has a white background */
                    }
                </style>
            </head>
            <body>
                ${proxyHtmlContent}
            </body>
        </html>
    `
}

export const handleJSXContent = jsxContent => {
  const match = jsxContent.match(/export\s+(default\s+)?(\w+)/)
  const componentName = match ? match[2] : 'App'
  const appComponent = `<${componentName} />`
  const importMap = generateImportMap(jsxContent)

  return `
            <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                background-color: white; /* Ensure the iframe has a white background */
                            }

                            /* 加载提示样式 */
                            #loading-container {
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                text-align: center;
                                font-family: system-ui, -apple-system, sans-serif;
                                color: #666;
                                max-width: 80%;
                            }

                            #error-message {
                                display: none;
                                width: 100%;
                                border: 2px solid #ff1212;
                                background-color: #ff121203;
                                padding: 8px;
                                margin-top: 8px;
                            }

                            #error-message > pre {
                                color: red;
                                overflow: hidden;
                                white-space: pre-wrap;
                                word-wrap: break-word;
                            }

                        </style>
                        <script src="https://cdn.tailwindcss.com"></script>

                        <script>
                            const originalFetch = window.fetch;

                            window.fetch = async function (...args) {
                                try {
                                        const response = await originalFetch.apply(this, args);
                                        if (!response.ok) {
                                                if (response.url === 'https://esm.sh/transform' && response.status >= 400) {
                                                    const msg = await response.json();
                                                    const loadingContainer = document.getElementById('loading-message');
                                                    if (loadingContainer) {
                                                        loadingContainer.style.display = 'none';
                                                    }
                                                    const errorContainer = document.getElementById('error-message');
                                                    if (errorContainer) {
                                                        errorContainer.style.display = 'block';
                                                        errorContainer.innerHTML = '<pre>' + msg.message + '</pre>';
                                                    }
                                                }
                                        }
                                        return response;
                                } catch (error) {
                                        console.error('Fetch error captured:', error);
                                        throw error;
                                }
                            };
                        </script>

                        <script type="importmap">
                            ${JSON.stringify(importMap)}
                        </script>
                        <script type="module" src="https://esm.sh/tsx"></script>
                    </head>
                    <body>
                        <div id="root">
                            <div id="loading-container">
                                <div id="loading-message">
                                    <p>正在加载依赖库和编译代码，这可能需要一些时间...</p>
                                    <p style="font-size: 0.9em; margin-top: 8px;">如果加载时间过长，可能是模型出的代码有 bug</p>
                                </div>
                                <div id="error-message"></div>
                            </div>
                        </div>

                        <script type="text/babel">
                            import { createRoot } from 'react-dom/client';
                            import { ErrorBoundary } from 'react-error-boundary';

                            function fallbackRender({ error, resetErrorBoundary }) {
                                return (
                                    <div role="alert">
                                        <p>Something went wrong:</p>
                                        <pre style={{ color: "red" }}>{error.message}</pre>
                                    </div>
                                );
                            }

                            ${jsxContent}
                            const rootElement = document.getElementById('root');
                            createRoot(rootElement).render(
                                <ErrorBoundary fallbackRender={fallbackRender}>
                                    ${appComponent}
                                </ErrorBoundary>
                            );
                        </script>
                    </body>
                </html>
        `
}

/**
 * 检测是否是 iOS 微信浏览器
 * @returns {boolean} 如果是 iOS 微信浏览器返回 true，否则返回 false
 */
export function isIosWechat() {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(userAgent)
  const isWechat = /micromessenger/.test(userAgent)
  return isIos && isWechat
}

export const IsIosWechat = isIosWechat()

/**
 * 检测当前浏览器语言是否为中文
 * @returns {boolean} 如果是中文语言返回 true，否则返回 false
 */
export function isChineseLanguage() {
  const primaryLanguage = navigator.language?.toLowerCase() || ''
  if (primaryLanguage.startsWith('zh')) {
    return true
  }
  return false
}

export const IsChinese = isChineseLanguage()
