import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Zap, BarChart3, Users, ArrowRight, Play, Upload, Brain, Trophy, Star, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

const DEMO_EMAIL = 'teacher@learnleague.demo'
const DEMO_PASSWORD = 'Demo1234!'

export default function Landing() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemo = async () => {
    setDemoLoading(true)
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/dashboard')
    } catch {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary-800">LearnLeague</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary-800 transition-colors">Características</a>
            <a href="#how" className="hover:text-primary-800 transition-colors">Cómo funciona</a>
            <Link to="/join" className="hover:text-primary-800 transition-colors">Soy alumno</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-primary-800 transition-colors hidden sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              Empieza gratis
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur">
            <Zap size={14} className="text-accent" />
            Impulsado por inteligencia artificial
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Convierte tu temario
            <br />
            en una{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-400">
              aventura de aprendizaje
            </span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sube un PDF, la IA genera preguntas, lanza un quiz en tiempo real en clase.
            Tus alumnos aprenden mientras compiten. Los resultados te llegan con análisis completo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-accent/25 hover:-translate-y-0.5"
            >
              <Zap size={20} />
              Empieza gratis — soy profesor
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 backdrop-blur border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FlaskConical size={18} />
              {demoLoading ? 'Entrando...' : 'Probar demo'}
            </button>
          </div>

          <p className="mt-6 text-white/40 text-sm">No se necesita tarjeta de crédito · Cuenta gratuita</p>
        </div>

        {/* Floating cards */}
        <div className="relative max-w-5xl mx-auto mt-16 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🤖', title: 'IA genera preguntas', desc: 'Sube tu PDF y obtén hasta 20 preguntas en segundos' },
              { icon: '🎮', title: 'Juego en tiempo real', desc: 'Todos los alumnos responden simultáneamente' },
              { icon: '📊', title: 'Análisis automático', desc: 'Descubre qué conceptos necesitan más atención' },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-white text-left hover:bg-white/15 transition-colors"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-base mb-1">{card.title}</h3>
                <p className="text-white/60 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Profesores activos' },
              { value: '500K+', label: 'Preguntas generadas' },
              { value: '2M+', label: 'Partidas jugadas' },
              { value: '98%', label: 'Satisfacción docente' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-black text-3xl text-primary-800">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-50 text-primary-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Características
            </span>
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-4">
              Todo lo que necesitas para enseñar mejor
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Desde la generación de preguntas hasta el análisis post-partida, todo en una sola plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain size={28} />,
                color: 'bg-purple-100 text-purple-700',
                title: 'IA para generar preguntas',
                desc: 'Sube cualquier PDF — apuntes, libros, exámenes — y nuestra IA extrae los conceptos clave y genera preguntas de opción múltiple de calidad pedagógica.',
                features: ['Hasta 20 preguntas por sesión', 'Ajuste de dificultad', 'Explicaciones automáticas'],
              },
              {
                icon: <Zap size={28} />,
                color: 'bg-yellow-100 text-yellow-700',
                title: 'Quiz en tiempo real',
                desc: 'Lanza una partida en clase con un código de 6 caracteres. Los alumnos se unen desde cualquier dispositivo y compiten en tiempo real.',
                features: ['Sin instalación', 'Sincronización en tiempo real', 'Clasificación en vivo'],
              },
              {
                icon: <BarChart3 size={28} />,
                color: 'bg-green-100 text-green-700',
                title: 'Análisis pedagógico',
                desc: 'Al finalizar la partida obtén un informe completo: qué conceptos fallaron más, quién necesita refuerzo y recomendaciones de mejora.',
                features: ['Análisis por pregunta', 'Informe por alumno', 'Exportar CSV/PDF'],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.features.map((ft) => (
                    <li key={ft} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                      {ft}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-50 text-primary-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Cómo funciona
            </span>
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-4">
              Tres pasos para una clase memorable
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-accent to-purple-200" />
            {[
              {
                step: '01',
                icon: <Upload size={32} />,
                color: 'bg-blue-600',
                title: 'Sube tu material',
                desc: 'Arrastra tu PDF al panel. La IA extrae el texto y genera preguntas automáticamente. Puedes editarlas antes de jugar.',
              },
              {
                step: '02',
                icon: <Play size={32} />,
                color: 'bg-accent-dark',
                title: 'Lanza la partida',
                desc: 'Pulsa "Lanzar partida" y comparte el código de 6 caracteres o el QR. Tus alumnos entran en segundos.',
              },
              {
                step: '03',
                icon: <Trophy size={32} />,
                color: 'bg-purple-600',
                title: 'Analiza y mejora',
                desc: 'Al terminar ves el ranking, el análisis por pregunta y las recomendaciones. Exporta el informe completo.',
              },
            ].map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5">
                  <div className={`w-20 h-20 rounded-2xl ${s.color} flex items-center justify-center shadow-xl text-white`}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-slate-700 rounded-full text-xs font-bold flex items-center justify-center shadow-md border border-slate-100">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <p className="font-display font-bold text-2xl text-slate-900">Lo que dicen nuestros profesores</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Marta García',
                role: 'Profesora de Historia, IES Goya',
                quote: 'En 5 minutos tengo un quiz completo para repasar el tema. Mis alumnos están mucho más motivados.',
                avatar: '👩‍🏫',
              },
              {
                name: 'Carlos Rivas',
                role: 'Profesor de Biología, Colegio San Isidro',
                quote: 'El análisis post-partida me ayuda a identificar exactamente qué conceptos necesitan más refuerzo.',
                avatar: '👨‍🏫',
              },
              {
                name: 'Ana Morales',
                role: 'Profesora de Inglés, IES Cervantes',
                quote: 'Los alumnos piden repetir el quiz. La gamificación funciona de verdad. Altamente recomendado.',
                avatar: '👩‍💻',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-4xl text-white mb-4">
            ¿Listo para transformar tus clases?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Únete a miles de profesores que ya usan LearnLeague. Gratis para siempre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl"
            >
              <Zap size={20} />
              Crear cuenta gratuita
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FlaskConical size={18} />
              {demoLoading ? 'Entrando...' : 'Probar demo'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                <BookOpen size={15} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">LearnLeague</span>
            </div>
            <p className="text-sm">© 2024 LearnLeague. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="mailto:hola@learnleague.app" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
