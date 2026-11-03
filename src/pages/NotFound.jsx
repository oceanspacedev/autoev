import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/title.js'

export default function NotFound() {
  usePageTitle('Halaman tidak ditemukan')
  return (
    <section className="bg-ev-soft py-28">
      <div className="container-ev text-center">
        <p className="font-display text-[8rem] leading-none text-ev-red sm:text-[12rem]">404</p>
        <h1 className="text-3xl sm:text-5xl">Jalannya buntu</h1>
        <p className="mx-auto mt-4 max-w-md text-ev-gray">Halaman yang kamu cari tidak ada atau sudah dipindah.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-black">Ke Beranda</Link>
          <Link to="/koleksi" className="btn-red">Lihat Koleksi</Link>
        </div>
      </div>
    </section>
  )
}
