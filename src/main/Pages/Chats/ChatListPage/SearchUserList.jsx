import React, { useEffect, useState } from 'react'
import { getAllUsers, getuserGroupChat } from '../../../Api/userApiCall';
import { Avatar, Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '../../../Api/conversationCall';

const SearchUserList = ({ searchText, setSearchText, onClose }) => {
    const [userGroupChat, setUserGroupChat] = useState([]);
    const [searchGroup, setSearchGroup] = useState("");
    const [searchChatUser, setSearchChatUser] = useState("");
    const [searchAllUser, setSearchAllUser] = useState([]);
    const { chats } = useSelector((state) => state.chat || {});
    const currentUser = useSelector((state) => state.user.user);
    const navigate = useNavigate();
    console.log(chats)

    const handleSearch = async () => { }


    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await getAllUsers();
                // console.log("All users:", response);
                const remainingUsers = response?.users?.filter(user => user.userId !== currentUser.userId);
                const newConversations = remainingUsers?.filter(user => !chats.some(chat => {
                    const otherUser = chat.participants.find(participant => participant.userId !== currentUser.userId);
                    return otherUser && otherUser.userId === user.userId;
                }));
                setSearchAllUser(newConversations || []);

            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        getUsers();
    }, [])

    const getMessageStatusIcon = () => { }

    const formatTime = (date) => {
        if (!date) return "";

        const d = new Date(date);
        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // console.log((searchAllUser))

    const handleCreateConversation = async (user) => {
        try {
            const participants = [user, currentUser];
            console.log("Creating conversation with participants:", participants);
            const isGroup = false;
            const groupName = "";
            const response = await createConversation(participants, isGroup, groupName);
            console.log("Conversation created:", response);
            setSearchText("");
            onClose();

        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    }

    return (
        <>
            <Box>
                {/* group chat list */}
                <Box sx={{ overflowY: "auto", bgcolor: "white" }}>
                    {/* {searchGroup.map(result => {
                        const chatId = result.conversation_id;
                        const displayname = result.groupName;
                        const avatar = result.groupImage || "";
                        const about = result.about || "";
                        const lastMessage = result.lastMessage || null;

                        return (
                            <Box key={chatId}
                                sx={{
                                    display: "flex",
                                    p: 1.5,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#f5f5f5" },
                                    borderBottom: "1px solid #e9edef",
                                }}
                            >
                                <Avatar src={avatar}></Avatar>
                                <Box sx={{ flex: 1, ml: 2 }}>
                                    <Typography sx={{ fontWeight: 500, color: "#111b21", fontSize: "16px" }}>
                                        {displayname}
                                    </Typography>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: "14px",
                                            color: unread
                                                ? "#06cf9c"
                                                : chat ? "#667781" : "gray",
                                            fontStyle: chat ? "normal" : "italic",
                                            fontWeight: unread ? 500 : 400,
                                        }}>
                                            {lastMessage}
                                        </Typography>
                                    </Box>

                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: unread ? "#06cf9c" : "#667781",
                                        }}
                                    >
                                        {formatTime(lastMessage?.createdAt)}
                                    </Typography>
                                </Box>

                            </Box>
                        )
                    })} */}
                </Box>

                {/* individual chat list */}
                <Box>
                    {searchAllUser.map(result => {
                        return (
                            <Box key={result.userId}
                                sx={{
                                    display: "flex",
                                    p: 1.5,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#f5f5f5" },
                                    borderBottom: "1px solid #e9edef",
                                }}
                                onClick={() => handleCreateConversation(result)}
                            >
                                <Avatar src={result.profilePicture}></Avatar>
                                <Box sx={{ flex: 1, ml: 2 }}>
                                    <Typography sx={{ fontWeight: 500, color: "#111b21", fontSize: "16px" }}>
                                        {result.username}
                                    </Typography>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: "14px",
                                            color: "#667781",
                                            fontStyle: "italic",
                                            fontWeight: 400,
                                        }}>
                                            {result.about || "Hey there! I am using WhatsApp."}
                                        </Typography>
                                    </Box>

                                </Box>

                            </Box>
                        )
                    })}
                </Box>


            </Box>

        </>
    )
}

export default SearchUserList