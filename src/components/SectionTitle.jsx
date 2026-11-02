export default function SectionTitle({ eyebrow, title, children, align = 'left', light = false }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`mt-2 text-3xl leading-none sm:text-5xl ${light ? 'text-white' : ''}`}>{title}</h2>
      {children && <p className={`mt-4 text-sm leading-7 sm:text-base ${light ? 'text-white/75' : 'text-ev-gray'}`}>{children}</p>}
    </div>
  )
}
