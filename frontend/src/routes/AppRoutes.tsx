import { Routes, Route, Navigate } from 'react-router-dom'

import AdminLoginPage              from '../pages/admin/LoginPage'
import AdminDashboardPage          from '../pages/admin/DashboardPage'
import AdminIncidentCenterPage     from '../pages/admin/IncidentCenterPage'
import AdminResidentVerificationPage from '../pages/admin/ResidentVerificationPage'
import AdminDispatchManagementPage from '../pages/admin/DispatchManagementPage'
import AdminCaseManagementPage     from '../pages/admin/CaseManagementPage'
import AdminResidentsPage          from '../pages/admin/ResidentsPage'
import AdminDocumentRequestsPage   from '../pages/admin/DocumentRequestsPage'
import AdminAnalyticsPage          from '../pages/admin/AnalyticsPage'
import AdminSettingsPage           from '../pages/admin/SettingsPage'

import TanodLoginPage          from '../pages/tanod/LoginPage'
import TanodHomePage           from '../pages/tanod/HomePage'
import TanodIncidentsPage      from '../pages/tanod/IncidentsPage'
import TanodIncidentDetailPage from '../pages/tanod/IncidentDetailPage'
import TanodRequestBackupPage  from '../pages/tanod/RequestBackupPage'
import TanodEscalationPage     from '../pages/tanod/EscalationPage'
import TanodAlertsPage         from '../pages/tanod/AlertsPage'
import TanodHistoryPage        from '../pages/tanod/HistoryPage'
import TanodProfilePage        from '../pages/tanod/ProfilePage'

import LocationPermissionPage from '../pages/residents/LocationPermissionPage'
import LoginPage           from '../pages/residents/LoginPage'
import RegisterPage        from '../pages/residents/RegisterPage'
import DashboardPage       from '../pages/residents/DashboardPage'
import ReportIncidentPage  from '../pages/residents/ReportIncidentPage'
import RequestDocumentPage from '../pages/residents/RequestDocumentPage'
import TrackIncidentPage   from '../pages/residents/TrackIncidentPage'
import ProfilePage         from '../pages/residents/ProfilePage'
import NotificationsPage   from '../pages/residents/NotificationsPage'

import {
  AdminRoute, TanodRoute, ResidentRoute, GuestRoute,
} from '../components/PrivateRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Root redirects ──────────────────────────────────────────────── */}
      <Route path="/"      element={<Navigate to="/residents/location-permission" replace />} />
      <Route path="/login" element={<Navigate to="/residents/location-permission" replace />} />

      {/* ── Residents — location permission gate ───────────────────────── */}
      <Route path="/residents/location-permission" element={<LocationPermissionPage />} />

      {/* ── Residents — public (redirect away if already logged in) ─────── */}
      <Route path="/residents/login"
        element={
          <GuestRoute expectedRole="RESIDENT" authenticatedPath="/residents/dashboard">
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route path="/residents/register"
        element={
          <GuestRoute expectedRole="RESIDENT" authenticatedPath="/residents/dashboard">
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* ── Residents — protected (RESIDENT role required) ──────────────── */}
      <Route path="/residents/dashboard"        element={<ResidentRoute><DashboardPage /></ResidentRoute>} />
      <Route path="/residents/report-incident"  element={<ResidentRoute><ReportIncidentPage /></ResidentRoute>} />
      <Route path="/residents/request-document" element={<ResidentRoute><RequestDocumentPage /></ResidentRoute>} />
      <Route path="/residents/reports"          element={<ResidentRoute><TrackIncidentPage /></ResidentRoute>} />
      <Route path="/residents/profile"          element={<ResidentRoute><ProfilePage /></ResidentRoute>} />
      <Route path="/residents/notifications"    element={<ResidentRoute><NotificationsPage /></ResidentRoute>} />

      {/* ── Admin — public ──────────────────────────────────────────────── */}
      <Route path="/admin/login"
        element={
          <GuestRoute expectedRole="ADMIN" authenticatedPath="/admin/dashboard">
            <AdminLoginPage />
          </GuestRoute>
        }
      />

      {/* ── Admin — protected (ADMIN role required) ─────────────────────── */}
      <Route path="/admin/dashboard"             element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/incident-center"       element={<AdminRoute><AdminIncidentCenterPage /></AdminRoute>} />
      <Route path="/admin/resident-verification" element={<AdminRoute><AdminResidentVerificationPage /></AdminRoute>} />
      <Route path="/admin/dispatch-management"   element={<AdminRoute><AdminDispatchManagementPage /></AdminRoute>} />
      <Route path="/admin/case-management"       element={<AdminRoute><AdminCaseManagementPage /></AdminRoute>} />
      <Route path="/admin/residents"             element={<AdminRoute><AdminResidentsPage /></AdminRoute>} />
      <Route path="/admin/document-requests"     element={<AdminRoute><AdminDocumentRequestsPage /></AdminRoute>} />
      <Route path="/admin/analytics"             element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
      <Route path="/admin/settings"              element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

      {/* ── Tanod — public ──────────────────────────────────────────────── */}
      <Route path="/tanod/login"
        element={
          <GuestRoute expectedRole="TANOD" authenticatedPath="/tanod/home">
            <TanodLoginPage />
          </GuestRoute>
        }
      />

      {/* ── Tanod — protected (TANOD role required) ─────────────────────── */}
      <Route path="/tanod/home"           element={<TanodRoute><TanodHomePage /></TanodRoute>} />
      <Route path="/tanod/incidents"      element={<TanodRoute><TanodIncidentsPage /></TanodRoute>} />
      <Route path="/tanod/incidents/:id"  element={<TanodRoute><TanodIncidentDetailPage /></TanodRoute>} />
      <Route path="/tanod/request-backup" element={<TanodRoute><TanodRequestBackupPage /></TanodRoute>} />
      <Route path="/tanod/escalate"       element={<TanodRoute><TanodEscalationPage /></TanodRoute>} />
      <Route path="/tanod/alerts"         element={<TanodRoute><TanodAlertsPage /></TanodRoute>} />
      <Route path="/tanod/history"        element={<TanodRoute><TanodHistoryPage /></TanodRoute>} />
      <Route path="/tanod/profile"        element={<TanodRoute><TanodProfilePage /></TanodRoute>} />
    </Routes>
  )
}
