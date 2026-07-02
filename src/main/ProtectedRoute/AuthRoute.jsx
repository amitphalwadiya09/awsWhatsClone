import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredAuthToken } from '../Utils/tokenUtils';

const AuthRoute = () => {
    const token = getStoredAuthToken();

    if (token) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default AuthRoute;