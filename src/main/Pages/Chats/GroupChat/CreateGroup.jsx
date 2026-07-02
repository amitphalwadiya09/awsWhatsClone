import { Typography, Box, TextField, Chip, Avatar, Button, Divider } from '@mui/material';
import { alignItems, bgcolor, justifyContent } from '@mui/system';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getAllUsers } from '../../../Api/userApiCall';
import { createConversation } from '../../../Api/conversationCall';
import { AddChats, setChats } from '../../../Redux/Slice/ChatSlice';

const CreateGroup = ({ onClose }) => {
    const [search, setSearch] = useState("");
    const [groupName, setGroupName] = useState("");
    const [allUser, setAllUser] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [inputValue, setInputValue] = useState("");


    const dispatch = useDispatch();


    const { groupChats } = useSelector((state) => state.chat || {});
    const currentUser = useSelector((state) => state.user.user);

    const handleCreateGroup = async () => {
        try {

            if (groupName.trim() === "") {
                alert("Please enter group name");
                return;
            }

            if (selectedUsers.length < 2) {
                alert("Select at least 2 users");
                return;
            }

            const participantIds = selectedUsers;
            console.log(participantIds);

            const response = await createConversation(
                participantIds,
                true,
                groupName
            );

            console.log("Group Created:", response);

            // Add new group to chats state locally
            if (response?.conversation) {
                dispatch(AddChats(response.conversation));
            }

            setGroupName("");
            setSelectedUsers([]);
            setSearch("");
            setSearchResults([]);


            onClose();

        } catch (error) {
            console.error("Failed to create group:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to create group"
            );
        }
    };

    const handleRemoveSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.userId !== userId));
    }

    const handleSearch = (searchText) => {
        if (!searchText || searchText.trim() === "") {
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
    }

    useEffect(() => {
        const users = async () => {
            try {
                const response = await getAllUsers();
                const list = response?.users || [];
                const filtered = list.filter(u => u.userId !== currentUser?.userId);
                setAllUser(filtered);
            } catch (error) {

            }
        }
        users();
    }, [currentUser])

    const handleSelectedUser = (user) => {
        if (!selectedUsers.find((u) => u.userId == user.userId)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearch("");
        setSearchResults([]);
    }

    return (
        <>
            {/* main box */}
            <Box sx={{ position: "absolute", top: "0", right: "0", width: { xs: "100%", md: "40%" }, height: "100%", bgcolor: "#f0f2f5", boxShadow: "-2px 0 5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", zIndex: 20, ml: 3 }}>
                {/* header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, borderBottom: "1px solid #e9edef" }}>
                    <Typography sx={{ color: "#111b21", fontWeight: "700", fontSize: "22px" }}>
                        Create New Group
                    </Typography>
                    <CloseIcon sx={{ cursor: "pointer" }} onClick={onClose}></CloseIcon>
                </Box>
                {/* group name input */}
                <Box sx={{ pl: 3, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", mx: "auto", my: 0 }}>
                    <TextField
                        label="Group Name"
                        variant='standard'
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
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
                        }}></TextField>
                </Box>
                {/* search user input */}
                <Box sx={{ pl: 3, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", mx: "auto", my: 0 }}>
                    <TextField
                        label="Search Users"
                        variant='standard'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleSearch(e.target.value);
                        }}

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
                        }}></TextField>
                </Box>

                {/* selected users list  */}
                <Box sx={{ pl: 2, display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 1, my: 1, mx: 1, alignItems: "center", overflowX: "auto", pb: 1 }}>
                    {selectedUsers.map((user) => (
                        <Chip
                            key={user.userId}
                            size='small'
                            label={user.username}
                            avatar={<Avatar sx={{ width: 20, height: 20, fontSize: 12 }} src={user.profilePicture}>
                                {user.username.charAt(0).toUpperCase()}
                            </Avatar>}
                            onDelete={() => handleRemoveSelectedUser(user.userId)}
                            sx={{
                                backgroundColor: "rgb(30, 170, 97)",
                                color: "white",
                                fontSize: "12px",
                                height: 32,
                                width: "fit-content",
                                my: 0.5,
                                px: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "999px"
                            }}
                            deleteIcon={<CloseIcon sx={{ fontSize: 16, color: "white !important" }}></CloseIcon>}
                        ></Chip>
                    ))}
                </Box>

                <Box component="ul"
                    sx={{ px: 3, overflowY: "auto", listStyle: "none", m: 0, flex: 1 }}
                >
                    {(search ? searchResults : allUser).filter((user) => !selectedUsers.some((u) => u.userId === user.userId))
                        .map((user) => {
                            return (
                                <Box
                                    component="li"
                                    key={user.userId}
                                    onClick={() => handleSelectedUser(user)}
                                    sx={{ display: "flex", flexDirection: "column", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                                >
                                    <Box
                                        sx={{ display: "flex", alignItems: "center", px: 2, py: 1, gap: 2 }}
                                    >
                                        <Avatar src={user.profilePicture}
                                            sx={{ width: 40, height: 40, mr: 2 }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {user.username}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                sx={{ color: 'gray', fontSize: "12px" }}
                                            >
                                                About:{user.about || "Hey there! I am using WhatsApp."}
                                            </Typography>
                                        </Box>

                                    </Box>
                                    <Divider sx={{ ml: 8 }}></Divider>

                                </Box>
                            )
                        })}


                </Box>

                {/* submit button */}
                <Box sx={{
                    position: "sticky",
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                    bgcolor: "#f0f2f5",
                }}>
                    <Button
                        variant='contained'
                        onClick={handleCreateGroup}
                        disabled={groupName.trim() === "" || selectedUsers.length < 2}
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

            </Box>
        </>
    )
}

export default CreateGroup