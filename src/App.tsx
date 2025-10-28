import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

import DefinitionsPage from './pages/DefinitionsPage'
import TasksPage from './pages/TasksPage'
import AdminDeployments from './pages/AdminDeployments'
import IncidentsPage from './pages/IncidentsPage'
import InstancesPage from './pages/InstancesPage'
import LoginPage from './pages/LoginPage'

function isLoggedIn() {
  return !!(sessionStorage.getItem('authUser') && sessionStorage.getItem('authPass'));
}

function PrivateRoute({ element }: { element: JSX.Element }) {
  return isLoggedIn() ? element : <Navigate to="/login" replace />;
}
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/definitions" element={<PrivateRoute element={<DefinitionsPage/>} />} />
        <Route path="/instances" element={<PrivateRoute element={<InstancesPage/>} />} />
        <Route path="/tasks" element={<PrivateRoute element={<TasksPage/>} />} />
        <Route path="/admin" element={<PrivateRoute element={<AdminDeployments/>} />} />
        <Route path="/incidents" element={<PrivateRoute element={<IncidentsPage/>} />} />
        <Route path="*" element={<Navigate to="/definitions" replace />} />
      </Routes>
    </BrowserRouter>
  )
}