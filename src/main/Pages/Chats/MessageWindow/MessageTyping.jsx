import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    IconButton,
    TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useDispatch, useSelector } from "react-redux";
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import EmojiPicker from "emoji-picker-react";
import { useTheme, useMediaQuery } from "@mui/material";
import { sendMessage } from "../../../Api/messageApiCall";
import { addMessage } from "../../../Redux/Slice/MessageSlice";
import Folder from "./Folder";
import { getSocket } from "../../../service/webSocketManager";

const MessageTyping = () => {

    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFolder, setShowFolder] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const selectedChat = useSelector((state) => state.chat.selectedChat);
    const currentUser = useSelector((state) => state.user.user);
    const selectedChatParticipants = useSelector((state) => state.chat.selectedChatParticipants);

    const emojiRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const sendTyping = ({ conversationId, currentUser, isTyping }) => {
        const socket = getSocket();
        console.log("Sending typing status:", { conversationId, currentUser, isTyping });

        if (!socket || !conversationId || !currentUser) return;

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    action: "typing",
                    conversationId,
                    user: currentUser,
                    isTyping
                })
            );
        }
    };

    const sendSeenMessageSocket = (conversationId, userId) => {
        const socket = getSocket();
        if (!socket || !conversationId || !userId) return;

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: "messageSeen",
                conversationId,
                seenMessageUserId: userId
            }));
        }
    };

    const stopTyping = () => {
        const conversationId = selectedChat?.conversationId || selectedChat?.conversation_id || selectedChat?._id;
        if (isTyping) {
            setIsTyping(false);

            sendTyping({ conversationId, currentUser, isTyping: false });
        }
    };

    const typingHandler = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        const conversationId = selectedChat?.conversationId || selectedChat?.conversation_id || selectedChat?._id;

        if (!conversationId || !(currentUser?._id || currentUser?.userId)) return;

        if (!isTyping) {
            setIsTyping(true);
            sendTyping({ conversationId, currentUser, isTyping: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 1500);
    };

    const handleEmojiClick = (e) => {
        setNewMessage(newMessage + e.emoji);
    }

    const handleSendMessage = async () => {
        try {
            if (!newMessage.trim() || !selectedChat || !(currentUser?._id || currentUser?.userId)) return;

            const receiver = selectedChatParticipants?.find((participant) => participant.userId !== currentUser.userId);

            if (!receiver?._id && !receiver?.userId) return;

            const messageData = {
                receiver: receiver._id || receiver.userId || receiver,
                conversationId: selectedChat.conversationId || selectedChat.conversation_id || selectedChat._id,
                content: newMessage,
                contentType: "text",
            }

            console.log("Sending message:", messageData);

            const response = await sendMessage(messageData);
            console.log("Message response:", response);

            if (response.success) {
                console.log("Message sent successfully, adding to Redux:", response.sentMessage);
                dispatch(addMessage(response.sentMessage || {
                    ...messageData,
                    messageId: response.messageId || `temp-${Date.now()}`,
                    sender: currentUser?.userId || currentUser?._id || currentUser,
                    createdAt: new Date().toISOString(),
                    messageStatus: "sent",
                    seenBy: [],
                }));
                sendSeenMessageSocket(
                    selectedChat.conversationId || selectedChat.conversation_id || selectedChat._id,
                    currentUser?.userId || currentUser?._id
                );
                setNewMessage("");
                setShowEmojiPicker(false);
                setShowFolder(false);
            } else {
                console.error("Failed to send message:", response.message);
            }
        } catch (error) {
            console.error("Failed to send message:", error.response?.data || error);
        }
    }

    const handleAudio = () => {
        alert("Audio recording feature is not implemented yet.");
    }
    return (
        <>
            <Box >
                {/* folder page */}
                {showFolder && (
                    <Folder onClose={() => setShowFolder(false)} setShowFolder={setShowFolder}></Folder>
                )}

                {/* emoji picker */}
                <Box ref={emojiRef} sx={{ position: "absolute", bottom: 80, left: isMobile ? "55%" : "70%", width: "100vw", transform: "translateX(-50%)", zIndex: 10 }}>
                    {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick}></EmojiPicker>}
                </Box>

                {/*Typing Area*/}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "95%",
                        display: "flex",
                        alignItems: "center",
                        py: 1,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(6px)",
                        borderRadius: "30px",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        zIndex: 10,
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "row", gap: .5 }}>
                        <IconButton sx={{ p: 0.1, ml: 1 }} onClick={() => { if (showFolder == true) { setShowFolder(false) } else { setShowFolder(true) } }}>  <AddIcon sx={{ ml: 1 }}></AddIcon></IconButton>
                        <IconButton sx={{ p: 0.1, m: 0 }} onClick={() => setShowEmojiPicker((prev) => !prev)}><SentimentSatisfiedIcon></SentimentSatisfiedIcon></IconButton>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={typingHandler}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: "20px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "20px",
                                padding: "6px 12px",
                            },
                            "& fieldset": { border: "none" },
                        }}
                    >
                    </TextField>
                    <IconButton
                        onClick={!newMessage ? handleAudio : handleSendMessage}
                        sx={{
                            width: 45,
                            height: 45,
                            bgcolor: "#25D366",
                            color: "#fff",
                            borderRadius: "50%",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            mr: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                                bgcolor: "#20bd5a",
                            },
                            "&:active": {
                                transform: "scale(0.9)",
                            },
                        }}
                    >
                        {!newMessage ? (
                            <MicIcon sx={{ fontSize: 24 }} />
                        ) : (
                            <SendIcon sx={{ fontSize: 22 }} />
                        )}
                    </IconButton>


                </Box>

            </Box>

        </>

    )
}

export default MessageTyping