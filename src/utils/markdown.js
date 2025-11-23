import MarkdownIt from 'markdown-it'
import MarkdownItDeflist from 'markdown-it-deflist'
import LinkAttributes from 'markdown-it-link-attributes'

const markdown = (() => {
  const md = new MarkdownIt({ html: true })

  md.use(MarkdownItDeflist)
  md.use(LinkAttributes, {
    matcher: (link) => /^https?:\/\//.test(link),
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  })

  return md
})()

const parseFrontMatter = (content) => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (frontmatterMatch) {
    const [, frontmatterStr, body] = frontmatterMatch
    let attributes = {}
    
    // 简单解析frontmatter
    const lines = frontmatterStr.split('\n')
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim()
        attributes[key.trim()] = value
      }
    })
    
    return { body, attributes }
  }
  
  return { body: content, attributes: {} }
}

const resolveDeflist = (html) => {
  const dlReg = /<dl>([\s\S]*?)<\/dl>/g
  const dlList = html.match(dlReg)

  if (dlList === null) return html

  for (const dl of dlList) {
    const newDl = dl.replace(/<\/dd>\n<dt>/g, '</dd>\n</dl>\n<dl>\n<dt>')
    html = html.replace(dl, newDl)
  }

  return html
}

const resolveCrossref = (html) => {
  const crossrefDefReg = /\[~([A-Za-z0-9]+)\]:\s*(.*?)(?=\n\n|\n\[~|$)/gs
  const crossrefRefs = {}
  const crossrefList = []
  
  html = html.replace(crossrefDefReg, (match, label, content) => {
    const id = crossrefList.length
    crossrefRefs[label] = id
    crossrefList.push({ label, content: content.trim() })
    return '' 
  })
  
  html = html.replace(/\[~([A-Za-z0-9]+)\]/g, (match, label) => {
    if (crossrefRefs[label] !== undefined) {
      const id = crossrefRefs[label]
      return `<sup class="crossref-ref"><a href="#crossref${id}" id="crossref-ref${id}">${label}</a></sup>`
    }
    return match
  })
  
  // 在文档末尾添加引用列表
  if (crossrefList.length > 0) {
    let crossrefHtml = '\n\n<ul class="crossref-list">'
    crossrefList.forEach((item, index) => {
      crossrefHtml += `\n<li id="crossref${index}" class="crossref-item" data-caption="${item.label}">`
      crossrefHtml += `\n<p>${item.content}</p>`
      crossrefHtml += '\n</li>'
    })
    crossrefHtml += '\n</ul>'
    html += crossrefHtml
  }
  
  return html
}

const resolveHeader = (html, frontmatter) => {
  let header = ''

  if (frontmatter.name) header += `<h1>${frontmatter.name}</h1>\n`

  if (frontmatter.header) {
    const n = frontmatter.header.length

    for (let i = 0; i < n; i++) {
      const item = frontmatter.header[i]
      if (!item) continue

      header += item.newLine ? '<br>\n' : ''

      header += `<span class="resume-header-item${
        i === n - 1 || frontmatter.header[i + 1]?.newLine ? ' no-separator' : ''
      }">`

      if (item.link)
        header += `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.text}</a>`
      else header += item.text

      header += `</span>\n`
    }
  }

  return `<div class="resume-header">${header}</div>` + html
}

export const renderMarkdown = (md) => {
  const { body, attributes } = parseFrontMatter(md)

  let html = markdown.render(body)
  html = resolveDeflist(html)
  html = resolveCrossref(html)
  html = resolveHeader(html, attributes)

  return html
}
