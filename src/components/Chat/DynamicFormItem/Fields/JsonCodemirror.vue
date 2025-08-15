<template>
  <div class="jsoncode-editor" ref="codeEditorRef"></div>
</template>

<script>
import { minimalSetup, EditorView } from 'codemirror'
import { EditorState, Compartment, StateEffect } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import {
  lineNumbers,
  highlightActiveLineGutter,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  placeholder
} from '@codemirror/view'
import { indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language'
import { indentWithTab } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { lintKeymap, linter, lintGutter } from '@codemirror/lint'

export default {
  name: 'JsonCodemirror',
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tabSize: {
      type: Number,
      default: 2
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editorState: null,
      editorView: null
    }
  },
  watch: {
    disabled: {
      handler(val) {
        this.toggleDisabled(val)
      },
      immediate: true
    },
    value: {
      handler(val) {
        if (this.editorView) {
          this.setDoc(val)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.createEditorView()
  },
  beforeDestroy() {
    if (this.editorView) {
      this.editorView.destroy()
    }
  },
  methods: {
    createEditorView() {
      const jsonLinter = linter(this.jsonValidator)
      this.editorView = new EditorView({
        doc: this.value,
        parent: this.$refs.codeEditorRef,
        extensions: [minimalSetup, this.getExtension(), jsonLinter],
        tabSize: this.tabSize
      })
      this.$emit('ready')
      this.toggleDisabled(this.disabled)
      if (this.autoFocus) {
        this.setFocus()
      }
    },
    getView() {
      return this.editorView
    },
    toggleDisabled(val) {
      if (this.editorView) {
        const run = this.createEditorExtensionToggler(this.editorView, [
          EditorView.editable.of(false),
          EditorState.readOnly.of(true)
        ])
        run(val)
      }
    },
    setFocus() {
      if (typeof this.editorView?.focus === 'function') {
        this.editorView.focus()
      }
    },
    setBlur() {
      if (typeof this.editorView?.blur === 'function') {
        this.editorView.blur()
      }
    },
    getDoc() {
      if (this.editorView) {
        return this.editorView.state.doc.toString()
      }
      return ''
    },
    setDoc(newDoc) {
      if (this.editorView) {
        if (newDoc !== this.getDoc()) {
          this.editorView.dispatch({
            changes: {
              from: 0,
              to: this.editorView.state.doc.length,
              insert: newDoc
            }
          })
        }
      }
    },
    createEditorCompartment(view) {
      const compartment = new Compartment()
      const run = extension => {
        compartment.get(view.state)
          ? view.dispatch({ effects: compartment.reconfigure(extension) }) // reconfigure
          : view.dispatch({ effects: StateEffect.appendConfig.of(compartment.of(extension)) }) // inject
      }
      return { compartment, run }
    },
    createEditorExtensionToggler(view, extension) {
      const { compartment, run } = this.createEditorCompartment(view)
      return targetApply => {
        const exExtension = compartment.get(view.state)
        const apply = targetApply ?? exExtension !== extension
        run(apply ? extension : [])
      }
    },
    getExtension() {
      return [
        lintGutter(),
        lineNumbers(),
        highlightActiveLineGutter(),
        json(),
        // foldGutter(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        placeholder(this.$t('model_trial.extra.enterCode')),
        EditorView.updateListener.of(viewUpdate => {
          this.$emit('update', viewUpdate)
          if (viewUpdate.docChanged) {
            const newDoc = viewUpdate.state.doc.toString()
            if (newDoc !== this.value) {
              this.$emit('change', newDoc, viewUpdate)
              this.$emit('update:value', newDoc)
            }
          }
          // focus state change
          if (viewUpdate.focusChanged) {
            viewUpdate.view.hasFocus
              ? this.$emit('focus', viewUpdate)
              : this.$emit('blur', viewUpdate)
          }
        }),
        keymap.of([
          indentWithTab,
          ...closeBracketsKeymap,
          // ...defaultKeymap,
          ...searchKeymap,
          // ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap
        ])
      ]
    },
    jsonValidator(view) {
      const errors = []
      let parseJson
      const text = view.state.doc.toString()
      try {
        parseJson = JSON.parse(text)
      } catch (err) {
        // 假设错误信息包含行和列信息
        const pos = this.getErrorPosition(err, view.state.doc)
        errors.push({
          from: pos,
          message: err.message,
          severity: 'error',
          to: pos
        })
      }

      if (parseJson) {
        const name = (parseJson.name || '').trim() || ''
        if (!Object.prototype.hasOwnProperty.call(parseJson, 'name') || name.length < 1) {
          errors.push({
            from: 1,
            message: this.$t('model_trial.extra.mustInput'),
            severity: 'error',
            to: 1
          })
        } else {
          const regexp = /^[a-zA-Z0-9_-]{1,64}$/
          if (!regexp.test(name)) {
            const line = this.findTextLine(text, parseJson.name)
            errors.push({
              from: line,
              to: line,
              message: this.$t('model_trial.function_call.name_error_tip'),
              severity: 'error'
            })
          }
        }
      }
      this.$emit('error', errors)
      return errors
    },
    getErrorPosition(error, doc) {
      let m
      if ((m = error.message.match(/at position (\d+)/))) {
        return Math.min(+m[1], doc.length)
      }
      if ((m = error.message.match(/at line (\d+) column (\d+)/))) {
        return Math.min(doc.line(+m[1]).from + +m[2] - 1, doc.length)
      }
      return 0
    },
    findTextLine(text, targetText) {
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(targetText) !== -1) {
          return i + 1
        }
      }
    }
  }
}
</script>

<style lang="less" scope>
.jsoncode-editor {
  color: var(--mainTextColor);
  .cm-editor {
    overflow: hidden;
    overflow-y: auto;
    max-height: 50vh;
    min-height: 20vh;
    background: #fff;
    border: 1px solid #e0e0e0;
    outline: none;
    border-radius: 8px;
    &.cm-focused {
      border-color: #134cff;
    }
    .cm-gutters {
      box-sizing: border-box;
      color: #8d8e99;
      background: #fff;
      border-right: none;
      z-index: 2;
      .cm-gutter-lint {
        width: 10px;
        .cm-gutterElement {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cm-lint-marker-error {
          width: 6px;
          height: 6px;
          background: #f01d24;
          content: '';
          border-radius: 50%;
        }
      }
    }
    .cm-scroller {
      box-sizing: border-box;
      padding: 16px 0 0 0;
      font-size: 14px;
      line-height: 24px;
    }
  }
}
</style>
