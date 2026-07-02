import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

import FirstWelcomePage from '../Auth/FirstWelcomePage'
import { LoginPage } from '../Auth/Login/LoginPage'
import RegisterPage from '../Auth/Register/RegisterPage'
import ForgetPasswordPage from '../Auth/Login/ForgetPasswordPage'

import ProtectedRoute from '../../ProtectedRoute/ProtectedRoute'
import AuthRoute from '../../ProtectedRoute/AuthRoute'

import AppLayout from './AppLayout'
import HomePage from './HomePage'
import CreateUserDetails from '../Auth/Register/CreateUserDetails'
import UserProfile from '../UserProfile/UserProfile'
import SettingPage from '../Setting/SettingPage'
import StatusPage from '../statusSection/StatusPage'

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route element={<AuthRoute />}>
                    <Route path='/welcome' element={<FirstWelcomePage />} />
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route path='/forgot-password' element={<ForgetPasswordPage />} />

                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path='/'
                        element={<CreateUserDetails />}
                    />

                    <Route element={<AppLayout />}>
                        <Route
                            path='/home'
                            element={<HomePage />}
                        />
                        <Route
                            path='/profile'
                            element={<UserProfile />}
                        />
                        <Route
                            path='/settings'
                            element={<SettingPage />}
                        />
                        <Route
                            path='/status'
                            element={<StatusPage></StatusPage>}>

                        </Route>

                    </Route>

                </Route>

                {/* Fallback */}
                <Route
                    path='*'
                    element={<Navigate to='/welcome' replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes