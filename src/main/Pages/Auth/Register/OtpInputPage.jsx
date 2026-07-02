import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { confirmSignUpCognito, resendConfirmationCode, signInWithCognito } from '../../../CognitoAuth/Cognito';
import CreateUserDetails from './CreateUserDetails';
import { createUser } from '../../../Api/userApiCall';
import AuthShell from '../AuthShell';
import { useNavigate } from 'react-router-dom';
import { handleLogin } from '../../../Functions/handleLogin';

const OtpInputPage = ({ userId, email, password }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const getErrorMessage = (errorObject, fallback) => {
        return (
            errorObject?.message ||
            errorObject?.code ||
            errorObject?.name ||
            errorObject?.response?.data?.message ||
            fallback
        );
    };

    const handleLoginAfterVerification = async () => {
        try {
            const result = await handleLogin(email, password);
            // const normalizedEmail = email?.trim().toLowerCase();
            // await createUser(normalizedEmail);

            if (result?.idToken) {
                console.log("Tokens stored successfully");
            }
            navigate('/home');
        } catch (error) {
            const message = error?.message || getErrorMessage(error, "Login failed. Please try again.");
            setError(message);
            toast.error(message);
            throw error; // Re-throw to prevent showing CreateUserDetails
        }
    }


    const handleVerify = async () => {
        if (!code) {
            const message = 'Enter the verification code';
            setError(message);
            return toast.error(message);
        }

        if (!email) {
            const message = 'Missing email. Please restart registration.';
            setError(message);
            return toast.error(message);
        }

        try {
            setLoading(true);
            setError('');

            const normalizedPassword = password?.trim();
            const normalizedEmail = email?.trim().toLowerCase();

            await confirmSignUpCognito(normalizedEmail, code);

            // await createUser(userId, normalizedEmail);
            await handleLoginAfterVerification();
            navigate('/');

            toast.success('Email verified successfully');

        } catch (error) {
            const message = getErrorMessage(error, 'Verification failed. Please try again.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            setError('');
            await resendConfirmationCode(email);
            toast.success('Verification code resent to your email');
        } catch (error) {
            const message = getErrorMessage(error, 'Failed to resend code. Please try again.');
            setError(message);
            toast.error(message);
        } finally {
            setResendLoading(false);
        }
    };

    return (

        <AuthShell
            title="Verify your email"
            subtitle={`Enter the verification code we sent to ${email}`}
        >
            <Box sx={{ maxWidth: 380, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Verification code"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(''); }}
                    disabled={loading}
                    placeholder="Enter 6-digit code"
                    sx={{ mb: 0 }}
                />

                {error && (
                    <Typography sx={{ color: '#DC2626', fontSize: 13, mb: 0, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerify}
                    disabled={loading || !code}
                    sx={{
                        bgcolor: '#25D366',
                        color: '#fff',
                        fontWeight: 700,
                        py: 1.5,
                        width: '100%',
                        '&:hover': { bgcolor: '#1EA34D' }
                    }}
                >
                    {loading ? 'Verifying…' : 'Verify email'}
                </Button>

                <Typography sx={{ textAlign: 'center', color: '#475569', fontSize: 13, mb: 0 }}>
                    Didn't receive the code?
                </Typography>
                <Button
                    fullWidth
                    variant="text"
                    onClick={handleResend}
                    disabled={resendLoading}
                    sx={{
                        color: '#25D366',
                        fontWeight: 600,
                        textTransform: 'none'
                    }}
                >
                    {resendLoading ? 'Resending…' : 'Resend code'}
                </Button>
            </Box>
        </AuthShell>
    );
};

export default OtpInputPage;
