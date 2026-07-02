import React, { useState } from "react";
import { Box, Avatar, Typography, Divider } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, TextField, Button } from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LockIcon from "@mui/icons-material/Lock";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StorageIcon from "@mui/icons-material/Storage";
import HelpIcon from "@mui/icons-material/Help";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, updateUserDetails } from "../../Api/userApiCall";
import { setUser } from "../../Redux/Slice/UserSlice";
import { useNavigate } from "react-router-dom";

const SettingItem = () => {
    const dispatch = useDispatch();
    const [showNumberAdd, setShowNumberAdd] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const userInfo = useSelector((state) => state.user.user);
    const navigate = useNavigate();

    const phoneRegex = /^[0-9\s]{10,10}$/;
    const itemStyle = {
        display: "flex",
        alignItems: "center",
        p: 2,
        cursor: "pointer",
        "&:hover": {
            bgcolor: "#eaeaea",
        },
    };

    const settings = [

        {
            title: "Privacy",
            subtitle: "Block contacts, disappearing messages",
            icon: <LockIcon />,
        },
        {
            title: "Avatar",
            subtitle: "Create, edit, profile photo",
            icon: <GroupIcon />,
        },
        {
            title: "Chats",
            subtitle: "Theme, wallpapers, chat history",
            icon: <ChatIcon />,
        },
        {
            title: "Notifications",
            subtitle: "Message, group & call tones",
            icon: <NotificationsIcon />,
        },
        {
            title: "Storage and data",
            subtitle: "Network usage, auto-download",
            icon: <StorageIcon />,
        },
        {
            title: "Help",
            subtitle: "Help center, contact us",
            icon: <HelpIcon />,
        },
    ];

    const hadleDeleteAccount = async () => {
        try {
            const response = await deleteUser(userInfo?.email);
            localStorage.clear();
            navigate('/welcome');
        } catch (error) {
            toast.error("Error deleting account");
        }
    };

    const handleAddNumber = () => {
        setPhoneNumber(userInfo?.phoneNumber || "");
        setShowNumberAdd(true);
    };

    const handleUpdateNumber = async () => {
        if (!phoneRegex.test(phoneNumber)) {
            return toast.error("Enter a valid 10-digit phone number.");
        }

        try {
            const response = await updateUserDetails({
                profilePicture: userInfo?.profilePicture || "",
                username: userInfo?.username || "",
                about: userInfo?.about || "",
                agree: userInfo?.agree ?? false,
                phoneNumber,
                file: null,
                fileName: null,
                fileType: null,
            });

            if (response?.status === "success") {
                toast.success("Phone number updated successfully");
                dispatch(setUser(response.data));
                setShowNumberAdd(false);
            } else {
                toast.error("Unable to update phone number.");
            }
        } catch (error) {
            console.error("Update number error:", error);
            toast.error("Error updating phone number.");
        }
    };


    const avatarStyle = {
        bgcolor: "#dfe5e7",
        color: "#000",
        mr: 2,
    };


    return (
        <Box >
            <Box sx={itemStyle} onClick={handleAddNumber}>
                <Avatar sx={avatarStyle}>
                    <VpnKeyIcon />
                </Avatar>

                <Box>
                    <Typography>Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Security notifications, change number
                    </Typography>
                </Box>
            </Box>
            <Divider />

            {/* 🔹 Normal Settings */}
            {settings.map((item, index) => (
                <React.Fragment key={index}>
                    <Box sx={itemStyle}>
                        <Avatar sx={avatarStyle}>
                            {item.icon}
                        </Avatar>

                        <Box>
                            <Typography>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.subtitle}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider />
                </React.Fragment>
            ))}

            {/* 🔥 Delete Account */}
            <Box
                sx={{
                    ...itemStyle,
                    mb: 3
                }}
                onClick={hadleDeleteAccount}
            >
                <Avatar
                    sx={{
                        bgcolor: "#ffebee",
                        color: "red",
                        mr: 2,
                    }}
                >
                    <DeleteIcon />
                </Avatar>

                <Box sx={{ mb: 3 }}>
                    <Typography color="error">
                        Delete Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Permanently delete your account
                    </Typography>
                </Box>
            </Box>
            <Dialog open={showNumberAdd} onClose={() => setShowNumberAdd(false)}>
                <DialogTitle>Your Phone Number</DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>

                    {/* Current number */}
                    <Typography variant="body2">
                        Your phone number is: <strong>{userInfo?.phoneNumber || "Not set"}</strong>
                    </Typography>

                    {/* Input */}
                    <TextField
                        label="Update number"
                        variant="outlined"
                        fullWidth
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    {/* Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button onClick={() => setShowNumberAdd(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleUpdateNumber}>
                            Update
                        </Button>
                    </Box>

                </DialogContent>
            </Dialog>

        </Box>
    )
}

export default SettingItem