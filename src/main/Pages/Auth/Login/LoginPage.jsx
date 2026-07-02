import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider, Link } from "@mui/material";
import { toast } from "react-toastify";
import { signInWithCognito } from '../../../CognitoAuth/Cognito';
import { useNavigate } from 'react-router-dom';
import ForgetPasswordPage from './ForgetPasswordPage';
import AuthShell from '../AuthShell';
import { handleLogin } from '../../../Functions/handleLogin';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getErrorMessage = (errorObject, fallback) => {
        return (
            errorObject?.message ||
            errorObject?.code ||
            errorObject?.name ||
            errorObject?.response?.data?.message ||
            fallback
        );
    };

    const handleLoginClick = async () => {
        try {
            await handleLogin(email, password);
            navigate('/home');

        } catch (error) {
            const message = getErrorMessage(error, "Invalid email or password");
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }


    const handleForgotPassword = () => setForgotPassword(true);

    const handleKeyPress = (event) => { if (event.key === 'Enter') handleLoginClick(); };

    return (
        <>
            {!forgotPassword &&
                <AuthShell
                    title="Welcome back"
                    subtitle="Sign in with your email and password to access your chat in a calm green-blue space."
                >
                    <Box sx={{ maxWidth: 380, mx: 'auto' }}>
                        <TextField
                            fullWidth
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            onKeyPress={handleKeyPress}
                            placeholder="name@example.com"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your password"
                            sx={{ mb: 1.5 }}
                        />

                        {error && (
                            <Typography sx={{ color: '#DC2626', fontSize: 13, mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLoginClick}
                            disabled={loading}
                            sx={{
                                bgcolor: '#25D366',
                                color: '#fff',
                                fontWeight: 700,
                                py: 1.5,
                                mb: 2,
                                '&:hover': { bgcolor: '#1EA34D' }
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>

                        <Divider sx={{ my: 2, borderColor: 'rgba(15, 23, 42, 0.16)' }} />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, mt: 1 }}>
                            <Link component="button" underline="hover" onClick={handleForgotPassword} sx={{ color: '#1B5E20', fontWeight: 700 }}>
                                Forgot password?
                            </Link>
                            <Link component="button" underline="hover" onClick={() => navigate('/register')} sx={{ color: '#1B5E20', fontWeight: 700 }}>
                                Create account
                            </Link>
                        </Box>

                        <Typography sx={{ mt: 2, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                            Need help? <Link component="button" onClick={() => navigate('/support')} sx={{ color: '#1B5E20' }}>Contact support</Link>
                        </Typography>
                    </Box>
                </AuthShell>}
            {forgotPassword && <ForgetPasswordPage />}
        </>
    )
}

