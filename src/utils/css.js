export const injectCSS = (css, id) => {
  const existingStyle = document.getElementById(id)
  if (existingStyle) {
    existingStyle.remove()
  }

  if (css.trim()) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = css
    document.head.appendChild(style)
  }
}

export const themeColorCss = (styles, id) => {
  return (
    `#${id} :not(.resume-header-item) > a { color: ${styles.themeColor} }` +
    `#${id} h1, #${id} h2, #${id} h3 { color: ${styles.themeColor} }` +
    `#${id} h1, #${id} h2 { border-bottom-color: ${styles.themeColor} }`
  )
}

export const lineHeightCss = (styles, id) => {
  const height = styles.lineHeight
  return (
    `#${id} p, #${id} li { line-height: ${height.toFixed(2)} }` +
    `#${id} h2, #${id} h3 { line-height: ${(height * 1.154).toFixed(2)} }` +
    `#${id} dl { line-height: ${(height * 1.038).toFixed(2)} }`
  )
}

export const paragraphSpaceCss = (styles, id) => {
  return `#${id} h2 { margin-top: ${styles.paragraphSpace}px }`
}

export const fontFamilyCss = (styles, id) => {
  const fontEN = styles.fontEN.fontFamily || styles.fontEN.name
  const fontCJK = styles.fontCJK.fontFamily || styles.fontCJK.name
  return `#${id} { font-family: ${fontEN}, ${fontCJK} }`
}

export const fontSizeCss = (styles, id) => {
  return `#${id} { font-size: ${styles.fontSize}px }`
}

export const paperCss = (styles) => {
  return `@media print { @page { size: ${styles.paper}; } }`
}

export const setDynamicCss = (styles, id) => {
  const pageId = `vue-smart-pages-${id}`

  const content =
    fontFamilyCss(styles, pageId) +
    fontSizeCss(styles, pageId) +
    themeColorCss(styles, pageId) +
    paragraphSpaceCss(styles, pageId) +
    lineHeightCss(styles, pageId) +
    (id === 'preview' ? paperCss(styles) : '')

  injectCSS(content, `markdown-resume-dynamic-${id}`)
}

export const setBackboneCss = (css, id) => {
  const PREVIEW_SELECTOR = '#vue-smart-pages-preview'
  if (id !== 'preview') css = css.replaceAll(PREVIEW_SELECTOR, `#vue-smart-pages-${id}`)

  injectCSS(css, `markdown-resume-backbone-${id}`)
}

export const PREVIEW_SELECTOR = '#vue-smart-pages-preview'
