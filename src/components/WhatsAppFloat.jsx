import { useLocation } from 'react-router-dom'
import { whatsappUrl } from '../lib/format.js'
import { useCompare } from '../lib/compare.js'
import { WhatsAppIcon } from './BrandIcons.jsx'

export default function WhatsAppFloat() {
  const { slugs } = useCompare()
  const { pathname } = useLocation()
  // Sit above the compare bar while it is showing
  const lifted = slugs.length > 0 && pathname !== '/bandingkan'
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat Auto EV via WhatsApp"
      className={`fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-ev-wa text-white shadow-lg shadow-black/25 transition-all hover:scale-110 sm:right-6 ${
        lifted ? 'bottom-24' : 'bottom-5 sm:bottom-6'
      }`}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
