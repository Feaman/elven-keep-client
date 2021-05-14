import { Context } from "@nuxt/types"

function importAll (icons: any, r: any) {
  r.keys().forEach((key: String) => {
    const id = key.split('./').join('').split('.svg').join('')
    const href = r(key).default.id
    icons[id] = `<svg width="100%" height="100%"><use xlink:href="#${href}"></use></svg>`
  })
}

export default (_context: Context, inject: Function) => {
  const $svg = {}
  importAll($svg, require.context(`!!svg-sprite-loader!../assets/svg`, true, /\.*$/))
  inject('svg', $svg)
}
