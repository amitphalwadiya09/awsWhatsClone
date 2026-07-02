import { Box, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import LeftSideBar from '../SideBar/LeftSideBar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    return (
        <Box sx={{ display: "flex", height: "100vh", flexDirection: "row" }}>
            {!isMobile && <LeftSideBar></LeftSideBar>}

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <Outlet />
            </Box>

            {isMobile && <LeftSideBar isMobile={isMobile}></LeftSideBar>}
        </Box>
    )
}

export default AppLayout