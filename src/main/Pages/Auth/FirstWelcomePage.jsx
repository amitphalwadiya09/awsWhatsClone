import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthShell from './AuthShell';

const FirstWelcomePage = () => {
    const navigate = useNavigate();

    return (
        <AuthShell
            title="Welcome to WhatsApp"
            subtitle="Connect with friends and family instantly with a fresh green-blue theme."
        >
            <Box sx={{ maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: '#25D366',
                        color: '#fff',
                        fontWeight: 700,
                        py: 1.5,
                        px: 4,
                        '&:hover': { bgcolor: '#1EA34D' }
                    }}
                    onClick={() => navigate('/login')}
                >
                    Agree & Continue
                </Button>
            </Box>
        </AuthShell>
    );
};

export default FirstWelcomePage