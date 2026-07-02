import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider, Link
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import OtpInputPage from "./OtpInputPage";
import { resendConfirmationCode, signUpWithCognito } from "../../../CognitoAuth/Cognito";
import AuthShell from '../AuthShell';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpInput, setOtpInput] = useState(false);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('complete') === '1') {
            navigate('/home');
        }
    }, [location.search, navigate]);

    const getErrorMessage = (errorObject, fallback) => {
        return errorObject?.message || errorObject?.response?.data?.message || fallback;
    };


    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            const message = "Please fill in all fields";
            setError(message);
            return toast.error(message);
        }
        if (password !== confirmPassword) {
            const message = "Passwords do not match";
            setError(message);
            return toast.error(message);
        }

        try {
            setLoading(true);
            setError('');
            const response = await signUpWithCognito(email, password);
            setUserId(response.userSub);
            toast.success("Verification code sent to your email");

            setOtpInput(true);
        } catch (err) {
            if (
                err?.code === "UsernameExistsException" ||
                err?.message?.includes("UsernameExistsException")
            ) {
                try {
                    if (!email) {
                        const message = 'Missing userId or email. Please restart registration.';
                        setError(message);
                        return toast.error(message);
                    }
                    await resendConfirmationCode(email);
                    toast.info(
                        "Account already exists but email is not verified. A new OTP has been sent."
                    );
                    setOtpInput(true);
                    return;

                } catch (error) {
                    toast.error("Failed to resend OTP");
                }
            }
            toast.error(err?.message || "Registration failed");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        !otpInput ?
            (<AuthShell
                title="Create your account"
                subtitle="Sign up with email and password, then verify with a one-time code."
            >
                <Box sx={{ maxWidth: 380, mx: 'auto' }}>
                    <TextField
                        fullWidth
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        disabled={loading}
                        placeholder="name@example.com"
                        sx={{ mb: 1 }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        disabled={loading}
                        placeholder="Create a password"
                        sx={{ mb: 1 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        disabled={loading}
                        placeholder="Repeat your password"
                        sx={{ mb: .2 }}
                    />
                    <Typography sx={{ textAlign: 'center', color: '#6B7280', fontSize: 13, mb: 1 }}>
                        *password must including uppercase, lowercase, number, and special character.
                    </Typography>

                    {error && (
                        <Typography sx={{ color: '#DC2626', fontSize: 13, mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleRegister}
                        disabled={loading}
                        sx={{
                            bgcolor: '#25D366',
                            color: '#fff',
                            fontWeight: 700,
                            py: 1,
                            mb: 2,
                            '&:hover': { bgcolor: '#1EA34D' }
                        }}
                    >
                        {loading ? 'Creating account…' : 'Sign up'}
                    </Button>

                    <Divider sx={{ my: 2, borderColor: 'rgba(15, 23, 42, 0.12)' }} />

                    <Link component="button" underline="hover" onClick={() => navigate('/login')} sx={{ color: '#1B5E20', fontWeight: 700, justifyContent: 'center', display: 'flex' }}>
                        Already have an account? Sign in
                    </Link>


                </Box>
            </AuthShell>) : (<OtpInputPage userId={userId} email={email} password={password}></OtpInputPage>)
    )
}

export default RegisterPage