import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../Api/userApiCall';
import { setUser } from '../Redux/Slice/UserSlice';
import { getStoredAuthToken } from '../Utils/tokenUtils';

const ProtectedRoute = () => {
    const token = getStoredAuthToken();

    const dispatch = useDispatch();

    useEffect(() => {
        if (!token) return;

        const getUser = async () => {
            try {
                const response = await getCurrentUser();

                const user = response?.user || response;

                if (user) {
                    dispatch(setUser(user));
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        getUser();
    }, [token, dispatch]);

    if (!token) {
        return <Navigate to="/welcome" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;