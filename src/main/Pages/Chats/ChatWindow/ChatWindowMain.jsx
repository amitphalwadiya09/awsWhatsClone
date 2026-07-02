import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import ChatWindowHeader from './ChatWindowHeader';
import ChatWindow from './ChatWindow';
import ChatUserProfile from './ChatUserProfile';
import WithOutChatWindow from '../WithOutChatWindow';
import { Box } from '@mui/material';
import { useTheme, useMediaQuery } from "@mui/material";

const ChatWindowMain = () => {
    const { selectedChat } = useSelector((state) => state.chat || {});
    const [showProfile, setShowProfile] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    return (
        <>
            <Box>
                {selectedChat ? (<Box
                    sx={{
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "#ece5dd",
                        position: "relative",
                        height: "100vh",
                        zIndex: 100,

                    }}
                >
                    <ChatWindowHeader showDetails={showProfile} setShowDetails={setShowProfile} />
                    <ChatWindow />
                    {showProfile && (
                        <ChatUserProfile onClose={() => setShowProfile(false)} />
                    )}
                </Box>) : (<WithOutChatWindow></WithOutChatWindow>)}
            </Box>
        </>

    )
}

export default ChatWindowMain