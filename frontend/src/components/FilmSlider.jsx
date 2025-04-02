import { useRef, useEffect } from 'react'

export default function FilmSlider() {
  const containerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const scrollY = window.scrollY
      containerRef.current.style.transform = `translateX(${-scrollY * 0.5}px)`
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute', // Абсолютное позиционирование
        right: '0%',          // Прижимаем к правому краю
        top: '40vh',          // Размещаем ниже статистики
        display: 'flex',
        left: '60%',
        gap: '20px',
        filter: 'opacity(0.6) grayscale(20%)',
        zIndex: 10            // Убедимся, что поверх других элементов
      }}
    >
      {[...Array(10)].map((_, i) => (
        <img
          key={i}
          src={`/photos/${(i % 9) + 1}.jpg`}
          style={{
            width: '180px',   // Чуть уменьшил размер
            height: '270px',
            objectFit: 'cover',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          alt={`Film ${i}`}
        />
      ))}
    </div>
  )
}