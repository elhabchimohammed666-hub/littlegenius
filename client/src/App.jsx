import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { TeacherClassesPage } from './pages/TeacherClassesPage';
import { TeacherClassDetailPage } from './pages/TeacherClassDetailPage';
import { TeacherCoursesPage } from './pages/TeacherCoursesPage';
import { TeacherCourseDetailPage } from './pages/TeacherCourseDetailPage';
import { TeacherAnalyticsPage } from './pages/TeacherAnalyticsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentCoursePage } from './pages/StudentCoursePage';
import { StudentActivityPage } from './pages/StudentActivityPage';

// Protected Route Component for Teachers
const TeacherRoute = ({ children }) => {
  const { user, loading, isTeacher } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Checking credentials...</div>;
  if (!user || !isTeacher) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route Component for Students
const StudentRoute = ({ children }) => {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Checking credentials...</div>;
  if (!user || !isStudent) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <TeacherRoute>
                <TeacherDashboardPage />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <TeacherRoute>
                <TeacherClassesPage />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/classes/:id"
            element={
              <TeacherRoute>
                <TeacherClassDetailPage />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <TeacherRoute>
                <TeacherCoursesPage />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <TeacherRoute>
                <TeacherCourseDetailPage />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <TeacherRoute>
                <TeacherAnalyticsPage />
              </TeacherRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <StudentRoute>
                <StudentDashboardPage />
              </StudentRoute>
            }
          />
          <Route
            path="/student/course/:id"
            element={
              <StudentRoute>
                <StudentCoursePage />
              </StudentRoute>
            }
          />
          <Route
            path="/student/activity/:id"
            element={
              <StudentRoute>
                <StudentActivityPage />
              </StudentRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>LittleGenius • AI Learning Platform for Kids (MERN Edition) • MongoDB, Express, React, Node.js</p>
      </footer>
    </div>
  );
}

export default App;
