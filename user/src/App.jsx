// // import { Routes, Route } from "react-router-dom";

// // // Pages
// // import Dashboard from "./pages/Dashboard";

// // import Leave from "./pages/Leave";
// // import Login from "./pages/Login";
// // import ManagerProfile from "./pages/ManagerProfile";
// // import ProfilePage from "./pages/ProfilePage";
// // import PayslipsPage from "./pages/Payslips";
// // import AttendancePage from "./pages/Attendance";
// // import DocumentsPage from "./pages/Documents";
// // import Performance from "./pages/Performance";
// // import TrainingPage from "./pages/Training";
// // import BenefitsPage from "./pages/Benefits";
// // import TeamPage from "./pages/Team";
// // import SettingsPage from "./pages/Settings";
// // import RequestsPage from "./pages/Requests";
// // import AnnouncementsPage from "./pages/Announcements";
// // import AdminDashboard from "./admin/AdminDashboard";
// // import Employees from "./admin/employeemanagement/EmployeeList";
// // import EmployeeList from "./admin/employeemanagement/EmployeeList";
// // import AddEmployee from "./admin/employeemanagement/AddEmployee";
// // import EmployeeProfile from "./admin/employeemanagement/EmployeeProfile";
// // import ApprovalsPage from "./admin/employeemanagement/Approvals";
// // import EditEmployee from "./admin/employeemanagement/EditEmployee";
// // import ProfileChangeRequests from "./admin/employeemanagement/ProfileChangeRequests";
// // import OrgChart from "./admin/employeemanagement/OrgChart";
// // import BulkImport from "./admin/employeemanagement/BulkImport";
// // import OffboardingPage from "./admin/employeemanagement/Offboarding";
// // import DepartmentsPage from "./admin/employeemanagement/Departments";
// // import JobRolesPage from "./admin/employeemanagement/JobRoles";
// // import AnnouncementsHistory from "./admin/announcements/AnnouncementsHistory";
// // import AnnouncementsCreate from "./admin/announcements/AnnouncementsCreate";
// // import AnnouncementsAnalytics from "./admin/announcements/AnnouncementsAnalytics";
// // import LeaveRequests from "./admin/leavemanagement/LeaveRequests";
// // import LeaveRequestDetail from "./admin/leavemanagement/LeaveRequestDetail";
// // import LeavePolicies from "./admin/leavemanagement/LeavePolicies";
// // import LeaveBalances from "./admin/leavemanagement/LeaveBalances";
// // import LeaveDashboard from "./admin/leavemanagement/LeaveDashboard";
// // import AdminAttendancePage from "./admin/attendance/AdminAttendancePage";
// // import AdminTrainingPage from "./admin/Training/TrainingPage";
// // import AdminPerformancePage from "./admin/performance/PerformancePage";
// // import AdminPayrollPage from "./admin/payroll/PayrollPage";
// // import AdminReportsPage from "./admin/reports/ReportsPage";
// // import AdminSettingsPage from "./admin/settings/SettingsPage";
// // import AdminEmployeeManagementPage from "./admin/employeemanagement/AdminEmployeeManagementPage";
// // import Register from "./login/Register";
// // import LoginPage from "./login/Login";
// // import CompanyRegister from "./login/CompanyRegister";
// // import AdminBenefitsPage from "./admin/benefits/BenefitsPage";
// // import DocumentTemplates from "./admin/documents/DocumentTemplates";
// // import AdminLeavePage from "./admin/leavemanagement/AdminLeavePage";

