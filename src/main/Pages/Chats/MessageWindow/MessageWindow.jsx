import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { keyframes } from "@mui/system";

const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;
import bg from "../../../../assets/bg.jpeg"
import { deleteMessage, getMessages } from "../../../Api/messageApiCall";
import { setMessages, setSelectedMessage, markMessagesAsRead } from "../../../Redux/Slice/MessageSlice";
import { clearChatUnread } from "../../../Redux/Slice/ChatSlice";
import MessageMenu from "./MessageMenu";
import { getSocket, sendSocketMessage } from "../../../service/webSocketManager";

const MessageWindow = () => {

    const [anchorEl, setAnchorEl] = useState(null);

    const dispatch = useDispatch();

    const { selectedChat } = useSelector((state) => state.chat || {});
    const currentUser = useSelector((state) => state.user.user);
    const messages = useSelector((state) => state.message.messages);
    const onlineUsers = useSelector((state) => state.userData.onlineUser || []);
    const typingStatus = useSelector((state) => state.chat.typingStatus || []);
    const selectedChatParticipants = useSelector((state) => state.chat.selectedChatParticipants);
    const selectedMessage = useSelector((state) => state.message.selectedMessage);

    const messagesEndRef = useRef(null);
    const lastSeenConversationRef = useRef(null);

    const sortedMessages = useMemo(() => {
        const arr = Array.isArray(messages) ? [...messages] : [];
        const seen = new Set();
        const deduped = [];
        arr.forEach((msg) => {
            const id = msg.message_id;
            if (!id || seen.has(id)) return;
            seen.add(id);
            deduped.push(msg);
        });
        deduped.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return deduped;
    }, [messages]);


    const isGroup = selectedChat?.isGroup;
    const userInGroup = selectedChatParticipants?.length;

    const currentConversationId = selectedChat?.conversationId || selectedChat?.conversation_id || selectedChat?._id;

    const typingInfo = typingStatus.find(
        (status) => status.conversationId === currentConversationId && status.user?.userId !== currentUser?.userId
    );

    const getUserDetails = (userId) => {
        const user = selectedChatParticipants?.find(participant => participant.userId === userId);
        return user;
    }

    //get messages when selected chat changes
    useEffect(() => {
        const fetchMessages = async () => {
            const currentConversationId = selectedChat?.conversationId || selectedChat?.conversation_id;
            if (!currentConversationId) {
                dispatch(setMessages([])); // Clear messages if no chat selected
                return;
            }
            try {
                const chatMessages = await getMessages(currentConversationId);
                const msgs = chatMessages?.messages ?? chatMessages;
                console.log("Fetched messages for conversation:", currentConversationId, "Count:", msgs?.length);
                dispatch(setMessages(msgs || []));
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchMessages();
    }, [selectedChat, dispatch]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sortedMessages]);

    //get unseen messages from the current chat 
    const getUnseenMessagesForCurrentChat = () => {
        const currentConversationId = selectedChat?.conversation_id;
        const unseenMessages = sortedMessages.filter((msg) => {
            const isUnseen = !msg.seenBy?.includes(currentUser?.userId);
            const matchesConversation = msg.conversation_id === currentConversationId || msg.conversationId === currentConversationId;
            return isUnseen && matchesConversation;
        });
        console.log("Unseen messages for current chat:", unseenMessages);
        return unseenMessages;
    }

    //make message seen when user opens the chat window
    useEffect(() => {
        if (!currentConversationId || !currentUser?.userId) return;

        const unseenMessages = sortedMessages.filter((msg) => {
            const isMine = msg.sender === currentUser.userId;

            return (
                !isMine &&
                !msg.seenBy?.includes(currentUser.userId) &&
                (msg.conversation_id === currentConversationId ||
                    msg.conversationId === currentConversationId)
            );
        });

        if (!unseenMessages.length) return;

        const messageIds = unseenMessages.map((msg) => msg.message_id);

        dispatch(
            markMessagesAsRead({
                conversationId: currentConversationId,
                currentUserId: currentUser.userId,
                messageIds
            })
        );

        sendSocketMessage({
            action: "messageSeen",
            conversationId: currentConversationId,
            seenMessageUserId: currentUser.userId,
            messageIds
        });

    }, [
        currentConversationId,
        sortedMessages,
        currentUser?.userId
    ]);

    const getDateLabel = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date();

        yesterday.setDate(today.getDate() - 1);

        const isToday =
            messageDate.toDateString() === today.toDateString();

        const isYesterday =
            messageDate.toDateString() === yesterday.toDateString();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        const diffInDays =
            (today - messageDate) / (1000 * 60 * 60 * 24);

        if (diffInDays < 7) {
            return messageDate.toLocaleDateString(undefined, {
                weekday: "long",
            });
        }

        return messageDate.toLocaleDateString();
    };

    const handleDownload = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = url.split("/").pop(); // dynamic filename
            link.click();
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const response = await deleteMessage({ messageId });
            console.log("Message deleted successfully", response);
            dispatch(deleteMessage(messageId));

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 2,
                    py: 1,
                    pb: 12,
                    backgroundImage: `url(${bg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    bottom: 60
                }}>
                <Box sx={{ mb: 4 }}>
                    {sortedMessages.map((msg, index) => {
                        const currentDate = new Date(msg.createdAt).toDateString();
                        const previousDate = index > 0
                            ? new Date(
                                sortedMessages[index - 1].createdAt
                            ).toDateString()
                            : null;

                        const shouldShowDate = currentDate !== previousDate;
                        const messageStatusInfo = msg.seenBy.length == selectedChatParticipants.length ? "seen" : "delivered";

                        const isMyMessage = msg.sender === currentUser?.userId;

                        const time = new Date(msg.createdAt).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        );

                        const messageKey = msg.message_id;

                        if (msg.contentType === "system") {
                            return (
                                <Box key={messageKey}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        my: 1.5,
                                        width: "100%"
                                    }}>
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 0.8,
                                            bgcolor: "#f0f0f0",
                                            borderRadius: "12px",
                                            fontSize: "13px",
                                            color: "#666",
                                            fontStyle: "italic",
                                            maxWidth: "80%",
                                            textAlign: "center"
                                        }}
                                    >
                                        {msg.content}
                                    </Box>
                                </Box>
                            )
                        }

                        return (
                            <Box key={messageKey}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isMyMessage
                                        ? "flex-end"
                                        : "flex-start",
                                    mb: 1,
                                    mr: 2
                                }}>
                                {shouldShowDate && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            my: 1,
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                bgcolor: "#e1f3fb",
                                                borderRadius: "20px",
                                                fontSize: "14px",
                                                color: "#555",
                                            }}
                                        >
                                            {getDateLabel(msg.createdAt)}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{
                                    position: "relative",
                                    maxWidth: "65%",
                                    // pr: 1,
                                    // pl: 2,
                                    // pt:
                                    //     isGroup &&
                                    //         !isMyMessage
                                    //         ? 2
                                    //         : 1.2,
                                    // pb: 2,
                                    borderRadius: 3,
                                    borderTopRightRadius: isMyMessage ? 0 : 12,
                                    borderTopLeftRadius: isMyMessage ? 12 : 0,
                                    bgcolor: isMyMessage
                                        ? "#dcf8c6"
                                        : "#ffffff",
                                    boxShadow:
                                        "0 1px 0.5px rgba(0,0,0,0.13)",
                                    wordBreak: "break-word",
                                }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            setAnchorEl(e.currentTarget);
                                            dispatch(setSelectedMessage(msg));
                                        }}
                                        sx={{
                                            position: "absolute",
                                            zIndex: 20,
                                            top: 2,
                                            color: "black",
                                            right: 2,
                                            p: 0,            // Remove extra padding
                                            minWidth: 20,
                                            fontWeight: 600,    // Reduce minimum width
                                            fontSize: msg.contentType === "image" ? "24px" : "16px"
                                        }}>
                                        ⋮
                                    </IconButton>
                                    <MessageMenu
                                        anchorEl={anchorEl}
                                        handleClose={() => setAnchorEl(null)}


                                    />

                                    {isGroup && !isMyMessage && (
                                        <Typography sx={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            color: "#1976d2",
                                            mb: 0.5,
                                        }}>
                                            {getUserDetails(msg.sender)?.username || "Unknown"}

                                        </Typography>
                                    )}

                                    <Box sx={{ fontSize: "14px" }}>

                                        {/* MESSAGE in text format */}
                                        {msg.contentType === "text" && (
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    pr: 3,
                                                    pl: 2,
                                                    pt:
                                                        isGroup &&
                                                            !isMyMessage
                                                            ? 2
                                                            : 1.2,
                                                    pb: 2,
                                                    fontStyle: msg.isMessageDeleted ? "italic" : "normal",
                                                    color: msg.isMessageDeleted ? "gray" : "inherit",
                                                    opacity: msg.isMessageDeleted ? 0.7 : 1,
                                                }}>
                                                {msg.isMessageDeleted ? "This message was deleted" : msg.content}
                                            </Typography>
                                        )}

                                        {/* Message in image format */}

                                        {msg.contentType === "image" && (
                                            <Box sx={{ position: "relative", display: "inline-block" }}>
                                                <img
                                                    src={msg.contentUrl || msg.file || msg.fileUrl}
                                                    alt="img"
                                                    style={{
                                                        margin: 0,
                                                        padding: 0,
                                                        pb: 0,
                                                        maxWidth: "250px",
                                                        borderRadius: "10px"
                                                    }}
                                                />
                                                {/* <IconButton
                                                    onClick={() => handleDownload(msg.contentUrl || msg.file || msg.fileUrl)}
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 5,
                                                        right: 5,
                                                        bgcolor: "rgba(0,0,0,0.5)",
                                                        color: "#fff",
                                                        "&:hover": {
                                                            bgcolor: "rgba(0,0,0,0.7)",
                                                        },
                                                        width: 30,
                                                        height: 30,
                                                        p: 0.5,
                                                        borderRadius: "50%",
                                                    }}
                                                    size="small"
                                                >
                                                    ⬇
                                                </IconButton> */}
                                            </Box>
                                        )}

                                        {/* message content type video */}
                                        {msg.contentType === "video" && (
                                            <video
                                                src={msg.contentUrl || msg.file || msg.fileUrl}
                                                controls
                                                style={{
                                                    maxWidth: "200px",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 4,
                                            right: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            fontWeight: msg.contentType === "image" ? 600 : 400
                                        }}>
                                        <Typography sx={{ fontSize: msg.contentType === "image" ? "12px" : "9px", pt: 1 }}>
                                            {time}
                                        </Typography>

                                        {isMyMessage && !msg.isMessageDeleted && (
                                            <Typography
                                                sx={{
                                                    fontSize: "9px",
                                                    pt: 1,
                                                    color: messageStatusInfo === "seen" ? "#4fc3f7" : "#999",
                                                }}
                                            >
                                                {"✓✓"}
                                            </Typography>
                                        )}

                                    </Box>



                                </Box>

                            </Box>
                        )
                    })}
                    {/* typing remaining.... */}
                    {typingInfo && (
                        <Box sx={{ display: "flex", justifyContent: "flex-start", my: 1, ml: 2 }}>
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    bgcolor: "#ffffff",
                                    borderRadius: 3,
                                    borderTopLeftRadius: 0,
                                    borderTopRightRadius: 12,
                                    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    animation: `${pulse} 1.5s infinite ease-in-out`
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        color: "#25D366",
                                        fontStyle: "italic",
                                        fontWeight: 500,

                                    }}
                                >
                                    {`${typingInfo.user?.username || "Someone"} is typing...`}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                </Box>
            </Box >
        </>

    )
}

export default MessageWindow