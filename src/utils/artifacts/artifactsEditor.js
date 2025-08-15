import i18n from '@/locales'
import { parse, serialize, parseFragment } from 'parse5'
import { getUuid } from '@/utils/tools'

export default class ArtifactsEditor {
  constructor(code, iframe) {
    this.code = code || ''
    this.codeSerialized = code || ''
    this.ast = null
    this.iframe = iframe
    this.nodeIDMap = {}
    this.operated = false
    this.inputScale = 1
    this.ast = parse(this.code, {
      sourceCodeLocationInfo: true
    })
  }

  walkAST = () => {
    // 遍历整个ast树，将每个dom节点对应的代码行的开始和结束行的行号加入到attribute属性中

    const walk = node => {
      if (node.tagName) {
        const startLine = node.sourceCodeLocation.startLine
        const endLine = node.sourceCodeLocation.endLine
        node.attrs.push({ name: 'data-z-start-line', value: String(startLine) })
        node.attrs.push({ name: 'data-z-end-line', value: String(endLine) })
        const editID = getUuid()
        node.attrs.push({ name: 'data-z-edit-id', value: editID })
        this.nodeIDMap[editID] = node
      }

      if (node.childNodes) {
        node.childNodes.forEach(child => {
          walk(child)
        })
      }
    }
    const htmlNode = this.ast?.childNodes?.find(node => node.tagName === 'html')
    if (htmlNode) {
      walk(this.ast)
    }
  }

  serializeAST = callback => {
    this.codeSerialized = callback(serialize(this.ast))
    return this.codeSerialized
  }