// // function App() {
// //   return (
// //     <Routes>
// //       {/* Auth */}
// //       <Route path="/login" element={<LoginPage />} />
// //       <Route path="/register" element={<Register />} />
// //       <Route path="/company-register" element={<CompanyRegister />} />
// //       {/* Employee HRIS Pages */}
// //       <Route path="/dashboard" element={<Dashboard />} />
// //       {/* <Route path="/attendance" element={<Attendance />} /> */}
// //       <Route path="/leave" element={<Leave />} />
// //       <Route path="/managerprofile" element={<ManagerProfile />} />
// //       <Route path="/employeeprofile" element={<ProfilePage />} />
// //       <Route path="/payslips" element={<PayslipsPage />} />
// //       <Route path="/attendance" element={<AttendancePage />} />
// //       <Route path="/documents" element={<DocumentsPage />} />
// //       <Route path="/performance" element={<Performance />} />
// //       <Route path="/training" element={<TrainingPage />} />
// //       <Route path="/team" element={<TeamPage />} />
// //       <Route path="/benefits" element={<BenefitsPage />} />
// //       <Route path="/settings" element={<SettingsPage />} />
// //       <Route path="/requests" element={<RequestsPage />} />
// //       <Route path="/announcements" element={<AnnouncementsPage />} />
// //       {/* ✅ Admin Section */}
// //       <Route path="/admin/dashboard" element={<AdminDashboard />} />
// //       {/* ✅ Admin EmployementManagement Section */}
// //       <Route
// //         path="/admin/employeemanagement/admin-employees"
// //         element={<AdminEmployeeManagementPage />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-employeeslist"
// //         element={<EmployeeList />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-addemployees"
// //         element={<AddEmployee />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-viewemployeesprofile/:employeeId"
// //         element={<EmployeeProfile />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-approvals"
// //         element={<ApprovalsPage />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-editemployee"
// //         element={<EditEmployee />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-orgchart"
// //         element={<OrgChart />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-import"
// //         element={<BulkImport />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-offboarding"
// //         element={<OffboardingPage />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-departments"
// //         element={<DepartmentsPage />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-jobroles"
// //         element={<JobRolesPage />}
// //       />
// //       <Route
// //         path="/admin/employeemanagement/admin-profilechangerequests"
// //         element={<ProfileChangeRequests />}
// //       />
// //       {/* ✅ Admin announcement Section */}
// //       <Route path="/admin/history" element={<AnnouncementsHistory />} />
// //       <Route path="/admin/create" element={<AnnouncementsCreate />} />
// //       <Route path="/admin/analytics" element={<AnnouncementsAnalytics />} />
// //       {/* ✅ Admin Leave Section */}

// //       <Route path="/admin/leave-management" element={<AdminLeavePage />} />
// //       {/* ✅ Admin attendance Section */}
// //       <Route
// //         path="/admin/attendance/admin-attendance"
// //         element={<AdminAttendancePage />}
// //       />
// //       {/* ✅ Admin training Section */}
// //       <Route
// //         path="/admin/training/admin-training"
// //         element={<AdminTrainingPage />}
// //       />
// //       {/* ✅ Admin performance Section */}
// //       <Route
// //         path="/admin/performance/admin-performance"
// //         element={<AdminPerformancePage />}
// //       />
// //       {/* ✅ Admin payroll Section */}
// //       <Route
// //         path="/admin/payroll/admin-payroll"
// //         element={<AdminPayrollPage />}
// //       />
// //       {/* ✅ Admin report Section */}
// //       <Route
// //         path="/admin/reports/admin-reports"
// //         element={<AdminReportsPage />}
// //       />
// //       {/* ✅ Admin settings Section */}
// //       <Route
// //         path="/admin/settings/admin-settings"
// //         element={<AdminSettingsPage />}
// //       />
// //       {/* ✅ Admin benefits Section */}
// //       <Route
// //         path="/admin/benefits/admin-benefits"
// //         element={<AdminBenefitsPage />}
// //       />
// //       {/* ✅ Admin Documents Section */}
// //       <Route
// //         path="/admin/documents/admin-documents"
// //         element={<DocumentTemplates />}
// //       />
// //     </Routes>
// //   );
// // }

// // export default App;

// import { Routes, Route,  } from "react-router-dom";
// // import { AuthProvider } from "./components/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoutes";
// import AdminRoute from "./components/AdminRoute";

// // Pages
// import Dashboard from "./pages/Dashboard";

