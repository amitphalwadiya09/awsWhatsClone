import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Avatar, LinearProgress, CircularProgress } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from "react-redux";
import { deleteStatus, viewStatus } from "../../Api/statusApiCall";
import { updateStatus, RemoveStatus, RemoveUnseenStatus } from "../../Redux/Slice/StatusSlice";
import formatTimestamp from "../../avtar/data";

const StatusWindow = ({ status, statusList = [], currentIndex = 0, onNext, onPrev, onBack }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(5);
    const videoRef = useRef(null);
    const duration = 5000;
    const isMine = status?.createdBy?.userId === currentUser?.userId || status?.user_id === currentUser?.userId;
    const isVideo = status?.fileType?.startsWith("video") || (status?.statusPicture?.match(/\.mp4|\.webm|\.mov/i) !== null);
    const statusUser = status?.createdBy || status?.user || {};
    const statusUserName = statusUser.username || statusUser.name || "Unknown user";
    const statusUserSecondary = statusUser.name && statusUser.name !== statusUser.username ? statusUser.name : statusUser.email || "";
    const statusUserProfilePicture = statusUser.picture || statusUser.profilePicture || "";
    const formatStatusTime = (statusItem) => {
        const timestamp = statusItem?.createdAt || statusItem?.updatedAt || statusItem?.timestamp || statusItem?.statusTime || statusItem?.created_at;
        return timestamp ? formatTimestamp(timestamp) : "Unknown time";
    };

    useEffect(() => {
        setProgress(0);
        setTimeRemaining(5);
        if (!status || !currentUser) return;

        if (status.user_id !== currentUser.userId) {
            const markStatusViewed = async () => {
                try {
                    const response = await viewStatus({ statusId: status.status_id });
                    if (response?.status) {
                        dispatch(updateStatus(response.status));
                    }
                } catch (error) {
                    console.error('Failed to mark status viewed', error);
                }
            };
            markStatusViewed();
        }

        let timeoutId;
        let timerIntervalId;
        if (!isVideo) {
            const intervalTime = 5000;
            timerIntervalId = setInterval(() => {
                setTimeRemaining(prev => {
                    const next = prev - 1;
                    return next > 0 ? next : 0;
                });
            }, 1000);
            timeoutId = setTimeout(() => {
                if (onNext && currentIndex < statusList.length - 1) {
                    onNext();
                } else {
                    onBack?.();
                }
            }, intervalTime);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (timerIntervalId) clearInterval(timerIntervalId);
        };
    }, [status, onNext, onBack, currentIndex, statusList.length, currentUser, isVideo]);

    if (!currentUser) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", bgcolor: "#f0f2f5" }}>
                <Typography variant="h6" color="text.secondary">Loading...</Typography>
            </Box>
        );
    }

    if (!status) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", bgcolor: "#f0f2f5" }}>
                <Typography variant="h6" color="text.secondary">Select a status to view</Typography>
            </Box>
        );
    }

    const handleDelete = async (statusId) => {
        try {
            await deleteStatus(statusId);
            dispatch(RemoveStatus(statusId));
            dispatch(RemoveUnseenStatus(statusId));
            onBack();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleVideoProgress = () => {
        if (videoRef.current) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        if (onPrev && currentIndex > 0) {
            onPrev();
        }
    };

    const handleNext = (e) => {
        e?.stopPropagation();
        if (onNext && currentIndex < statusList.length - 1) {
            onNext();
        }
    };

    const handleClickArea = (e, direction) => {
        e.stopPropagation();
        if (direction === "prev") {
            handlePrev(e);
        } else if (direction === "next") {
            handleNext(e);
        } else {
            onBack?.();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "white", color: "white", position: "relative" }}>

            {/* Top Progress Bar */}
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", gap: 1, p: 1 }}>
                {statusList.map((item, index) => (

                    <Box
                        key={item.status_id}
                        sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 1,
                            bgcolor: index < currentIndex ? "rgba(255, 255, 255, 0.95)" : "rgba(255,255,255,0.25)",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {index === currentIndex && (
                            <Box sx={{ position: "absolute", inset: 0, width: `${isVideo ? progress : ((5 - timeRemaining) / 5) * 100}%`, bgcolor: "rgba(255,255,255,0.95)", transition: "width 0.1s linear" }} />
                        )}

                    </Box>


                ))}
            </Box>

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", p: 2, pt: 3, position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
                <IconButton onClick={onBack} sx={{ color: "white" }}><ArrowBackIcon /></IconButton>
                <Avatar src={statusUserProfilePicture} sx={{ ml: 1, mr: 2 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
                        {statusUserName}
                    </Typography>
                    {statusUserSecondary ? (
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            {statusUserSecondary}
                        </Typography>
                    ) : null}
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        {formatStatusTime(status)}
                        {/* • {currentIndex + 1}/{statusList.length} status{statusList.length > 1 ? "es" : "" */}
                        {/* } */}
                    </Typography>
                </Box>

                {isMine && (
                    <IconButton
                        onClick={() => handleDelete(status.status_id)}
                        sx={{
                            color: "white",
                            padding: "8px",
                            bgcolor: "rgba(255, 255, 255, 0.15)",
                            borderRadius: "50%",
                            transition: "all 0.3s ease",
                            '&:hover': {
                                bgcolor: "rgba(255, 0, 0, 0.7)",
                                transform: "scale(1.1)"
                            }
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>

            {/* Content Area */}
            <Box sx={{ flex: 1, width: "100%", position: "relative", overflow: "hidden" }}>
                <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "black" }}>
                    {status.statusPicture ? (
                        isVideo ? (
                            <video
                                ref={videoRef}
                                src={status.statusPicture}
                                controls
                                autoPlay
                                onTimeUpdate={handleVideoProgress}
                                onEnded={() => {
                                    if (onNext && currentIndex < statusList.length - 1) {
                                        onNext();
                                    } else {
                                        onBack?.();
                                    }
                                }}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        ) : (
                            <img src={status.statusPicture} alt="Status" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        )
                    ) : (
                        <Typography variant="h4" sx={{ textAlign: "center", px: 4 }}>{status.content}</Typography>
                    )}
                </Box>

                {/* Left/Right Click Zones */}
                <Box onClick={(e) => handleClickArea(e, "prev")} sx={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: "30%", cursor: "pointer" }} />
                <Box onClick={(e) => handleClickArea(e, "next")} sx={{ position: "absolute", right: 0, top: "10%", bottom: "10%", width: "30%", cursor: "pointer" }} />

                <IconButton
                    onClick={handlePrev}
                    disabled={currentIndex <= 0}
                    sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "white", bgcolor: "rgba(0,0,0,0.4)", '&:hover': { bgcolor: "rgba(0,0,0,0.55)" } }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                    onClick={handleNext}
                    disabled={currentIndex >= statusList.length - 1}
                    sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "white", bgcolor: "rgba(0,0,0,0.4)", '&:hover': { bgcolor: "rgba(0,0,0,0.55)" } }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>

                {!isVideo && (
                    <Box sx={{ position: "absolute", bottom: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                        {/* <CircularProgress
                            variant="determinate"
                            value={(timeRemaining / 5) * 100}
                            size={60}
                            thickness={4}
                            sx={{ color: "white" }}
                        /> */}
                        <Typography
                            variant="h6"
                            sx={{
                                position: "absolute",
                                color: "white",
                                fontWeight: "bold",
                                textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
                            }}
                        >
                            {timeRemaining}s
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StatusWindow;

