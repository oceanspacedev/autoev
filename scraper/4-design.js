// Step 4: render key pages in Chromium, take full-page screenshots (desktop + mobile)
// and measure the design system actually in use: colors, fonts, type scale, buttons.
// Output: output/screenshots/*.png and output/design-tokens.json
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { OUT_DIR, SITE, writeJson, log } from './lib/http.js'

const PAGES = [
  ['home', '/'],
  ['koleksi', '/koleksi/'],
  ['koleksi-goda', '/koleksi/goda/'],
  ['product-list', '/product/'],
  ['product-detail', '/product/uou-us1/'],
  ['showroom', '/showroom/'],
  ['tentang-kami', '/tentang-kami/'],
  ['kontak-kami', '/kontak-kami/'],
  ['auto-evers', '/auto-evers/'],
  ['compare', '/compare/'],
  ['artikel', '/tidak-ada-ruang-untuk-kebakaran-sepeda-listrik-jika-anda-membelinya-di-showroom-ini/'],
]
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }

// Runs in the page: tally styles of every visible element
function measure() {
  const rgbToHex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    if (a === 0) return null
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
    return a < 1 ? `${hex}@${a}` : hex
  }
  const bump = (obj, key, n = 1) => key && (obj[key] = (obj[key] || 0) + n)

  const textColors = {}, bgColors = {}, borderColors = {}, gradients = {}, fonts = {}, typeStyles = {}, buttons = {}
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const s = getComputedStyle(el)
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) continue

    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (ownText) {
      const chars = [...el.childNodes].filter((n) => n.nodeType === 3).reduce((a, n) => a + n.textContent.trim().length, 0)
      bump(textColors, rgbToHex(s.color), chars)
      const family = s.fontFamily.split(',')[0].replace(/["']/g, '').trim()
      bump(fonts, `${family} ${s.fontWeight}`, chars)
      const key = `${el.tagName.toLowerCase()}|${family}|${s.fontSize}|${s.fontWeight}|${s.lineHeight}|${s.letterSpacing}|${s.textTransform}`
      bump(typeStyles, key, chars)
    }
    bump(bgColors, rgbToHex(s.backgroundColor), Math.round((r.width * r.height) / 1000))
    if (s.backgroundImage.includes('gradient')) bump(gradients, s.backgroundImage)
    if (parseFloat(s.borderTopWidth) > 0) bump(borderColors, rgbToHex(s.borderTopColor))

    if (el.matches('button, .elementor-button, .button, a.btn, input[type=submit]')) {
      const key = JSON.stringify({
        bg: rgbToHex(s.backgroundColor), color: rgbToHex(s.color), radius: s.borderRadius,
        padding: s.padding, font: `${s.fontFamily.split(',')[0]} ${s.fontWeight} ${s.fontSize}`, transform: s.textTransform,
      })
      bump(buttons, key)
    }
  }

  const rootStyle = getComputedStyle(document.documentElement)
  const cssVars = {}
  for (const prop of rootStyle) {
    if (/^--(e-global|ast-global|wp--preset--color)/.test(prop)) cssVars[prop] = rootStyle.getPropertyValue(prop).trim()
  }
  const sampleTags = {}
  for (const sel of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', '.elementor-heading-title', '.elementor-button', '.elementor-nav-menu a', 'body']) {
    const el = document.querySelector(sel)
    if (!el) continue
    const s = getComputedStyle(el)
    sampleTags[sel] = { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, color: rgbToHex(s.color) }
  }
  return {
    textColors, bgColors, borderColors, gradients, fonts, typeStyles, buttons, cssVars, sampleTags,
    loadedFonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}`),
    fontLinks: [...document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]')].map((l) => l.href),
  }
}

// Scroll through the page so lazy images load and Elementor entrance animations fire
async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo(0, 0)
  })
  // Sections that never got their entrance animation stay invisible in full-page shots
  await page.addStyleTag({
    content: '.elementor-invisible{visibility:visible!important;opacity:1!important}.animated{animation:none!important}',
  })
  await page.waitForTimeout(1500)
}

const merge = (target, src) => { for (const [k, v] of Object.entries(src)) target[k] = (target[k] || 0) + v }
const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([value, weight]) => ({ value, weight }))

await mkdir(join(OUT_DIR, 'screenshots'), { recursive: true })
const browser = await chromium.launch()
const totals = { textColors: {}, bgColors: {}, borderColors: {}, gradients: {}, fonts: {}, typeStyles: {}, buttons: {} }
const perPage = {}
let globals = null

try {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({
      viewport,
      userAgent: 'autoev-scraper/1.0 (site redesign inventory)',
      ...(vpName === 'mobile' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    })
    for (const [name, path] of PAGES) {
      const page = await context.newPage()
      try {
        await page.goto(SITE + path, { waitUntil: 'domcontentloaded', timeout: 45_000 })
        await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {})
        await scrollThrough(page)
        await page.screenshot({ path: join(OUT_DIR, 'screenshots', `${name}-${vpName}.png`), fullPage: true })
        if (vpName === 'desktop') {
          const m = await page.evaluate(measure)
          for (const k of Object.keys(totals)) merge(totals[k], m[k])
          perPage[name] = { sampleTags: m.sampleTags, topTextColors: top(m.textColors, 6), topBgColors: top(m.bgColors, 6) }
          globals ??= { cssVars: m.cssVars, loadedFonts: m.loadedFonts, fontLinks: m.fontLinks }
          globals.loadedFonts = [...new Set([...globals.loadedFonts, ...m.loadedFonts])]
        }
        log(`${vpName} ${name} ok`)
      } catch (err) {
        log(`${vpName} ${name} FAILED: ${err.message.split('\n')[0]}`)
      } finally {
        await page.close()
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
}

await writeJson('design-tokens.json', {
  source: SITE,
  measuredAt: new Date().toISOString(),
  note: 'Weights: text colors/fonts = characters rendered; backgrounds = area in 1000px²; measured on desktop 1440px.',
  cssVariables: globals?.cssVars ?? {},
  fontsLoaded: globals?.loadedFonts ?? [],
  googleFontLinks: globals?.fontLinks ?? [],
  fontsByUsage: top(totals.fonts, 20),
  textColors: top(totals.textColors, 20),
  backgroundColors: top(totals.bgColors, 20),
  borderColors: top(totals.borderColors, 12),
  gradients: top(totals.gradients, 10),
  typeStyles: top(totals.typeStyles, 40).map(({ value, weight }) => {
    const [tag, family, size, fontWeight, lineHeight, letterSpacing, textTransform] = value.split('|')
    return { tag, family, size, fontWeight, lineHeight, letterSpacing, textTransform, weight }
  }),
  buttons: top(totals.buttons, 12).map(({ value, weight }) => ({ ...JSON.parse(value), count: weight })),
  perPage,
})
log('design-tokens.json written')
