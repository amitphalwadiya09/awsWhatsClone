import React, { useRef, useEffect, useState } from 'react'
import ChatHeader from './ChatHeader'
import { Box, Typography, Avatar, TextField, Divider, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatList from './ChatList'
import lottieWeb from 'lottie-web'
import animation from '../../../../assets/animation.json'
import { useTheme, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux'
import SearchUserList from './SearchUserList';

const InlineLottie = ({ animationData, style }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current || !animationData) return;
        const anim = lottieWeb.loadAnimation({
            container: ref.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData,
        });
        return () => anim.destroy();
    }, [animationData]);
    return <div ref={ref} style={style} />;
};

const ChatListMain = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));



    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                {!isSearching && <ChatHeader></ChatHeader>}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        bgcolor: "#f0f2f5",
                        ml: isSearching ? 0 : 2,
                        mr: isSearching ? 0 : 2,
                        mt: isSearching ? 0 : 1,
                        borderRadius: isSearching ? 0 : 1,
                        mb: 1,
                        border: isSearching ? "none" : "1px solid #e9edef",
                    }}
                >
                    {isSearching ? (
                        <ArrowBackIcon
                            sx={{ ml: 1, mr: 2, cursor: "pointer", color: "#667781" }}
                            onClick={() => {
                                setIsSearching(false);
                                setSearchText("");
                            }}
                        />
                    ) : (
                        <SearchIcon sx={{ mx: 1, color: "#667781" }} />
                    )}

                    <TextField
                        value={searchText}
                        onFocus={() => setIsSearching(true)}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={currentUser?.username ? `Search or start new chat, ${currentUser.username}` : "Search or start new chat"}
                        variant="standard"
                        fullWidth
                        sx={{
                            "& .MuiInputBase-root:before, & .MuiInputBase-root:after": {
                                borderBottom: "none !important",
                            },
                            "& .MuiInputBase-input": {
                                color: "#111b21",
                                fontSize: "14px",
                            },
                            "& .MuiInputBase-input::placeholder": {
                                color: "#667781",
                                opacity: 1,
                            }
                        }}
                    />
                </Box>
                {!isSearching ? (
                    <>
                        <Box sx={{ position: 'relative', backgroundColor: "white" }}>
                            <ChatList />
                            <Box sx={{ backgroundColor: "black" }} onClick={() => setIsSearching(true)}>

                                <InlineLottie
                                    animationData={animation}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        bottom: isMobile ? 60 : 10,
                                        width: 60,
                                        height: 60,
                                        // pointerEvents: 'none',
                                        opacity: 0.95,
                                        border: "2px black",
                                    }}
                                />

                            </Box>

                        </Box>
                    </>
                ) : (
                    <SearchUserList searchText={searchText} setSearchText={setSearchText} onClose={() => setIsSearching(false)} />
                )}

            </Box>



        </>
    )
}

export default ChatListMain