import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Typography,
    Avatar,
    Divider,
    List,
    TextField,
    ListItemAvatar,
    ListItemText,
    IconButton,
    CircularProgress,
    ListItemButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import Button from "@mui/material/Button";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme, useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import AddUser from "../GroupChat/AddUser";
import { deleteChat, RemoveSelectedChatParticipants } from "../../../Redux/Slice/ChatSlice";
import { leaveConversation, removeUserFromConversation } from "../../../Api/conversationCall";

const ChatUserProfile = ({ onClose }) => {
    const selectedChat = useSelector((state) => state.chat.selectedChat);
    const currentUser = useSelector((state) => state.user.user);
    const selectedChatParticipants = useSelector((state) => state.chat.selectedChatParticipants)

    const [showDetails, setShowDetails] = useState(false);
    const [name, setName] = useState();
    const [editName, setEditName] = useState(false);
    const [fileData, setFileData] = useState("");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();

    const otherUser = selectedChat?.participants?.find((user) => user.userId !== currentUser.userId);
    const isGroup = selectedChat?.isGroup;
    const chatName = isGroup ? selectedChat.groupName : otherUser?.username;
    const title = isGroup ? selectedChat.groupName : otherUser?.username;
    const avatarSrc = isGroup ? selectedChat.groupPicture : otherUser?.profilePicture;
    const subtitle = isGroup ? `${selectedChat.participants.length} members` : otherUser?.phoneNumber || "WhatsApp contact";

    // console.log("Selected chat in profile:", selectedChat)


    console.log(selectedChatParticipants)
    const isAdmin = (userId) => {
        return selectedChat?.admin?.includes(userId);
    }

    const isCurrentUserAdmin = isAdmin(currentUser.userId);

    const sortedParticipants = selectedChatParticipants?.length > 0
        ? [...selectedChatParticipants].sort((a, b) => {
            const aAdmin = isAdmin(a.userId);
            const bAdmin = isAdmin(b.userId);
            if (aAdmin === bAdmin) {
                return a.username?.localeCompare(b.username || "") || 0;
            }
            return aAdmin ? -1 : 1;
        })
        : [];

    const conversationId = selectedChat?.conversation_id
    const handleUserRemove = async (userId) => {
        console.log("Remove participant:", userId);
        try {
            const response = await removeUserFromConversation(conversationId, userId);
            if (response.success) {
                toast.success("User removed successfully");
            } else {
                toast.error(response.message || "Failed to remove user");
            }
            dispatch(RemoveSelectedChatParticipants(userId));
        } catch (error) {

        }

        return true;
    }

    const handleLeaveChat = async () => {
        try {
            const response = await leaveConversation(selectedChat.conversation_id)
            console.log(response);
            dispatch(RemoveSelectedChatParticipants(currentUser.userId));
        } catch (error) {

        }
    }

    const handleUpdate = () => { }

    const handleDeleteChat = () => {
        try {
            const conversationId = selectedChat?.conversation_id;
            const response = deleteChat(conversationId);
            dispatch(deleteChat(conversationId));
        } catch (error) {

        }
    }
    const formattedDate = new Date(selectedChat.createdAt).toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }
    );
    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: isMobile ? "100%" : "40%",
                    minWidth: isMobile ? "100%" : 280,
                    left: isMobile ? 0 : "auto",
                    height: "100%",
                    bgcolor: "#f0f2f5",
                    boxShadow: "-2px 0 4px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,

                        py: 2,
                        bgcolor: "white",
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                        {isGroup ? "Group info" : "Contact info"}
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* content */}

                <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mb: 3,
                        }}>

                        <Avatar
                            sx={{
                                bgcolor: isGroup ? "#0b5ed7" : "#00a884",
                                width: 80,
                                height: 80,
                                fontSize: 36,
                                mb: 1.5,
                            }}
                            src={avatarSrc}>
                            {!avatarSrc && chatName?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {!isGroup ? title :
                                (<Box>
                                    <Box component="form" encType='multipart/form-data' onSubmit={handleUpdate}
                                        sx={{ display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>
                                        <input type='file' onChange={(e) => { setFileData(e.target.files[0]) }}></input>
                                        <Button type='submit' color='success'>Edit</Button>
                                    </Box>
                                </Box>)}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}
                        >
                            {subtitle}
                        </Typography>

                        {isGroup && (<>
                            <Box sx={{ mt: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <TextField
                                        variant="standard"
                                        label="Group Name"
                                        fullWidth
                                        value={name ?? title}
                                        disabled={!editName}
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <IconButton
                                        onClick={() =>
                                            editName ? handleUpdate() : setEditName(true)
                                        }
                                    >
                                        {editName ? <CheckIcon /> : <EditIcon />}
                                    </IconButton>
                                </Box>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => setShowDetails(true)}
                                size="small"
                                sx={{
                                    mt: 3,
                                    borderRadius: "30px",
                                    px: 1,
                                    py: 1,
                                    boxShadow: 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                        backgroundColor: "rgb(25, 150, 85)",
                                    },
                                }}
                            >
                                Add User
                            </Button>
                        </>)}
                    </Box>
                    <Divider />

                    {/* About */}
                    <Box sx={{ mt: 2, mb: 2, display: "flex", flexDirection: "row" }}>
                        <Typography
                            variant="caption"
                            sx={{ textTransform: "uppercase", color: "text.secondary" }}
                        >
                            {isGroup ? "Group Description" : "About"}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            {isGroup
                                ? selectedChat.groupDescription || "No description"
                                : otherUser?.about}
                        </Typography>
                    </Box>
                    <Divider></Divider>

                    {/* {other details} */}


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            py: 2,
                            gap: 2,
                            my: 3,
                        }}
                    >
                        {[
                            { icon: <StarBorderIcon />, text: "Starred messages" },
                            { icon: <NotificationsIcon />, text: "Mute notifications" },
                            { icon: <CircularProgress size={20} />, text: "Disappearing messages" },
                            { icon: <SecurityIcon />, text: "Advanced chat privacy" },
                            { icon: <LockIcon />, text: "Encryption" },
                        ].map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(0,0,0,0.05)",
                                    },
                                }}
                            >
                                {item.icon}
                                <Typography variant="body1">{item.text}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Participants list for group */}
                    {isGroup && (
                        <>
                            <Divider />

                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        textTransform: "uppercase",
                                        color: "text.secondary",
                                    }}
                                >
                                    Participants
                                </Typography>

                                <List dense>

                                    {sortedParticipants.map((participant) => {
                                        const showRemoveButton = isCurrentUserAdmin && participant.userId !== currentUser.userId;
                                        return (
                                            <ListItemButton
                                                key={participant.userId}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            sx={{ bgcolor: "#e0f2f1", color: "black" }}
                                                            src={participant.profilePicture}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={participant.username}
                                                        secondary={participant.phoneNumber || undefined}
                                                        onClick={() => {
                                                            if (participant.phoneNumber) {
                                                                navigator.clipboard.writeText(participant.phoneNumber)
                                                            }
                                                        }}
                                                        sx={{
                                                            "&:hover": {
                                                                color: "#25D366"
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    {isAdmin(participant.userId) && (
                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.75rem",
                                                                fontWeight: 600,
                                                                color: "#25D366",
                                                                border: "1px solid #25D366",
                                                                borderRadius: "12px",
                                                                px: 1,
                                                                py: 0.2,
                                                                display: "inline-block",
                                                            }}
                                                        >
                                                            Admin
                                                        </Typography>
                                                    )}
                                                    {showRemoveButton && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUserRemove(participant.userId)}
                                                        >
                                                            <RemoveCircleIcon sx={{ color: "error.main" }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </ListItemButton>
                                        )
                                    })}
                                </List>
                                <Divider sx={{ mt: 1 }} />
                                {/* <IconButton

                                    onClick={() => { handleUserRemove(currentUser._id) }}
                                    sx={{
                                        width: "80%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 1,
                                        p: 1.2,
                                        borderRadius: 2,
                                        color: "error.main",
                                        "&:hover": {
                                            backgroundColor: "#ffe6e6",
                                        },
                                    }}
                                >
                                    <LogoutIcon fontSize="small" />
                                    <Typography>Exit group</Typography>
                                </IconButton>
                                {currentUser.userId == selectedChat.createdBy && (
                                    <IconButton
                                        onClick={handleDeleteChat}
                                        sx={{

                                            width: "80%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1,
                                            p: 1.2,
                                            borderRadius: 2,
                                            color: "error.main",
                                            "&:hover": {
                                                backgroundColor: "#ffe6e6",
                                            },
                                        }}
                                    >
                                        <DeleteIcon fontSize="small"></DeleteIcon>

                                        <Typography>Delete group</Typography>
                                    </IconButton>
                                )} */}
                                <Box
                                    sx={{
                                        mt: 3,
                                        bgcolor: "#fff",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {/* Exit Group */}
                                    <Box
                                        onClick={handleLeaveChat}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            px: 2,
                                            py: 1.8,
                                            cursor: "pointer",
                                            color: "#f15c6d",
                                            transition: "background-color 0.2s",
                                            "&:hover": {
                                                bgcolor: "#fff5f5",
                                            },
                                        }}
                                    >
                                        <LogoutIcon fontSize="small" />
                                        <Typography fontWeight={500}>
                                            Exit group
                                        </Typography>
                                    </Box>

                                    {currentUser.userId === selectedChat.createdBy && (
                                        <>
                                            <Divider />

                                            {/* Delete Group */}
                                            <Box
                                                onClick={handleDeleteChat}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.8,
                                                    cursor: "pointer",
                                                    color: "#f15c6d",
                                                    transition: "background-color 0.2s",
                                                    "&:hover": {
                                                        bgcolor: "#fff5f5",
                                                    },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                                <Typography fontWeight={500}>
                                                    Delete group
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        mt: 2,
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            bgcolor: "#FFF3C4",
                                            color: "#667781",
                                            px: 2,
                                            py: 1,
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
                                            textAlign: "center",
                                        }}
                                    >
                                        {isGroup
                                            ? `Group created on ${formattedDate}`
                                            : `Conversation started on ${formattedDate}`}
                                    </Typography>
                                </Box>

                            </Box>


                        </>
                    )}

                    {!isGroup && otherUser && (
                        <>
                            <Divider />
                            <Box sx={{ mt: 2, my: 3 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        textTransform: "uppercase",
                                        color: "text.secondary",
                                    }}
                                >
                                    Contact info
                                </Typography>
                                <Typography variant="body2" sx={{
                                    mt: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}>
                                    Phone: {otherUser.phoneNumber || "Not available"}
                                    <IconButton size="small" onClick={() => { navigator.clipboard.writeText(otherUser.phone) }}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>

                                </Typography>
                            </Box>
                            <Divider />

                            <Box
                                sx={{
                                    py: 2,
                                    px: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5"
                                        }
                                    }}
                                >
                                    <FavoriteBorderIcon fontSize="small" />
                                    <Typography>Add to favourites</Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        color: "error.main",
                                        "&:hover": {
                                            backgroundColor: "#ffe6e6"
                                        }
                                    }}
                                >
                                    <LogoutIcon fontSize="small" />
                                    <Typography onClick={handleDeleteChat}>Delete chat</Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        color: "error.main",
                                        "&:hover": {
                                            backgroundColor: "#ffe6e6"
                                        }
                                    }}
                                >
                                    <ThumbDownOffAltIcon fontSize="small" />
                                    <Typography>Report {otherUser.name}</Typography>
                                </Box>
                            </Box>
                        </>
                    )}

                </Box>
                {showDetails && (
                    <AddUser onClose={() => setShowDetails(false)} />
                )}

            </Box>
        </>
    )
}

export default ChatUserProfile