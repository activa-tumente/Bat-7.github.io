import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Importar páginas críticas directamente (sin lazy loading)
import DevNavigation from '../pages/DevNavigation';
import Tests from '../pages/student/Tests';
import TestPage from '../pages/TestPage';
import Layout from '../components/layout/Layout';

// Lazy loading para páginas de evaluación
const Verbal = lazy(() => import('../pages/test/Verbal'));
const Numerico = lazy(() => import('../pages/test/Numerico'));
const Espacial = lazy(() => import('../pages/test/Espacial'));
const Razonamiento = lazy(() => import('../pages/test/Razonamiento'));
const Atencion = lazy(() => import('../pages/test/Atencion'));
const Mecanico = lazy(() => import('../pages/test/Mecanico'));
const Ortografia = lazy(() => import('../pages/test/Ortografia'));

// Lazy loading para páginas de administración
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Administration = lazy(() => import('../pages/admin/Administration'));
const Candidates = lazy(() => import('../pages/admin/Candidates'));
const Patients = lazy(() => import('../pages/admin/Patients'));
const Psychologists = lazy(() => import('../pages/admin/Psychologists'));
const Institutions = lazy(() => import('../pages/admin/Institutions'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const SavedReports = lazy(() => import('../pages/admin/SavedReports'));
const CompleteReport = lazy(() => import('../pages/admin/CompleteReport'));
const ViewSavedReport = lazy(() => import('../pages/admin/ViewSavedReport'));

// Lazy loading para páginas de estudiante/candidato
const StudentDashboard = lazy(() => import('../pages/student/Tests'));
const StudentResults = lazy(() => import('../pages/student/Results'));
const StudentReport = lazy(() => import('../pages/student/Report'));
const StudentQuestionnaire = lazy(() => import('../pages/student/Questionnaire'));
const StudentSavedReports = lazy(() => import('../pages/student/SavedReports'));

// Lazy loading para páginas de profesional/psicólogo
const ProfessionalDashboard = lazy(() => import('../pages/professional/Dashboard'));
const ProfessionalPatients = lazy(() => import('../pages/professional/Patients'));
const ProfessionalReports = lazy(() => import('../pages/professional/Reports'));
const ProfessionalTests = lazy(() => import('../pages/professional/Tests'));

// Lazy loading para páginas de cuestionarios
const QuestionnaireForm = lazy(() => import('../pages/questionnaire/QuestionnaireForm'));
const QuestionnaireList = lazy(() => import('../pages/questionnaire/QuestionnaireList'));
const QuestionnaireResults = lazy(() => import('../pages/questionnaire/QuestionnaireResults'));

// Lazy loading para páginas adicionales
const Home = lazy(() => import('../pages/home/Home'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));

// Componente de error simple
const ErrorFallback = ({ error }) => (
  <div style={{
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    margin: '2rem'
  }}>
    <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
      Error en la aplicación
    </h2>
    <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
      {error.message}
    </p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Recargar página
    </button>
  </div>
);

// Componente de loading mejorado
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    fontSize: '1.125rem',
    color: '#6b7280'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #f59e0b',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <p>Cargando página...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Componentes de rutas simplificadas
const SimpleAppRoutes = () => {
  console.log('SimpleAppRoutes: Renderizando rutas');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<DevNavigation />} />
          
          {/* Rutas con layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Tests />} />
            <Route path="/test-layout" element={<TestPage />} />
            
            {/* Rutas de evaluaciones - páginas reales */}
            <Route path="/test/verbal" element={<Verbal />} />
            <Route path="/test/numerico" element={<Numerico />} />
            <Route path="/test/espacial" element={<Espacial />} />
            <Route path="/test/razonamiento" element={<Razonamiento />} />
            <Route path="/test/atencion" element={<Atencion />} />
            <Route path="/test/mecanico" element={<Mecanico />} />
            <Route path="/test/ortografia" element={<Ortografia />} />

            {/* Rutas de administración - páginas reales */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/administration" element={<Administration />} />
            <Route path="/admin/candidates" element={<Candidates />} />
            <Route path="/admin/patients" element={<Patients />} />
            <Route path="/admin/psychologists" element={<Psychologists />} />
            <Route path="/admin/institutions" element={<Institutions />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/saved-reports" element={<SavedReports />} />
            <Route path="/admin/complete-report" element={<CompleteReport />} />
            <Route path="/admin/view-saved-report" element={<ViewSavedReport />} />

            {/* Rutas de estudiante/candidato */}
            <Route path="/student/tests" element={<StudentDashboard />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/report" element={<StudentReport />} />
            <Route path="/student/questionnaire" element={<StudentQuestionnaire />} />
            <Route path="/student/saved-reports" element={<StudentSavedReports />} />

            {/* Rutas de profesional/psicólogo */}
            <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
            <Route path="/professional/patients" element={<ProfessionalPatients />} />
            <Route path="/professional/reports" element={<ProfessionalReports />} />
            <Route path="/professional/tests" element={<ProfessionalTests />} />

            {/* Rutas de cuestionarios */}
            <Route path="/questionnaire" element={<QuestionnaireList />} />
            <Route path="/questionnaire/form" element={<QuestionnaireForm />} />
            <Route path="/questionnaire/results" element={<QuestionnaireResults />} />

            {/* Rutas adicionales */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Ruta de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default SimpleAppRoutes;
