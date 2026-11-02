import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CompareBar from './components/CompareBar.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import Home from './pages/Home.jsx'
import Collection from './pages/Collection.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Compare from './pages/Compare.jsx'
import Articles from './pages/Articles.jsx'
import Article from './pages/Article.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/koleksi" element={<Collection />} />
          <Route path="/koleksi/:slug" element={<ProductDetail />} />
          <Route path="/bandingkan" element={<Compare />} />
          <Route path="/artikel" element={<Articles />} />
          <Route path="/artikel/:slug" element={<Article />} />
          <Route path="/tentang-kami" element={<About />} />
          <Route path="/kontak" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CompareBar />
      <WhatsAppFloat />
    </>
  )
}
