
import { Divider, IconButton } from '@mui/material';
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
    TextField,
    Box,
    Typography,
    Button,
    Chip,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from 'react';
import { getAllUsers } from '../../../Api/userApiCall';
import { addUserToConversation } from '../../../Api/conversationCall';
import { AddSelectedChatParticipants } from '../../../Redux/Slice/ChatSlice';

const AddUser = ({ onClose }) => {

    const [search, setSearch] = useState("");
    const [allUser, setAllUser] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const dispatch = useDispatch();


    const chats = useSelector((state) => state.chat.chats);
    const selectedChat = useSelector((state) => state.chat.selectedChat);
    const currentUser = useSelector((state) => state.user.user);
    const selectedChatParticipants = useSelector((state) => state.chat.selectedChatParticipants);

    // Note: we only exclude users who are members of the current selectedChat

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const result = await getAllUsers();
                const users = result?.users || [];

                const remainingUsers = users.filter(user => user.userId !== currentUser.userId);
                const newConversations = remainingUsers.filter(user => !selectedChatParticipants.some(participant => participant.userId === user.userId));
                setAllUser(newConversations);
                console.log(users)
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllUsers();
    }, [currentUser]);

    const handleSearch = (searchText) => {
        setSearch(searchText);
        if (!searchText || !searchText.trim()) {
            setSearchResults([]);
            return;
        }
        const query = searchText.toLowerCase().trim();
        const results = allUser.filter((user) =>
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.about?.toLowerCase().includes(query)
        );
        setSearchResults(results);
    };

    const handleSelectUser = (user) => {
        if (!selectedUsers.find((u) => u.userId === user.userId)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearch("");
        setSearchResults([]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.userId !== userId));
    };

    // const handleAddUser = async () => {
    //     try {
    //         const conversationId = selectedChat?.conversation_id || selectedChat?._id || selectedChat?.conversationId;
    //         if (!conversationId || selectedUsers.length === 0) return;
    //         const data = { conversationId, selectedUsers }
    //         console.log(data)
    //         const response = await addUserToConversation(data)


    //         console.log("Add user responses:", response);
    //         // if (allSuccess) {
    //         //     console.log("Users added successfully");
    //         //     onClose();
    //         // } else {
    //         //     console.error("Failed to add users:", responses);
    //         // }
    //     } catch (error) {
    //         console.error("Failed to add user(s):", error);
    //     }
    // };

    const handleAddUser = async () => {
        try {
            const conversationId =
                selectedChat?.conversation_id ||
                selectedChat?._id ||
                selectedChat?.conversationId;

            if (!conversationId || selectedUsers.length === 0) return;
            const newUserId = selectedUsers.map(user => user.userId)
            const data = {
                conversationId,
                newUserId
            };

            console.log(data);

            const response = await addUserToConversation(data);
            dispatch(AddSelectedChatParticipants(newUserId))


            console.log("Add user response:", response);

            onClose();
        } catch (error) {
            console.error("Failed to add users:", error);
        }
    };
    useEffect(() => { })
    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                minWidth: 280,
                height: "100%",
                bgcolor: "#f0f2f5",
                boxShadow: "-2px 0 4px rgba(0,0,0,0.15)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",

            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    bgcolor: "white",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <Typography sx={{
                    color: "rgb(30, 170, 97)",
                    fontWeight: "700",
                    fontSize: "20px"
                }}>
                    Add member
                </Typography>

                <CloseIcon onClick={onClose} sx={{ cursor: "pointer" }} />

            </Box>

            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mx: "auto"
                }}
            >
                <TextField
                    label="Search member"
                    variant="standard"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        "& .MuiInputBase-input": {
                            textAlign: "center",
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: "#ccc",
                        },
                        "& .MuiInput-underline:hover:before": {
                            borderBottomColor: "#000",
                        },
                        "& .MuiInput-underline:after": {
                            borderBottomColor: "#1976d2",
                        },
                    }}
                />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1, mx: 1 }}>
                {selectedUsers.map((user) => (
                    <Chip
                        key={user.userId}
                        size="small"
                        label={user.username}
                        avatar={<Avatar sx={{ width: 20, height: 20, fontSize: 12 }} src={user.profilePicture}>
                            {user.username?.[0]}
                        </Avatar>}
                        onDelete={() => handleRemoveUser(user.userId)}
                        sx={{
                            backgroundColor: "rgb(30, 170, 97)",
                            color: "white",
                            fontSize: "12px",
                            height: 24,
                        }}
                        deleteIcon={<CloseIcon sx={{ fontSize: 16, color: "white !important" }} />}
                    />
                ))}
            </Box>


            {/* Username list */}
            <Box
                component="ul"
                sx={{
                    px: 3,
                    overflowY: "auto",
                    listStyle: "none",
                    m: 0, flex: 1,

                }}
            >
                {(search ? searchResults : allUser)
                    .map((user) => {
                        return (
                            <Box
                                component="li"
                                key={user.userId}
                                onClick={() => handleSelectUser(user)}
                                sx={{ p: 0 }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        px: 1.5,
                                        py: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5",
                                        },
                                    }}
                                >
                                    {/* Avatar + online indicator */}
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar src={user.profilePicture} />
                                        {user.isOnline && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: "#25D366",
                                                    borderRadius: "50%",
                                                    border: "2px solid white",
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* User info */}
                                    <Box sx={{ flex: 1, ml: 3 }}>
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {user.username}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{ color: "gray", fontSize: "12px" }}
                                        >
                                            About: {user.about || "Hey there! I'm using WhatsApp"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Divider */}
                                <Divider sx={{ ml: 7 }} />
                            </Box>
                        );
                    })}


            </Box>

            {/* buttom adduser button  */}
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                    bgcolor: "#f0f2f5",
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleAddUser}
                    disabled={selectedUsers.length === 0}
                    sx={{
                        minWidth: 0,
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        backgroundColor: "rgb(30, 170, 97)",
                        boxShadow: 3,
                        "&:hover": {
                            backgroundColor: "rgb(25,150,85)",
                        },
                    }}

                >
                    <ArrowForwardIcon sx={{ color: "black" }} />
                </Button>
            </Box>

        </Box >
    )
}

export default AddUser