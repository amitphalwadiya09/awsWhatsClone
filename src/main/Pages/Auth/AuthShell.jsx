import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const authWrapperStyles = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    bgcolor: 'linear-gradient(180deg, #E8FBF2 0%, #C1EBD7 30%, #7ACEB0 65%, #1B5E40 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
};

const authCardStyles = {
    width: '100%',
    maxWidth: 460,
    p: { xs: 3, sm: 4 },
    borderRadius: 4,
    border: '1px solid rgba(15, 23, 42, 0.08)',
    bgcolor: 'rgba(255,255,255,0.96)',
    boxShadow: '0 32px 80px rgba(15, 23, 42, 0.16)',
    maxHeight: 'calc(100vh - 80px)',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { width: 0, height: 0 },
};

const authHeaderStyles = {
    maxWidth: 420,
    mx: 'auto',
    textAlign: 'center',
    mb: 3,
};

const AuthShell = ({ title, subtitle, children }) => {
    return (
        <Box sx={authWrapperStyles}>
            <Paper elevation={10} sx={authCardStyles}>
                <Box sx={authHeaderStyles}>
                    <Box sx={{ width: 72, height: 72, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', bgcolor: 'rgba(37,211,102,0.16)', border: '1px solid rgba(37,211,102,0.28)', mb: 2 }}>
                        <WhatsAppIcon sx={{ fontSize: 34, color: '#25D366' }} />
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0F1720', mb: 1 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: 15, lineHeight: 1.75 }}>
                        {subtitle}
                    </Typography>
                </Box>
                {children}
            </Paper>
        </Box>
    );
};

export default AuthShell;
