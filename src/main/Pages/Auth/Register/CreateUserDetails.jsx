import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Checkbox,
    FormControlLabel,
    IconButton,
    CircularProgress
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useNavigate } from "react-router-dom";
import { avatars } from "../../../avtar/data";
import { toast } from "react-toastify";
import { updateUserDetails } from '../../../Api/userApiCall';
import AuthShell from '../AuthShell';
import { useDispatch } from "react-redux";
import { UpdateUser } from "../../../Functions/UpdateUser";


const CreateUserDetails = ({ userId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [user, setUser] = useState({
        username: "",
        about: "",
        agreed: false,
        profilePicture: "",
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        setUser((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleAvatarSelect = (avatar) => {
        setUser((prev) => ({
            ...prev,
            profilePicture: avatar,
            file: null
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            setUser((prev) => ({
                ...prev,
                file,
                profilePicture: URL.createObjectURL(file)
            }));
        }
    };

    const handleRegister = async () => {

        if (!user.username) {
            return toast.error("Username required");
        }

        if (!user.about) {
            return toast.error("Tell us something about yourself");
        }

        if (!user.agreed) {
            return toast.error("Please accept terms");
        }

        try {
            const response = await UpdateUser(user);
            if (response?.status === "success") {
                toast.success("Profile saved");
                const updatedUser = response.data;
                navigate('/home')
            }

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Create your profile"
            subtitle="Set up your WhatsApp profile and choose an avatar for your account."
        >
            <Box sx={{ maxWidth: 380, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {error && (
                    <Typography sx={{ color: '#DC2626', fontSize: 13, mb: 0, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}

                <Avatar
                    src={user.profilePicture}
                    sx={{ width: 72, height: 72, mb: 1 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <IconButton component="label" sx={{ bgcolor: '#F3F9F5', '&:hover': { bgcolor: '#E6F4E8' } }}>
                        <PhotoCamera />
                        <input hidden type="file" onChange={handleFileUpload} />
                    </IconButton>
                </Box>

                <Typography sx={{ fontSize: 14, mb: 1, textAlign: 'center' }}>
                    Choose Avatar
                </Typography>

                <Grid container spacing={1} mb={3} sx={{ justifyContent: 'center' }}>
                    {avatars.map((avatar, index) => (
                        <Grid xs={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar
                                src={avatar}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    cursor: "pointer",
                                    border:
                                        user.profilePicture === avatar
                                            ? "2px solid #25D366"
                                            : "2px solid transparent"
                                }}
                                onClick={() => handleAvatarSelect(avatar)}
                            />
                        </Grid>
                    ))}
                </Grid>

                <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={user.username}
                    onChange={(e) => { handleChange(e); setError(''); }}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="About"
                    name="about"
                    value={user.about}
                    onChange={(e) => { handleChange(e); setError(''); }}
                    multiline
                    sx={{ mb: 2 }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            name="agreed"
                            checked={user.agreed}
                            onChange={(e) => { handleChange(e); setError(''); }}
                        />
                    }
                    label="I agree to the Terms and Conditions"
                />

                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 2,
                        bgcolor: "#25D366",
                        color: "#000",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#1EBE5D" }
                    }}
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Continue"}
                </Button>
            </Box>
        </AuthShell>
    );
};

export default CreateUserDetails