  getSerializeCode = () => {
    // 遍历ast，将我们额外加入的dataset清除掉
    const walk = node => {
      if (node.attrs) {
        node.attrs = node.attrs.filter(attr => !attr.name.startsWith('data-z'))
      }
      if (node.childNodes) {
        node.childNodes.forEach(child => {
          walk(child)
        })
      }
    }
    walk(this.ast)
    const html = serialize(this.ast)
    // 在 <!DOCTYPE html> 和 <html lang="xx"> 之间添加换行符，在 <html> 和 <head> 之间也添加换行符
    let formattedHtml = html.replace(
      /<!DOCTYPE html><html(\s+lang="[^"]*")?/,
      '<!DOCTYPE html>\n<html$1'
    )
    formattedHtml = formattedHtml.replace(/<html(\s+lang="[^"]*")?><head/, '<html$1>\n<head')
    return formattedHtml
  }

  invokeEditorCode = iframe => {
    if (!iframe.contentDocument) return
    const styles = `
                    @keyframes caretRainbow {
                        0%   { caret-color: red; }
                        20%  { caret-color: orange; }
                        40%  { caret-color: yellow; }
                        60%  { caret-color: green; }
                        80%  { caret-color: blue; }
                        100% { caret-color: purple; }
                    }

                    /* 编辑模式样式 */
                    .editable-hover {
                        background-color: rgba(59, 130, 246, 0.1) !important;
                        outline-width: 2px !important;
                        outline-style: dashed !important;
                        outline-color: #3b82f6 !important;
                        outline-offset: 2px !important;
                        cursor: pointer !important;
                        transition: all 0.2s ease !important;
                    }

                    .element-editing {
                        outline-width: 2px !important;
                        outline-style: solid !important;
                        outline-color: #0068E0 !important;
                        outline-offset: 1px !important;
                        background-color: rgba(0,104,224,0.4) !important;
                        cursor: text !important;
                        animation: caretRainbow 0.3s infinite;
                    }

                    .smart-edit-input {
                        position: absolute;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        background: white;
                        border: 1px solid #00000001;
                        border-radius: 8px;
                        box-shadow: 0 0px 12px rgba(0, 0, 0, 0.25);
                        padding: 8px;
                        z-index: 10000;
                        max-width: 400px;
                        color: black;
                    }

                    .smart-edit-input textarea {
                        flex: 1;
                        border: none;
                        padding: 4px;
                        font-size: 14px;
                        line-height: 16px;
                        resize: none;
                        outline: none;
                        font-family: inherit;
                        scrollbar-width: none;
                        min-width: 200px;
                    }

                    .smart-edit-input textarea::placeholder {
                        font-size: 14px;
                        color: rgba(0,0,0,0.3);
                    }

                    .smart-edit-input textarea::-webkit-scrollbar {
                        display: none;
                    }

                    .smart-edit-buttons {
                        display: flex;
                        gap: 8px;
                        height: 100%;
                    }

                    .smart-edit-input button {
                        height: 100%;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                        background: white;
                        transition: all 0.2s;
                    }

                    .smart-edit-input button.primary {
                        padding: 6px;
                        background-image: linear-gradient(229deg, #a260ff -31.99%, #134cff 82.46%);
                        color: white;
                        border: none;
                    }

                    .smart-edit-input button:hover {
                        background-image: linear-gradient(229deg, #a260ff -31.99%, #134cff 82.46%);
                    }

                    .smart-edit-input button.primary:hover {
                        background-image: linear-gradient(229deg, #a260ff -31.99%, #134cff 82.46%);
                    }

                    .smart-edit-label {
                        display: block;
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 6px;
                    }
        `

    const styleElement = iframe.contentDocument.createElement('style')
    styleElement.innerHTML = styles
    iframe.contentDocument.head.appendChild(styleElement)

    const script = `function initInnerEditor() {
    let currentEditElement = null;
    let smartInput = null;

    function enableEdit() {
        enableEditBlock();
    }

    // 鼠标进入事件
    function handleMouseOver(event) {
        event.stopPropagation();
        event.target.classList.add('editable-hover');
    }

    // 鼠标离开事件
    function handleMouseOut(event) {
        event.stopPropagation();
        event.target.classList.remove('editable-hover');
    }

    // 直接编辑元素的输入事件
    function handleInput(event) {
        const value = event.target.innerHTML;
        if (event.target.hasAttribute('data-z-edit-id')) {
            const editID = event.target.getAttribute('data-z-edit-id');
            window.parent.postMessage({
                type: 'manualEdit',
                data: {
                    text: value,
                    editID
                }
            });
        }
    }

    // 输入框失去焦点
    function handleElementBlur() {}

    // 响应esc退出编辑
    function handleElementKeydown(ev) {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            disableCurrentEdit();
        }
    }

    // 在元素周围展示一个输入框，用于编辑
    function showSmartInput(event) {
        const element = event.target;
        cancelSmartInput(); // 先关闭当前的

        const inputContainer = document.createElement('div');
        inputContainer.className = 'smart-edit-input';

        const rect = element.getBoundingClientRect();
        inputContainer.style.left = Math.min(rect.left, window.innerWidth - 420) + 'px';
        inputContainer.style.top = rect.bottom + 10 + 'px';

        if (rect.bottom + 120 > window.innerHeight) {
            inputContainer.style.top = rect.bottom - 120 + 'px';
        }

        inputContainer.innerHTML = \`
      <textarea id="smartEditTextarea" rows="1" placeholder="${i18n.t('common.please_input', [
      ''
    ])}"></textarea>
      <div class="smart-edit-buttons">
        <button id="smartSubmitButton" class="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" stroke="white" width="16" height="16">
                        <path
                            stroke-width="1"
                            fill-rule="evenodd"
                            d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
      </div>
    \`;
        document.body.appendChild(inputContainer);
        smartInput = inputContainer;

        const textarea = inputContainer.querySelector('#smartEditTextarea');
        const submitButton = inputContainer.querySelector('#smartSubmitButton');
        if (!document.activeElement || document.activeElement.nodeName === 'BODY') {
            textarea?.focus();
        }

        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                cancelSmartInput();
            }
        });
        if (submitButton) {
            submitButton.onclick = () => {
                // 点击提交按钮，将文本内容应用到元素上
                if (currentEditElement) {
                    window.parent.postMessage({
                        type: 'editElement',
                        data: {
                            text: textarea?.value,
                            startLine: currentEditElement.dataset.zStartLine,
                            endLine: currentEditElement.dataset.zEndLine,
                            id: currentEditElement.dataset.zEditId
                        }
                    });
                    cancelSmartInput();
                    disableCurrentEdit();
                }
            };
        }
    }

    function cancelSmartInput() {
        if (smartInput) {
            document.body.removeChild(smartInput);
            smartInput = null;
        }
    }

    // 点击事件
    function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = event.target;
        if (currentEditElement === element) return;
        disableCurrentEdit();
        currentEditElement = element;
        // 如果element的子节点是文本节点,那么自动focus
        if ([...element.childNodes].find((el) => {
            return el.nodeType === Node.TEXT_NODE && el.data.trim().length > 0;
        })) {
            element.setAttribute('contenteditable', 'true');
            element.focus();
        }
        element.classList.remove('editable-hover');
        element.classList.add('element-editing');

        element.addEventListener('input', handleInput);
        element.addEventListener('blur', handleElementBlur);
        element.addEventListener('keydown', handleElementKeydown);

        showSmartInput(event);
    }

    // 编辑元素的点击事件
    function enableEditBlock() {
        // 获取所有块级和行内元素
        const elements = document.body.querySelectorAll('*');

        // 为每个元素添加鼠标事件监听
        elements.forEach((element) => {
            element.addEventListener('mouseover', handleMouseOver);
            element.addEventListener('mouseout', handleMouseOut);
            element.addEventListener('click', handleClick);
        });
    }

    function disableCurrentEdit() {
        if (currentEditElement) {
            currentEditElement.removeAttribute('contenteditable');
            currentEditElement.classList.remove('element-editing');
            currentEditElement.removeEventListener('input', handleInput);
            currentEditElement.removeEventListener('blur', handleElementBlur);
            currentEditElement.removeEventListener('keydown', handleElementKeydown);
            currentEditElement = null;
        }
    }

    enableEdit();
}

initInnerEditor();
`
    const scriptElement = iframe.contentDocument.createElement('script')
    scriptElement.innerHTML = script
    iframe.contentDocument.head.appendChild(scriptElement)
  }

  initMessageHandler = (callback = () => {}) => {
    window.addEventListener('message', event => {
      if (event.data.type === 'editElement') {
        const { text, startLine, id } = event.data.data // 移除未使用的endLine变量
        const { startOffset = 0 } = this.nodeIDMap[id].sourceCodeLocation || {}

        // 从代码中截取从startOffset到第一个换行符之间的内容
        const lineCode = this.code.substring(startOffset, this.code.indexOf('\n', startOffset))

        callback &&
          callback('editElement', {
            line: startLine || 0,
            code: lineCode || '',
            text
          })
      }

      if (event.data.type === 'manualEdit') {
        const { text, editID } = event.data.data
        this.operated = true
        const modifiedAst = parseFragment(text)
        const node = this.nodeIDMap[editID]

        if (node) {
          node.childNodes = modifiedAst.childNodes
        }
      }
    })
  }

  scaleInput = ratio => {
    if (!this.iframe.contentDocument) return
    this.inputScale = ratio

    // 查找或创建样式表
    let styleSheet = null
    const doc = this.iframe.contentDocument

    // 查找是否已存在我们的样式表
    for (let i = 0; i < doc.styleSheets.length; i++) {
      if (
        doc.styleSheets[i].ownerNode &&
        doc.styleSheets[i].ownerNode.id === 'artifacts-editor-styles'
      ) {
        styleSheet = doc.styleSheets[i]
        break
      }
    }

    // 如果没有找到样式表，创建一个新的
    if (!styleSheet) {
      const styleElement = doc.createElement('style')
      styleElement.id = 'artifacts-editor-styles'
      doc.head.appendChild(styleElement)
      styleSheet = styleElement.sheet
    }

    // 删除可能存在的旧规则
    // eslint-disable-next-line no-unmodified-loop-condition
    while (styleSheet && styleSheet.cssRules.length > 0) {
      styleSheet.deleteRule(0)
    }

    // 添加新的缩放规则
    if (styleSheet) {
      styleSheet.insertRule(
        `.smart-edit-input { transform: scale(${ratio}); transform-origin: top left;}`,
        0
      )
    }
  }
}
