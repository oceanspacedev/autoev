// Shared HTTP helpers for the autoev scraper: polite fetching plus an on-disk cache
// so re-running a step never re-downloads pages we already have.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { politeFetch } from '../../.claude/skills/scraping-responsibly/scripts/polite-fetch.js'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const CACHE_DIR = join(ROOT, 'cache')
export const OUT_DIR = join(ROOT, 'output')
export const SITE = 'https://autoev.co.id'

export { politeFetch }

const cachePath = (url, ext) => join(CACHE_DIR, createHash('sha1').update(url).digest('hex') + ext)

export async function cachedText(url, ext = '.html') {
  const file = cachePath(url, ext)
  try {
    return await readFile(file, 'utf8')
  } catch {
    const text = await (await politeFetch(url)).text()
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(file, text)
    return text
  }
}

export async function cachedJson(url) {
  return JSON.parse(await cachedText(url, '.json'))
}

export async function writeJson(relPath, data) {
  const file = join(OUT_DIR, relPath)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2))
  return file
}

export const log = (...args) => console.log(new Date().toISOString().slice(11, 19), ...args)
