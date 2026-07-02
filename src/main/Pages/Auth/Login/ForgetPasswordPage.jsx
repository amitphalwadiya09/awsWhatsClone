
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { confirmNewPasswordCognito, forgotPasswordCognito } from '../../../CognitoAuth/Cognito';
import AuthShell from '../AuthShell';

const ForgetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [error, setError] = useState('');

    const getErrorMessage = (errorObject, fallback) => {
        return errorObject?.message || errorObject?.response?.data?.message || fallback;
    };

    const sendCode = async () => {
        if (!email) {
            const message = 'Enter your email';
            setError(message);
            return toast.error(message);
        }

        try {
            setLoading(true);
            setError('');
            await forgotPasswordCognito(email);
            setIsCodeSent(true);
            toast.success('Verification code sent to your email');
        } catch (error) {
            const message = getErrorMessage(error, 'Failed to send verification code');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const confirmPassword = async () => {
        if (!verificationCode || !newPassword) {
            const message = 'Enter code and new password';
            setError(message);
            return toast.error(message);
        }

        try {
            setLoading(true);
            setError('');
            await confirmNewPasswordCognito(email, verificationCode, newPassword);
            toast.success('Password reset successfully');
            window.history.back();
        } catch (error) {
            const message = getErrorMessage(error, 'Failed to reset password');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Reset your password"
            subtitle="Enter your account email and we’ll send a verification code to reset your password."
        >
            <Box sx={{ maxWidth: 380, mx: 'auto' }}>
                <TextField
                    fullWidth
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@example.com"
                    sx={{ mb: 2 }}
                />

                {isCodeSent && (
                    <>
                        <TextField
                            fullWidth
                            label="Verification code"
                            value={verificationCode}
                            onChange={(e) => { setVerificationCode(e.target.value); setError(''); }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="New password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                            sx={{ mb: 2 }}
                        />
                    </>
                )}

                {error && (
                    <Typography sx={{ color: '#DC2626', fontSize: 13, mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    onClick={isCodeSent ? confirmPassword : sendCode}
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
                    {loading ? 'Working…' : isCodeSent ? 'Confirm new password' : 'Send verification code'}
                </Button>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => window.history.back()}
                    sx={{ borderColor: '#25D366', color: '#25D366', fontWeight: 700, py: 1.2 }}
                >
                    Back to login
                </Button>
            </Box>
        </AuthShell>
    );
};

export default ForgetPasswordPage;