// import Leave from "./pages/Leave";
// import Login from "./pages/Login";
// import ManagerProfile from "./pages/ManagerProfile";
// import ProfilePage from "./pages/ProfilePage";
// import PayslipsPage from "./pages/Payslips";
// import AttendancePage from "./pages/Attendance";
// import DocumentsPage from "./pages/Documents";
// import Performance from "./pages/Performance";
// import TrainingPage from "./pages/Training";
// import BenefitsPage from "./pages/Benefits";
// import TeamPage from "./pages/Team";
// import SettingsPage from "./pages/Settings";
// import RequestsPage from "./pages/Requests";
// import AnnouncementsPage from "./pages/Announcements";
// import AdminDashboard from "./admin/AdminDashboard";
// import Employees from "./admin/employeemanagement/EmployeeList";
// import EmployeeList from "./admin/employeemanagement/EmployeeList";
// import AddEmployee from "./admin/employeemanagement/AddEmployee";
// import EmployeeProfile from "./admin/employeemanagement/EmployeeProfile";
// import ApprovalsPage from "./admin/employeemanagement/Approvals";
// import EditEmployee from "./admin/employeemanagement/EditEmployee";
// import ProfileChangeRequests from "./admin/employeemanagement/ProfileChangeRequests";
// import OrgChart from "./admin/employeemanagement/OrgChart";
// import BulkImport from "./admin/employeemanagement/BulkImport";
// import OffboardingPage from "./admin/employeemanagement/Offboarding";
// import DepartmentsPage from "./admin/employeemanagement/Departments";
// import JobRolesPage from "./admin/employeemanagement/JobRoles";
// import AnnouncementsHistory from "./admin/announcements/AnnouncementsHistory";
// import AnnouncementsCreate from "./admin/announcements/AnnouncementsCreate";
// import AnnouncementsAnalytics from "./admin/announcements/AnnouncementsAnalytics";
// import LeaveRequests from "./admin/leavemanagement/LeaveRequests";
// import LeaveRequestDetail from "./admin/leavemanagement/LeaveRequestDetail";
// import LeavePolicies from "./admin/leavemanagement/LeavePolicies";
// import LeaveBalances from "./admin/leavemanagement/LeaveBalances";
// import LeaveDashboard from "./admin/leavemanagement/LeaveDashboard";
// import AdminAttendancePage from "./admin/attendance/AdminAttendancePage";
// import AdminTrainingPage from "./admin/Training/TrainingPage";
// import AdminPerformancePage from "./admin/performance/PerformancePage";
// import AdminPayrollPage from "./admin/payroll/PayrollPage";
// import AdminReportsPage from "./admin/reports/ReportsPage";
// import AdminSettingsPage from "./admin/settings/SettingsPage";
// import AdminEmployeeManagementPage from "./admin/employeemanagement/AdminEmployeeManagementPage";
// import Register from "./login/Register";
// import LoginPage from "./login/Login";
// import CompanyRegister from "./login/CompanyRegister";
// import AdminBenefitsPage from "./admin/benefits/BenefitsPage";
// import DocumentTemplates from "./admin/documents/DocumentTemplates";
// import AdminLeavePage from "./admin/leavemanagement/AdminLeavePage";

// // ... (All your imports remain the same)

// function App() {
//   return (

//         <Routes>
//           {/* ─── PUBLIC ROUTES ─── */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/company-register" element={<CompanyRegister />} />

//           {/* ─── EMPLOYEE ROUTES (Protected) ─── */}
//           <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/employeeprofile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//           <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
//           <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
//           <Route path="/payslips" element={<ProtectedRoute><PayslipsPage /></ProtectedRoute>} />
//           <Route path="/benefits" element={<ProtectedRoute><BenefitsPage /></ProtectedRoute>} />
//           <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
//           <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
//           <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
//           <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
//           <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
//           <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
//           <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />

//           {/* Manager Specific */}
//           <Route path="/managerprofile" element={
//             <ProtectedRoute requireManager><ManagerProfile /></ProtectedRoute>
//           } />

//           {/* ─── ADMIN ROUTES (Admin Protected) ─── */}
//           <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

//           {/* Employee Management */}
//           <Route path="/admin/employeemanagement/admin-employees" element={<AdminRoute><AdminEmployeeManagementPage /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-employeeslist" element={<AdminRoute><EmployeeList /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-addemployees" element={<AdminRoute><AddEmployee /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-viewemployeesprofile/:employeeId" element={<AdminRoute><EmployeeProfile /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-approvals" element={<AdminRoute><ApprovalsPage /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-editemployee" element={<AdminRoute><EditEmployee /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-orgchart" element={<AdminRoute><OrgChart /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-import" element={<AdminRoute><BulkImport /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-offboarding" element={<AdminRoute><OffboardingPage /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
//           <Route path="/admin/employeemanagement/admin-jobroles" element={<AdminRoute><JobRolesPage /></AdminRoute>} />

