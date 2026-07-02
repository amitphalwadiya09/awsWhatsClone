import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { SetSelectedChat } from "../../../Redux/Slice/ChatSlice";


const ChatWindowHeader = ({ showDetails, setShowDetails }) => {
    const selectedChat = useSelector((state) => state.chat.selectedChat);
    const currentUser = useSelector((state) => state.user.user);
    const currentUserId = currentUser?.userId || currentUser?._id;
    const selectedChatParticipants = useSelector((state) => state.chat.selectedChatParticipants) || [];
    const safeSelectedChat = Array.isArray(selectedChat) ? null : selectedChat;
    const participantList = selectedChatParticipants?.length ? selectedChatParticipants : safeSelectedChat?.participants || [];

    const otherUser = participantList.find((user) => {
        const participantId = user?.userId || user?._id;
        return String(participantId) !== String(currentUserId);
    });
    const isGroupChat = Boolean(safeSelectedChat?.isGroup);
    const chatName = isGroupChat ? safeSelectedChat.groupName : otherUser?.username;
    const avatarSrc = isGroupChat ? safeSelectedChat.groupPicture : otherUser?.profilePicture;
    const normalizeId = (value) => (value == null ? "" : String(value));
    const otherUserId = normalizeId(otherUser?.userId || otherUser?._id);

    const onlineUser = useSelector((state) => state.userData.onlineUser);
    const normalizedOnlineUsers = React.useMemo(
        () => new Set((onlineUser || []).map((userId) => normalizeId(userId))),
        [onlineUser]
    );
    const isUserOnline = Boolean(otherUserId && normalizedOnlineUsers.has(otherUserId));
    console.log("userOnline:", onlineUser);
    const dispatch = useDispatch();
    const handleBack = () => {
        dispatch(SetSelectedChat(null));
    };
    // console.log("Selected chat in header:", selectedChat)
    // console.log("Other user in header:", otherUser)

    const handleVideoCall = () => { }
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    bgcolor: "rgb(241, 242, 245)",
                    borderBottom: "1px solid #ddd",
                }}
            >
                {selectedChat && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            <ArrowBackIosIcon onClick={handleBack} sx={{ mr: 1, fontSize: "20px" }} />
                            <Avatar sx={{
                                bgcolor: selectedChat.isGroup ? "#1976d2" : "#00a884",
                                mr: 2,
                                width: 45,
                                height: 45,
                            }}
                                src={avatarSrc}
                                onClick={() => setShowDetails(true)}>
                                {!avatarSrc && chatName?.charAt(0)?.toUpperCase()}

                            </Avatar>
                            <Box onClick={() => setShowDetails(true)}>
                                <Typography sx={{ fontWeight: 500 }}>
                                    {chatName}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "10px", color: isUserOnline ? "#00a884" : "gray", fontWeight: isUserOnline ? "bold" : "normal" }}>
                                    {selectedChat.isGroup
                                        ? `${selectedChatParticipants.length} members`
                                        : isUserOnline
                                            ? "Online"
                                            : "Offline"}
                                </Typography>
                            </Box>



                        </Box>

                        {/* Right Icons */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <VideocamIcon onClick={handleVideoCall} sx={{ cursor: "pointer", '&:hover': { color: "#25D366" } }} />
                            <PhoneIcon />
                            <MoreVertIcon />
                        </Box>
                    </>
                )}


            </Box>
        </>

    )
}

export default ChatWindowHeader