import { useEffect } from 'react'

export const SITE_TITLE = 'Auto EV — Sepeda Listrik Autohemat Autogaya'

// Sets the browser tab title for a page ("Koleksi — Auto EV"); no title means the site default
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Auto EV` : SITE_TITLE
    return () => { document.title = SITE_TITLE }
  }, [title])
}