//           {/* Other Admin Modules */}
//           <Route path="/admin/leave-management" element={<AdminRoute><AdminLeavePage /></AdminRoute>} />
//           <Route path="/admin/attendance/admin-attendance" element={<AdminRoute><AdminAttendancePage /></AdminRoute>} />
//           <Route path="/admin/training/admin-training" element={<AdminRoute><AdminTrainingPage /></AdminRoute>} />
//           <Route path="/admin/performance/admin-performance" element={<AdminRoute><AdminPerformancePage /></AdminRoute>} />
//           <Route path="/admin/payroll/admin-payroll" element={<AdminRoute><AdminPayrollPage /></AdminRoute>} />
//           <Route path="/admin/benefits/admin-benefits" element={<AdminRoute><AdminBenefitsPage /></AdminRoute>} />
//           <Route path="/admin/documents/admin-documents" element={<AdminRoute><DocumentTemplates /></AdminRoute>} />

//           {/* Announcements */}
//           <Route path="/admin/history" element={<AdminRoute><AnnouncementsHistory /></AdminRoute>} />
//           <Route path="/admin/create" element={<AdminRoute><AnnouncementsCreate /></AdminRoute>} />
//           <Route path="/admin/analytics" element={<AdminRoute><AnnouncementsAnalytics /></AdminRoute>} />
//         </Routes>

//   );
// }

// export default App;

// src/App.jsx
// Clean production router — all routes wired correctly.
// EditEmployee now uses :id param.
// ProfileChangeRequests added.

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoutes";
import AdminRoute from "./components/AdminRoute";

// ── Auth pages ──
import LoginPage from "./login/Login";
import Register from "./login/Register";
import CompanyRegister from "./login/CompanyRegister";

// ── Employee pages ──
import Dashboard from "./pages/Dashboard";
import Leave from "./pages/Leave";
import ManagerProfile from "./pages/ManagerProfile";
import ProfilePage from "./pages/ProfilePage";
import PayslipsPage from "./pages/Payslips";
import AttendancePage from "./pages/Attendance";
import DocumentsPage from "./pages/Documents";
import Performance from "./pages/Performance";
import TrainingPage from "./pages/Training";
import BenefitsPage from "./pages/Benefits";
import TeamPage from "./pages/Team";
import SettingsPage from "./pages/Settings";
import RequestsPage from "./pages/Requests";
import AnnouncementsPage from "./pages/Announcements";
import LandingPage from "./pages/LandingPage";
import RequestDemo from "./pages/RequestDemo";

// ── Admin pages ──
import AdminDashboard from "./admin/AdminDashboard";
import AdminEmployeeManagementPage from "./admin/employeemanagement/AdminEmployeeManagementPage";
import EmployeeList from "./admin/employeemanagement/EmployeeList";
import AddEmployee from "./admin/employeemanagement/AddEmployee";
import EmployeeProfile from "./admin/employeemanagement/EmployeeProfile";
import EditEmployee from "./admin/employeemanagement/EditEmployee";
import ProfileChangeRequests from "./admin/employeemanagement/ProfileChangeRequests";
import ApprovalsPage from "./admin/employeemanagement/Approvals";
import OrgChart from "./admin/employeemanagement/OrgChart";
import BulkImport from "./admin/employeemanagement/BulkImport";
import OffboardingPage from "./admin/employeemanagement/Offboarding";
import DepartmentsPage from "./admin/employeemanagement/Departments";
import JobRolesPage from "./admin/employeemanagement/JobRoles";
import AnnouncementsHistory from "./admin/announcements/AnnouncementsHistory";
import AnnouncementsCreate from "./admin/announcements/AnnouncementsCreate";
import AnnouncementsAnalytics from "./admin/announcements/AnnouncementsAnalytics";
import AdminLeavePage from "./admin/leavemanagement/AdminLeavePage";
import AdminAttendancePage from "./admin/attendance/AdminAttendancePage";
import AdminTrainingPage from "./admin/Training/TrainingPage";
import AdminPerformancePage from "./admin/performance/PerformancePage";
import AdminPayrollPage from "./admin/payroll/PayrollPage";
import AdminReportsPage from "./admin/reports/ReportsPage";
import AdminSettingsPage from "./admin/settings/SettingsPage";
import AdminBenefitsPage from "./admin/benefits/BenefitsPage";
import DocumentTemplates from "./admin/documents/DocumentTemplates";
import ChatPage from "./pages/Chat";

