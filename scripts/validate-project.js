const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const root = path.resolve(__dirname, '..')
const errors = []

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return []
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

const files = walk(root)

files
  .filter((file) => file.endsWith('.json'))
  .forEach((file) => {
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'))
    } catch (error) {
      errors.push(`${path.relative(root, file)}: invalid JSON - ${error.message}`)
    }
  })

files
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const result = childProcess.spawnSync(process.execPath, ['--check', file], {
      encoding: 'utf8'
    })
    if (result.status !== 0) {
      errors.push(`${path.relative(root, file)}: invalid JavaScript - ${result.stderr.trim()}`)
    }
  })

function validateWxml(file) {
  let source = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  const stack = []
  const tagPattern = /<\/?([A-Za-z][\w-]*)(?:\s[^<>]*?)?\/?>/g
  let match
  while ((match = tagPattern.exec(source))) {
    const token = match[0]
    const tag = match[1]
    if (token.startsWith('</')) {
      const current = stack.pop()
      if (current !== tag) {
        errors.push(`${path.relative(root, file)}: tag mismatch, expected </${current}> but found </${tag}>`)
        return
      }
    } else if (!token.endsWith('/>')) {
      stack.push(tag)
    }
  }
  if (stack.length) {
    errors.push(`${path.relative(root, file)}: unclosed tags ${stack.join(', ')}`)
  }

  const mustacheOpen = (source.match(/\{\{/g) || []).length
  const mustacheClose = (source.match(/\}\}/g) || []).length
  if (mustacheOpen !== mustacheClose) {
    errors.push(`${path.relative(root, file)}: unbalanced template expressions`)
  }

  const jsFile = file.replace(/\.wxml$/, '.js')
  const handlers = Array.from(source.matchAll(/(?:bind|catch)[a-z]+="([^"{}\s]+)"/g)).map((item) => item[1])
  if (handlers.length && fs.existsSync(jsFile)) {
    const js = fs.readFileSync(jsFile, 'utf8')
    handlers.forEach((handler) => {
      const methodPattern = new RegExp(`(?:^|\\s)(?:async\\s+)?${handler}\\s*\\(`)
      if (!methodPattern.test(js)) {
        errors.push(`${path.relative(root, file)}: missing event handler "${handler}"`)
      }
    })
  }
}

files.filter((file) => file.endsWith('.wxml')).forEach(validateWxml)

const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
appConfig.pages.forEach((page) => {
  ;['.js', '.json', '.wxml', '.wxss'].forEach((extension) => {
    const target = path.join(root, `${page}${extension}`)
    if (!fs.existsSync(target)) errors.push(`app.json page is incomplete: ${page}${extension}`)
  })
})

files
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const source = fs.readFileSync(file, 'utf8')
    const requirePattern = /require\(['"](\.[^'"]+)['"]\)/g
    let match
    while ((match = requirePattern.exec(source))) {
      const request = match[1]
      const base = path.resolve(path.dirname(file), request)
      if (!fs.existsSync(base) && !fs.existsSync(`${base}.js`) && !fs.existsSync(path.join(base, 'index.js'))) {
        errors.push(`${path.relative(root, file)}: unresolved require "${request}"`)
      }
    }
  })

global.wx = {}
global.Page = () => {}
global.Component = () => {}
global.App = () => {}
global.getApp = () => ({ globalData: {} })
global.getCurrentPages = () => []

files
  .filter((file) => {
    const relative = path.relative(root, file).replace(/\\/g, '/')
    return (
      relative === 'app.js' ||
      relative.startsWith('pages/') ||
      relative.startsWith('components/') ||
      relative.startsWith('services/') ||
      relative.startsWith('data/') ||
      relative.startsWith('utils/') ||
      relative.startsWith('config/')
    )
  })
  .filter((file) => file.endsWith('.js') && !file.includes(`${path.sep}scripts${path.sep}`))
  .forEach((file) => {
    try {
      require(file)
    } catch (error) {
      errors.push(`${path.relative(root, file)}: module load failed - ${error.message}`)
    }
  })

if (errors.length) {
  console.error(`Project check failed with ${errors.length} issue(s):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Project check passed: ${files.length} files scanned.`)
