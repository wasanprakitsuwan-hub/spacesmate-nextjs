'use client'

export default function FloatingChat() {
  return (
    <a
      href="https://line.me/R/ti/p/@spacesmate"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#06C755] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
      aria-label="ติดต่อผ่าน LINE"
    >
      <svg viewBox="0 0 40 40" className="w-7 h-7 fill-white">
        <path d="M20 4C11.163 4 4 10.268 4 18c0 4.897 2.696 9.222 6.857 11.894L9.5 36l6.042-3.132C16.978 33.287 18.47 33.5 20 33.5c8.837 0 16-6.268 16-14S28.837 4 20 4zm-5.5 17.5h-2v-7h2v7zm3.5 0h-2v-7h2v7zm6.5 0h-2l-3-4v4h-2v-7h2l3 4v-4h2v7z"/>
      </svg>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
        1
      </span>
    </a>
  )
}
