import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public pages
import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import StudentJoin from '@/pages/game/StudentJoin'
import StudentGame from '@/pages/game/StudentGame'
import FinalRanking from '@/pages/results/FinalRanking'

// Protected pages
import Dashboard from '@/pages/dashboard/Dashboard'
import ClassList from '@/pages/classes/ClassList'
import ClassCreate from '@/pages/classes/ClassCreate'
import ClassDetail from '@/pages/classes/ClassDetail'
import MaterialUpload from '@/pages/materials/MaterialUpload'
import MaterialDetail from '@/pages/materials/MaterialDetail'
import ActivityCreate from '@/pages/activities/ActivityCreate'
import ActivityDetail from '@/pages/activities/ActivityDetail'
import QuestionEditor from '@/pages/activities/QuestionEditor'
import GameLaunch from '@/pages/game/GameLaunch'
import TeacherGame from '@/pages/game/TeacherGame'
import Analytics from '@/pages/results/Analytics'
import Library from '@/pages/library/Library'
import Settings from '@/pages/settings/Settings'

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <PageLoader text="Verificando sesión..." />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  return <DashboardLayout />
}

function ProtectedTeacherGame() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <PageLoader text="Verificando sesión..." />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <TeacherGame />
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { loadUser, isLoading } = useAuthStore()

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return <PageLoader text="Cargando LearnLeague..." />

  return (
    <Routes>
      {/* ─── Public routes ─── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

      {/* Student game routes (public, no layout) */}
      <Route path="/join" element={<StudentJoin />} />
      <Route path="/join/:code" element={<StudentJoin />} />
      <Route path="/game/student/:code" element={<StudentGame />} />
      <Route path="/game/final/:code" element={<FinalRanking />} />

      {/* Teacher game (full screen, no layout but protected) */}
      <Route path="/game/:sessionId/control" element={<ProtectedTeacherGame />} />

      {/* ─── Protected routes with DashboardLayout ─── */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<ClassList />} />
        <Route path="/classes/new" element={<ClassCreate />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/materials/upload" element={<MaterialUpload />} />
        <Route path="/materials/:id" element={<MaterialDetail />} />
        <Route path="/activities/new" element={<ActivityCreate />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/activities/:id/edit" element={<QuestionEditor />} />
        <Route path="/activities/:id/launch" element={<GameLaunch />} />
        <Route path="/analytics/:sessionId" element={<Analytics />} />
        <Route path="/analytics" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  )
}
