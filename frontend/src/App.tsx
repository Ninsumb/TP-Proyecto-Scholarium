import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './main/Pages/Auth/Login'
import Register from './main/Pages/Auth/Register'
import './App.css'
import { Home } from './main/Pages/Home/MisPortales'
import { LayoutMain } from './main/Layouts/LayoutMain'
import { ExplorePortals } from './main/Pages/Home/ExplorarPortales'
import { CreatePortal } from './main/Pages/Home/CrearPortal'
import { PortalLayout } from './main/Layouts/PortalLayout'
import { HomeWithBlocks } from './main/Pages/Portal/PortalHome'
import { Subjects } from './main/Pages/Portal/Materias/MateriasEstructura'
import { SubjectDetail } from './main/Pages/Portal/Materias/Materia'
import { ForumBoardsList } from './main/Pages/Portal/Foro/Foro'
import { ForumBoardView } from './main/Pages/Portal/Foro/Tablero'
import { JoinPortal } from './main/Pages/Portal/Solicitud/Solicitud'
import { RequestStatus } from './main/Pages/Portal/Solicitud/SolicitudEstado'
import { ProtectedRoute } from './main/Components/common/ProtectedRoute'
import { AccountSettings } from './main/Pages/Perfil/CuentaConfig'
import { RequestsAndMaterial } from './main/Pages/Portal/Admin/SolicitudesYMaterial'
import { AdminPanel } from './main/Pages/Portal/Admin/PanelDeAdministracion'
import { PortalConfig } from './main/Pages/Portal/Admin/ConfiguracionPortal'
import { Notifications } from './main/Pages/Perfil/Notificaciones'
import { AdminRoute } from './main/Components/common/AdminRoute'
import ForgotPassword from './main/Pages/Auth/ForgotPassword'
import ResetPassword from './main/Pages/Auth/ResetPassword'


function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige la raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={
          <ProtectedRoute> 
            <LayoutMain/> 
          </ProtectedRoute>
        }>
          
          <Route path="/home" element={<Home />} /> 
          <Route path="/configuracion" element={<AccountSettings />} /> 
          <Route path="/notificaciones" element={<Notifications />} /> 
          <Route path="/explorar-portales" element={<ExplorePortals />} /> 
          <Route path="/crear-portal" element={<CreatePortal />} /> 


          <Route path="/portal/:portalId" element={<PortalLayout/>}> 
            <Route index element={<HomeWithBlocks />} /> 
            <Route path="/portal/:portalId/materias" element={<Subjects />} /> 
            <Route path="/portal/:portalId/materias/:id" element={<SubjectDetail />} /> 
            <Route path="/portal/:portalId/foro" element={<ForumBoardsList />} /> 
            <Route path="/portal/:portalId/foro/:boardId" element={<ForumBoardView />} /> 
            <Route path="/portal/:portalId/admin/solicitudes" element={<AdminRoute><RequestsAndMaterial /></AdminRoute>} />
            <Route path="/portal/:portalId/admin/panel" element={ <AdminRoute><AdminPanel /> </AdminRoute>} />
            <Route path="/portal/:portalId/admin/configuracion"  element={<AdminRoute><PortalConfig /></AdminRoute>} />
            <Route path="/portal/:portalId/solicitud" element={<JoinPortal />} /> 
            <Route path="/portal/:portalId/solicitud-estado" element={<RequestStatus />} /> 
          </Route>

        </Route>
      </Routes>
    </Router>
  )
}

export default App