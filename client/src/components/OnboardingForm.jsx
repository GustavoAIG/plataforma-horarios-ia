import { useMemo, useState } from 'react'

const INITIAL_FORM = {
  faculty: '',
  year: '',
  preferences: ''
}

export default function OnboardingForm({
  onComplete
}) {
  const [step, setStep] = useState(1)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [form, setForm] = useState(
    INITIAL_FORM
  )

  const progress = useMemo(() => {
    return (step / 3) * 100
  }, [step])

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  function validateStep() {
    if (step === 1) {
      if (!form.faculty.trim()) {
        return 'La facultad es requerida'
      }

      if (!form.year.trim()) {
        return 'El año es requerido'
      }
    }

    if (step === 2) {
      if (!form.preferences.trim()) {
        return 'Describe tus preferencias'
      }
    }

    return null
  }

  async function handleNext() {
    if (loading) return

    setError('')

    const validationError =
      validateStep()

    if (validationError) {
      setError(validationError)
      return
    }

    if (step < 3) {
      setStep((prev) => prev + 1)
      return
    }

    try {
      setLoading(true)

      const cleanData = {
        faculty: form.faculty.trim(),
        year: form.year.trim(),
        preferences:
          form.preferences.trim()
      }

      await onComplete(cleanData)
    } catch (err) {
      setError(
        err?.message ||
          'Ocurrió un error inesperado'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    if (step === 1) return

    setError('')

    setStep((prev) => prev - 1)
  }

  return (
    <section
      className="
        mx-auto
        grid
        max-w-5xl
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-xl
        dark:bg-slate-900
        md:grid-cols-3
      "
    >

      {/* SIDEBAR */}
      <aside
        className="
          flex
          flex-col
          gap-6
          bg-indigo-50
          p-6
          dark:bg-slate-800
        "
      >

        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Onboarding
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-relaxed
              text-slate-600
              dark:text-slate-300
            "
          >
            Completa tu información para
            optimizar sugerencias y horarios.
          </p>
        </div>

        {/* PROGRESS */}
        <div>
          <div
            className="
              mb-2
              h-3
              overflow-hidden
              rounded-full
              bg-slate-200
              dark:bg-slate-700
            "
          >
            <div
              className="
                h-3
                rounded-full
                bg-indigo-600
                transition-all
                duration-300
              "
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          <span
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            Paso {step} de 3
          </span>
        </div>

        {/* STEPS */}
        <ol className="space-y-3">

          {[
            'Datos básicos',
            'Preferencias',
            'Resumen'
          ].map((label, index) => {
            const current =
              step === index + 1

            return (
              <li
                key={label}
                className={`
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  transition

                  ${
                    current
                      ? `
                        bg-indigo-100
                        font-semibold
                        text-indigo-700
                        dark:bg-indigo-900/40
                        dark:text-indigo-300
                      `
                      : `
                        text-slate-600
                        dark:text-slate-300
                      `
                  }
                `}
              >
                {index + 1}. {label}
              </li>
            )
          })}

        </ol>

      </aside>

      {/* CONTENT */}
      <main
        className="
          p-6
          md:col-span-2
        "
      >

        {error && (
          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
            role="alert"
          >
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">

            <div>
              <label
                htmlFor="faculty"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Facultad
              </label>

              <input
                id="faculty"
                type="text"
                value={form.faculty}
                onChange={(e) =>
                  updateField(
                    'faculty',
                    e.target.value
                  )
                }
                placeholder="Ej: Ingeniería"
                maxLength={100}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  p-3
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-200
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              />
            </div>

            <div>
              <label
                htmlFor="year"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Año académico
              </label>

              <input
                id="year"
                type="text"
                value={form.year}
                onChange={(e) =>
                  updateField(
                    'year',
                    e.target.value
                  )
                }
                placeholder="Ej: 3er año"
                maxLength={30}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  p-3
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-200
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              />
            </div>

          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>

            <label
              htmlFor="preferences"
              className="
                mb-2
                block
                text-sm
                font-medium
              "
            >
              Preferencias de estudio
            </label>

            <textarea
              id="preferences"
              value={form.preferences}
              onChange={(e) =>
                updateField(
                  'preferences',
                  e.target.value
                )
              }
              placeholder="Describe cómo prefieres estudiar..."
              maxLength={500}
              className="
                h-44
                w-full
                resize-none
                rounded-xl
                border
                border-slate-300
                p-4
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-200
                dark:border-slate-700
                dark:bg-slate-800
              "
            />

            <div
              className="
                mt-2
                text-right
                text-xs
                text-slate-500
              "
            >
              {form.preferences.length}/500
            </div>

          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>

            <h3
              className="
                mb-4
                text-lg
                font-semibold
              "
            >
              Resumen
            </h3>

            <div
              className="
                space-y-4
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-5
                dark:border-slate-700
                dark:bg-slate-800
              "
            >

              <div>
                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                  "
                >
                  Facultad
                </span>

                <p className="mt-1">
                  {form.faculty}
                </p>
              </div>

              <div>
                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                  "
                >
                  Año académico
                </span>

                <p className="mt-1">
                  {form.year}
                </p>
              </div>

              <div>
                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                  "
                >
                  Preferencias
                </span>

                <p className="mt-1 whitespace-pre-wrap">
                  {form.preferences}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ACTIONS */}
        <div
          className="
            mt-8
            flex
            items-center
            justify-between
          "
        >

          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="
              rounded-lg
              border
              border-slate-300
              px-5
              py-2
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:hover:bg-slate-800
            "
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="
              rounded-lg
              bg-indigo-600
              px-6
              py-2
              font-medium
              text-white
              transition
              hover:bg-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? 'Guardando...'
              : step < 3
              ? 'Siguiente'
              : 'Finalizar'}
          </button>

        </div>

      </main>

    </section>
  )
}