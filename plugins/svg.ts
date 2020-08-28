'use strict'

function importAll (plugin, r) {
  r.keys().forEach(key => {
    const id = key.split('./').join('').split('.svg').join('')
    const href = r(key).default.id
    plugin[id] = `<svg width="100%" height="100%"><use xlink:href="#${href}"></use></svg>`
  })
}

export default (context, inject) => {
  const $svg = {}
  importAll($svg, require.context(`!!svg-sprite-loader!../assets/svg`, true, /\.*$/))
  inject('svg', $svg)
}
