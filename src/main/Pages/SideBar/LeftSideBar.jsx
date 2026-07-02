import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Avatar } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import * as LottieModule from "lottie-react";
const Lottie = LottieModule?.default || LottieModule;
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useRef, useEffect } from "react";
import lottieWeb from "lottie-web";
// import Chatbot from '../../../assets/Chatbot.json';
import { useDispatch, useSelector } from 'react-redux';
import animation from '../../../assets/animation.json'
import { createConversation } from '../../Api/conversationCall';
import { SetSelectedChat } from '../../Redux/Slice/ChatSlice';



const InlineLottie = ({ animationData, style }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || !animationData) return;
        const anim = lottieWeb.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData,
        });
        return () => anim.destroy();
    }, [animationData]);
    return <div ref={containerRef} style={style} />;
};

const LeftSideBar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const currentUser = useSelector((state) => { return state.user.user })
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.clear();
        navigate('/welcome');
    };
    const createChatWithBot = async () => {
        try {
            const botUserId = ["chatbot", currentUser.userId];
            const isGroup = false;
            const groupName = "ChatBot";
            const response = await createConversation(botUserId, isGroup, groupName);
            if (response && response.conversation_id) {
                dispatch(SetSelectedChat(response));
            }
        } catch (error) {
            console.error("Error creating chat with bot:", error);
        }
    }
    return (
        <>
            <Box
                sx={{
                    width: isMobile ? "100%" : 72,
                    height: isMobile ? 60 : "100%",
                    position: isMobile ? "fixed" : "relative",
                    bottom: isMobile ? 0 : "auto",
                    bgcolor: "#ecf9f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile ? "space-evenly" : "space-between",
                    flexDirection: isMobile ? "row" : "column",
                    zIndex: 10,
                    borderRight: !isMobile ? "1px solid #e9edef" : "1px solid #e9edef",
                    boxShadow: isMobile ? "0 -1px 2px rgba(0, 0, 0, 0.1)" : "none"
                }}
            >
                {/* upper leftbar */}
                <Box sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: isMobile ? "row" : "column",
                    justifyContent: isMobile ? "space-evenly" : "space-between",
                    alignItems: "center",
                    px: isMobile ? 0 : 2,
                    py: isMobile ? 0 : 3,
                    gap: isMobile ? 0 : 2.5
                }}>
                    {/* WhatsApp Icon */}
                    <Box
                        onClick={() => navigate('/home')}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            },
                            "&:active": {
                                bgcolor: "#ddd"
                            }
                        }}
                    >
                        <WhatsAppIcon sx={{ fontSize: "26px", color: "#06cf9c" }} />
                    </Box>

                    {/* Status Icon */}
                    <Box
                        onClick={() => navigate('/status')}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            },
                            "&:active": {
                                bgcolor: "#ddd"
                            }
                        }}
                    >
                        <PanoramaFishEyeIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                    </Box>

                    {/* Divider for desktop */}
                    {!isMobile && (
                        <Divider sx={{
                            width: "32px",
                            bgcolor: "#e9edef",
                            my: 1
                        }} />
                    )}

                    {/* Chatbot Animation */}
                    <Box
                        onClick={createChatWithBot}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            },
                            "&:active": {
                                bgcolor: "#ddd"
                            }
                        }}
                    >
                        {animation && (typeof Lottie === 'function' ? (
                            <Lottie
                                animationData={animation}
                                loop
                                autoplay
                                style={{ height: 45, width: 45 }}
                            />
                        ) : (
                            <InlineLottie animationData={animation} style={{ height: 25, width: 35 }} />
                        ))}
                    </Box>
                </Box>

                {/* lower leftbar */}
                <Box sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: isMobile ? "row" : "column",
                    justifyContent: isMobile ? "space-evenly" : "space-between",
                    alignItems: "center",
                    px: isMobile ? 0 : 2,
                    py: isMobile ? 0 : 3,
                    gap: isMobile ? 0 : 2.5
                }}>
                    {/* Settings Icon */}
                    <Box
                        onClick={() => navigate('/settings')}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            },
                            "&:active": {
                                bgcolor: "#ddd"
                            }
                        }}
                    >
                        <SettingsIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                    </Box>

                    {/* User Profile Avatar */}
                    <Avatar
                        src={currentUser?.profilePicture || currentUser?.profilePictureUrl || ""}
                        sx={{
                            width: 35,
                            height: 35,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                            },
                            border: "2px solid transparent",
                            bgcolor: "#b0ddf5"
                        }}
                        onClick={() => navigate('/profile')}
                    />

                    {/* Logout Icon */}
                    <Box
                        onClick={handleLogout}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            },
                            "&:active": {
                                bgcolor: "#ddd"
                            }
                        }}
                    >
                        <LogoutIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default LeftSideBar;