function App() {
  return (
    <Routes>
      {/* ─── PUBLIC ─── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/company-register" element={<CompanyRegister />} />

      <Route path="/" element={<LandingPage />} />
      <Route path="/request-demo" element={<RequestDemo />} />
      {/* ─── EMPLOYEE (Protected) ─── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Keep legacy path working */}
      <Route
        path="/employeeprofile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <Leave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payslips"
        element={
          <ProtectedRoute>
            <PayslipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/benefits"
        element={
          <ProtectedRoute>
            <BenefitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <TrainingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      {/* Manager only */}
      <Route
        path="/managerprofile"
        element={
          <ProtectedRoute requireManager>
            <ManagerProfile />
          </ProtectedRoute>
        }
      />
      {/* ─── ADMIN (AdminRoute = hr_admin | super_admin | manager) ─── */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      {/* Employee Management */}
      <Route
        path="/admin/employeemanagement/admin-employees"
        element={
          <AdminRoute>
            <AdminEmployeeManagementPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-employeeslist"
        element={
          <AdminRoute>
            <EmployeeList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-addemployees"
        element={
          <AdminRoute>
            <AddEmployee />
          </AdminRoute>
        }
      />
      {/* <Route path="/admin/employeemanagement/admin-viewemployeesprofile/:employeeId"
        element={<AdminRoute><EmployeeProfile /></AdminRoute>} /> */}
      {/* Add this so the short URL works */}
      <Route
        path="/admin/employees/:id"
        element={
          <AdminRoute>
            <EmployeeProfile />
          </AdminRoute>
        }
      />
      {/* EditEmployee — :id param */}
      <Route
        path="/admin/employeemanagement/admin-editemployee/:id"
        element={
          <AdminRoute>
            <EditEmployee />
          </AdminRoute>
        }
      />
      {/* Profile change requests */}
      <Route
        path="/admin/employeemanagement/admin-profilechangerequests"
        element={
          <AdminRoute>
            <ProfileChangeRequests />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-approvals"
        element={
          <AdminRoute>
            <ApprovalsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-orgchart"
        element={
          <AdminRoute>
            <OrgChart />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-import"
        element={
          <AdminRoute>
            <BulkImport />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-offboarding"
        element={
          <AdminRoute>
            <OffboardingPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-departments"
        element={
          <AdminRoute>
            <DepartmentsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employeemanagement/admin-jobroles"
        element={
          <AdminRoute>
            <JobRolesPage />
          </AdminRoute>
        }
      />
      {/* Announcements */}
      <Route
        path="/admin/history"
        element={
          <AdminRoute>
            <AnnouncementsHistory />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/create"
        element={
          <AdminRoute>
            <AnnouncementsCreate />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AnnouncementsAnalytics />
          </AdminRoute>
        }
      />
      {/* Other modules */}
      <Route
        path="/admin/leave-management"
        element={
          <AdminRoute>
            <AdminLeavePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/attendance/admin-attendance"
        element={
          <AdminRoute>
            <AdminAttendancePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/training/admin-training"
        element={
          <AdminRoute>
            <AdminTrainingPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/performance/admin-performance"
        element={
          <AdminRoute>
            <AdminPerformancePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/payroll/admin-payroll"
        element={
          <AdminRoute>
            <AdminPayrollPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports/admin-reports"
        element={
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings/admin-settings"
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/benefits/admin-benefits"
        element={
          <AdminRoute>
            <AdminBenefitsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/documents/admin-documents"
        element={
          <AdminRoute>
            <DocumentTemplates />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
