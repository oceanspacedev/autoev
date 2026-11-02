// Product photos come in two kinds: transparent PNGs and photos on a white box.
// multiply blends the white box into whatever light background sits behind it.
export default function ProductImage({ product, image = product.images[0], className = '', eager = false }) {
  if (!image) return <div className={`grid place-items-center text-xs text-ev-gray ${className}`}>Foto belum tersedia</div>
  return (
    <img
      src={image.src}
      alt={image.alt || product.name}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${product.transparent ? '' : 'mix-blend-multiply'} ${className}`}
    />
  )
}
