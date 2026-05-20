import {
  useEffect,
  useRef
} from 'react'

import logoSrc from '../assets/study.webp'

export default function SplashModal({
  onClose,
  onStart
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'

    window.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.body.style.overflow = ''

      window.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [onClose])

  function handleBackdropClick(e) {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
      onClick={handleBackdropClick}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
    >

      <div
        className="
          relative
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          bg-white
          p-8
          shadow-2xl
          dark:bg-slate-900
        "
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
            dark:hover:bg-slate-800
            dark:hover:text-slate-200
          "
        >
          ✕
        </button>

        <div
          className="
            flex
            flex-col
            items-center
            text-center
          "
        >

          {/* IMAGE */}
          <div
            className="
              mb-5
              flex
              h-24
              w-24
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-indigo-50
              dark:bg-slate-800
            "
          >
            <img
              src={logoSrc}
              alt="Logo de Stressless"
              className="
                h-full
                w-full
                object-cover
              "
              loading="eager"
              draggable="false"
            />
          </div>

          {/* TITLE */}
          <h2
            id="splash-title"
            className="
              text-4xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            Stressless
          </h2>

          {/* SUBTITLE */}
          <p
            className="
              mt-3
              text-lg
              text-slate-600
              dark:text-slate-300
            "
          >
            Calendario Académico Inteligente
          </p>

          {/* BADGE */}
          <div
            className="
              mt-5
              rounded-full
              bg-indigo-50
              px-5
              py-2
              text-sm
              font-medium
              text-indigo-700
              dark:bg-indigo-900/30
              dark:text-indigo-300
            "
          >
            Organiza tu tiempo y reduce
            el estrés académico.
          </div>

          {/* DESCRIPTION */}
          <p
            className="
              mt-6
              max-w-lg
              text-sm
              leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Planifica cursos, horarios y
            sesiones de estudio con ayuda
            de inteligencia artificial.
          </p>

          {/* ACTIONS */}
          <div
            className="
              mt-8
              flex
              flex-wrap
              justify-center
              gap-3
            "
          >

            <button
              type="button"
              onClick={onStart}
              className="
                rounded-xl
                bg-indigo-600
                px-7
                py-3
                font-medium
                text-white
                shadow-lg
                transition
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-400
              "
            >
              Comenzar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border
                border-slate-300
                px-7
                py-3
                font-medium
                text-slate-700
                transition
                hover:bg-slate-100
                focus:outline-none
                focus:ring-2
                focus:ring-slate-300
                dark:border-slate-700
                dark:text-slate-200
                dark:hover:bg-slate-800
              "
            >
              Cerrar
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}