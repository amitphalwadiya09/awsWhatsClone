import { useTheme } from '@mui/material/styles';
import { Box, Button, Avatar, Typography, useMediaQuery, TextField, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { avatars } from "../../avtar/data";
import { UpdateUser } from '../../Functions/UpdateUser';
import { setUser } from '../../Redux/Slice/UserSlice';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

const UserProfile = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [username, setUsername] = useState(currentUser?.username || "");
    const [about, setAbout] = useState(currentUser?.about || "");
    const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || "");
    const [file, setFile] = useState(null);

    const [editName, setEditName] = useState(false);
    const [editAbout, setEditAbout] = useState(false);
    const [editProfilePicture, setEditProfilePicture] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setAbout(currentUser.about || "");
            setProfilePicture(currentUser.profilePicture || "");
        }
    }, [currentUser])

    const handleAvatarSelect = (avatar) => {
        setProfilePicture(avatar);
        setFile(null);
        setEditProfilePicture(true);
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setProfilePicture(URL.createObjectURL(selectedFile));
            setEditProfilePicture(true);
        }
    };

    const handleUpdate = async () => {
        try {
            const data = {
                username,
                about,
                profilePicture,
                file,
            };

            const response = await UpdateUser(data);
            console.log("Update response:", response);

            if (response?.status === "success" && response?.data) {
                dispatch(setUser(response.data));
            }

            setEditName(false);
            setEditAbout(false);
            setEditProfilePicture(false);
            setFile(null);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'stretch',
            width: '100%',
            minHeight: '100vh',
            px: isMobile ? 2 : 0,
            mr: isMobile ? 1 : 2,
            gap: isMobile ? 3 : 0
        }}>
            <Box sx={{
                width: isMobile ? '100%' : '50%',
                minWidth: isMobile ? '100%' : 280,
                bgcolor: "rgb(241, 242, 245)",
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                py: 0,
                px: isMobile ? 2 : 4
            }}>
                <Typography sx={{ width: '100%', textAlign: 'left', fontSize: 24, fontWeight: 600, color: '#111' }}>
                    {currentUser.username}
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Avatar
                        src={profilePicture || currentUser.profilePicture}
                        sx={{ width: 200, height: 200 }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleImageChange}
                            style={{ display: 'block' }}
                        />
                        <Typography sx={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
                            Upload a new profile picture or pick an avatar below.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                        {avatars.map((avatar, index) => (
                            <Avatar
                                key={index}
                                src={avatar}
                                sx={{
                                    width: 30,
                                    height: 30,
                                    cursor: 'pointer',
                                    border: profilePicture === avatar ? '2px solid #25D366' : '2px solid transparent'
                                }}
                                onClick={() => handleAvatarSelect(avatar)}
                            />
                        ))}
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: 520, display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box>
                            <Typography sx={{ mb: 1 }}>Name</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant='standard'
                                    value={username}
                                    disabled={!editName}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <IconButton onClick={() => setEditName((prev) => !prev)}>
                                    {editName ? <CheckIcon /> : <EditIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ mb: 1 }}>About</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant='standard'
                                    value={about}
                                    disabled={!editAbout}
                                    onChange={(e) => setAbout(e.target.value)}
                                    multiline
                                />
                                <IconButton onClick={() => setEditAbout((prev) => !prev)}>
                                    {editAbout ? <CheckIcon /> : <EditIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                            <Button
                                variant='contained'
                                color='success'
                                onClick={handleUpdate}
                                sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1EBE5D' }, minWidth: 180 }}
                            >
                                Save changes
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {!isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar
                        src={profilePicture || currentUser.profilePicture}
                        sx={{ width: 160, height: 160, mb: 1 }}
                    >
                        {currentUser.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#111', mt: 2 }}>
                        {currentUser.username}
                    </Typography>
                </Box>
            )}
        </Box>
    )
}

export default UserProfile