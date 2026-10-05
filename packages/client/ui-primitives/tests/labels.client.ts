import type {
  DiffBlockLabels,
  JsonTreeLabels,
  MarkdownLabels,
  ReadBlockLabels,
  SearchBlockLabels,
  TerminalBlockLabels,
  WebBlockLabels,
} from '../src/index.ts'

export const markdownLabels: MarkdownLabels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
}

export const diffBlockLabels: DiffBlockLabels = {
  codeLabel: '代码块', wrapLabel: '自动换行', unwrapLabel: '取消自动换行',
  copy: 'Copy', copied: 'Copied', collapseAria: 'Collapse diff',
  expandAria: hidden => `展开其余 ${hidden} 行差异`,
  collapse: '收起', expand: hidden => `… 其余 ${hidden} 行`,
}

export const readBlockLabels: ReadBlockLabels = {
  codeLabel: '代码块', wrapLabel: '自动换行', unwrapLabel: '取消自动换行',
  window: (shown, total) => `显示 ${shown} / ${total} 行`,
  copy: 'Copy', copied: 'Copied', collapseAria: 'Collapse content',
  expandAria: hidden => `展开其余 ${hidden} 行`,
  collapse: '收起', expand: hidden => `… 其余 ${hidden} 行`,
}

export const searchBlockLabels: SearchBlockLabels = {
  pathsSummary: (shown, total, truncated) => truncated
    ? `显示 ${shown} / 共 ${total} 个路径`
    : `${shown} 个路径`,
  matchesSummary: (shown, total, files, truncated) => truncated
    ? `显示 ${shown} / 共 ${total} 处匹配 · ${files} 个文件`
    : `${shown} 处匹配 · ${files} 个文件`,
  copy: 'Copy', copied: 'Copied', noResults: 'No results',
  collapseAria: 'Collapse results',
  expandAria: hidden => `展开其余 ${hidden} 行结果`,
  collapse: '收起', expand: hidden => `… 其余 ${hidden} 行`,
}

export const terminalBlockLabels: TerminalBlockLabels = {
  signal: signal => `信号 ${signal}`,
  exitCode: code => `退出码 ${code}`,
  noExitCode: 'no exit code',
  running: '运行中', failed: 'Failed', done: '已完成',
  copy: 'Copy', copied: 'Copied', noOutput: 'No output',
  collapseAria: 'Collapse output', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行输出`,
  expand: hidden => `… 其余 ${hidden} 行`,
}

export const jsonTreeLabels: JsonTreeLabels = {
  copyValue: 'Copy value', copyJson: 'Copy JSON', copyPath: 'Copy property path',
  copyPrettyJson: 'Copy pretty JSON', copyCompactJson: 'Copy compact JSON',
  copied: 'Copied', copyFailed: 'Copy failed',
  collapseNode: 'Collapse JSON node', expandNode: 'Expand JSON node',
  copyButtonTitle: action => `${action}; right-click for copy options`,
}

export const webBlockLabels: WebBlockLabels = {
  noResults: 'No results found', sourcesTruncated: 'Source list truncated',
  http: 'HTTP', contentTruncated: 'Content truncated', markdown: markdownLabels,
}
