import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserConversations } from '../../../Api/conversationCall'
import { setChats, SetSelectedChat, SetselectedChatParticipants, clearChatUnread } from '../../../Redux/Slice/ChatSlice'
import { Avatar, Box, Typography } from '@mui/material'
import { getSocket } from '../../../service/webSocketManager'

const ChatList = () => {
    const chats = useSelector((state) => state.chat.chats || [])
    const typingStatus = useSelector((state) => state.chat.typingStatus || [])
    const dispatch = useDispatch()
    const currentUser = useSelector((state) => state.user.user)
    const { selectedChat } = useSelector((state) => state.chat || {})
    console.log(typingStatus)

    const getUserAllConversations = async () => {
        try {
            const userChat = await getUserConversations()
            dispatch(setChats(userChat.data || []))
        } catch (error) {
            console.error('Error fetching user conversations:', error)
        }
    }

    const getOtherUser = (users) => {
        return users.find((user) => user.userId !== currentUser.userId)
    }

    const sendSeenMessageSocket = (conversationId, userId) => {
        const socket = getSocket();
        if (!socket || !conversationId || !userId) return;

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'messageSeen',
                conversationId,
                seenMessageUserId: userId,
            }));
        }
    }

    useEffect(() => {
        getUserAllConversations();
    }, [])

    const formatTime = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const now = new Date();

        const isToday =
            date.toDateString() === now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const isYesterday =
            date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        if (isYesterday) {
            return "Yesterday";
        }

        const diffDays = Math.floor(
            (now - date) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 7) {
            return date.toLocaleDateString([], {
                weekday: "short",
            }); // Mon, Tue, Wed...
        }

        return date.toLocaleDateString([], {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };

    return (
        <>
            <Box sx={{ overflowY: 'auto', height: "80vh" }}>
                {chats.map((chat) => {
                    // console.log(chat)
                    const isGroup = chat.isGroup;
                    const typingInfo = typingStatus.find(status => status.conversationId === chat.conversation_id);
                    const otherUser = getOtherUser(chat.participants);
                    const chatName = isGroup ? chat.groupName : otherUser?.username;
                    const avatarSrc = isGroup ? chat.groupPicture : otherUser?.profilePicture;
                    const about = isGroup ? chat.about : otherUser?.about;
                    const lastMessageValue = chat.lastMessage;
                    const lastMessages = Array.isArray(lastMessageValue)
                        ? lastMessageValue
                        : lastMessageValue
                            ? [lastMessageValue]
                            : [];

                    const unreadEntries = Array.isArray(chat.unReadMessageCount)
                        ? chat.unReadMessageCount
                        : [];
                    const unreadcount = unreadEntries.find((entry) => entry.userId === currentUser?.userId)?.count
                        ?? chat.unreadCount
                        ?? 0;

                    const lastMessageText =
                        lastMessages.length > 0
                            ? (lastMessages[lastMessages.length - 1]?.content || lastMessages[lastMessages.length - 1]?.fileName || "Sent a file")
                            : "No messages yet";
                    if (chat.isAiChat) {
                        return null; // Skip rendering this chat
                    }
                    return (
                        <Box
                            key={chat.conversation_id}
                            onClick={() => {
                                const conversationId = chat.conversation_id || chat.conversationId;
                                console.log("Clicked chat:", conversationId, chatName);
                                dispatch(SetSelectedChat(chat));
                                dispatch(SetselectedChatParticipants(chat.participants));
                                dispatch(clearChatUnread(conversationId));
                                sendSeenMessageSocket(conversationId, currentUser?.userId || currentUser?._id);
                            }}
                            sx={{
                                display: 'flex',
                                p: 1.5,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f5f5f5' },
                                borderBottom: '1px solid #e9edef',
                            }}
                        >
                            <Avatar sx={{ bgcolor: isGroup ? "#1976d2" : "#00a884" }} src={avatarSrc}>
                                {!avatarSrc && chatName?.charAt(0)?.toUpperCase()}
                            </Avatar>

                            <Box sx={{ flex: 1, ml: 2 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 500,
                                        color: '#111b21',
                                        fontSize: '16px'
                                    }}
                                >
                                    {chatName}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    {/* {getMessageStatusIcon(chat)} */}
                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: unreadcount > 0 || typingInfo ? "#06cf9c" : "#667781",
                                            fontStyle: typingInfo ? "italic" : "normal",
                                            fontWeight: unreadcount > 0 || typingInfo ? 500 : 400,
                                        }}
                                    >
                                        {typingInfo
                                            ? `${typingInfo.user.username} is typing...`
                                            : lastMessageText}

                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                        color: unreadcount > 0 ? "#06cf9c" : "#667781"
                                    }}
                                >
                                    {formatTime(lastMessages[lastMessages.length - 1]?.createdAt)}
                                </Typography>
                                <Box>
                                    <Typography sx={{ fontSize: "12px", color: unreadcount ? "#06cf9c" : "#667781" }}>
                                        {unreadcount > 0 && (
                                            <span style={{
                                                backgroundColor: "#06cf9c",
                                                color: "white",
                                                borderRadius: "50%",
                                                padding: "2px 6px",
                                                fontSize: "10px",
                                                fontWeight: 500,
                                            }}>
                                                {unreadcount}
                                            </span>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </>
    )
}

export default ChatList
