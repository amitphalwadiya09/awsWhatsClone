import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from "react-redux";
import { createStatus, getAllStatuses } from "../../Api/statusApiCall";
import { AddStatus, setMyStatus, setStatuses, setUnseenStatus, setViewedStatus } from "../../Redux/Slice/StatusSlice";
import formatTimestamp from "../../avtar/data";

const StatusList = ({ onSelect, selectedStatus }) => {
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);

    const hasUserViewedStatus = (status, userId) => {
        const viewers = status?.viewers || [];
        return Array.isArray(viewers) && viewers.some(viewerEntry =>
            typeof viewerEntry === 'string'
                ? viewerEntry === userId
                : viewerEntry?.userId === userId
        );
    };

    useEffect(() => {
        const getUploadedStatus = async () => {
            try {
                const statuses = await getAllStatuses();
                console.log(statuses);

                dispatch(setStatuses(statuses));
                dispatch(setMyStatus(statuses.filter(status => status.user_id === currentUser?.userId)));
                dispatch(setViewedStatus(statuses.filter(status => status.user_id !== currentUser?.userId && hasUserViewedStatus(status, currentUser?.userId))));
                dispatch(setUnseenStatus(statuses.filter(status => status.user_id !== currentUser?.userId && !hasUserViewedStatus(status, currentUser?.userId))));

            } catch (error) {
                console.log(error)
            }
        }
        getUploadedStatus();
    }, [dispatch, currentUser?.userId])

    const handleUploadStatus = async (e) => {
        try {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;

            const toBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const newStatuses = [];
            for (const file of files) {
                const fileData = await toBase64(file);
                const statusData = {
                    user: { userId: currentUser.userId, username: currentUser.username },
                    content: file.name,
                    file: fileData,
                    fileName: file.name,
                    fileType: file.type
                };

                const response = await createStatus(statusData);
                if (response?.status) {
                    newStatuses.push(response.status);
                    dispatch(AddStatus(response.status));
                }
            }

            if (newStatuses.length) {
                dispatch(setMyStatus([...myStatuses, ...newStatuses]));
            }

            e.target.value = "";
        } catch (error) {
            console.log(error);
        }
    }
    const myStatuses = useSelector((state) => state.status.myStatus) || [];
    const allOtherStatuses = useSelector((state) => state.status.statuses) || [];

    const getStatusTimestamp = (status) => {
        return status?.createdAt || status?.updatedAt || status?.timestamp || status?.statusTime || status?.created_at;
    };

    const formatStatusTime = (status) => {
        const timestamp = getStatusTimestamp(status);
        return timestamp ? formatTimestamp(timestamp) : "Unknown time";
    };

    const sortStatusesByTime = (statuses) => {
        return [...statuses].sort((a, b) => new Date(getStatusTimestamp(a)).getTime() - new Date(getStatusTimestamp(b)).getTime());
    };

    const sortedMyStatuses = sortStatusesByTime(myStatuses);

    // Group statuses by user_id and sort by newest status time.
    const groupStatusesByUser = (statuses) => {
        const grouped = {};
        statuses.forEach(status => {
            if (status.user_id !== currentUser?.userId) {
                if (!grouped[status.user_id]) {
                    grouped[status.user_id] = [];
                }
                grouped[status.user_id].push(status);
            }
        });

        const sortedGroups = Object.values(grouped).map(group =>
            group.sort((a, b) => new Date(getStatusTimestamp(a)).getTime() - new Date(getStatusTimestamp(b)).getTime())
        );

        return sortedGroups.sort((a, b) => new Date(getStatusTimestamp(a[0])).getTime() - new Date(getStatusTimestamp(b[0])).getTime());
    };

    const userStatusGroups = groupStatusesByUser(allOtherStatuses);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#fff" }}>
            <Box sx={{ p: 2, bgcolor: "#f0f2f5" }}>
                <Typography variant="h6">Status</Typography>
            </Box>
            <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
                {/* My Status */}
                <ListItemButton>
                    <ListItemAvatar sx={{ position: "relative" }}>
                        {/* Avatar Click -> Open Status */}
                        <Box
                            onClick={() => {
                                if (sortedMyStatuses.length) {
                                    onSelect(sortedMyStatuses[0], sortedMyStatuses);
                                }
                            }}
                            sx={{
                                borderRadius: "50%",
                                p: sortedMyStatuses.length ? 0.8 : 0,
                                border: sortedMyStatuses.length ? "2px solid #bdbdbd" : "none",
                                display: "flex",
                                m: 2,
                                cursor: "pointer",
                            }}
                        >
                            <Avatar src={currentUser?.profilePicture} />
                        </Box>

                        {/* Add Icon Click -> Upload Status */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById("status-upload").click();
                            }}
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                bgcolor: "#25D366",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid white",
                                cursor: "pointer",
                            }}
                        >
                            <AddIcon sx={{ color: "white", fontSize: 16 }} />
                        </Box>
                    </ListItemAvatar>

                    <ListItemText
                        primary="My status"
                        secondary={
                            sortedMyStatuses.length
                                ? `${sortedMyStatuses.length} status${sortedMyStatuses.length > 1 ? 'es' : ''} • ${formatStatusTime(sortedMyStatuses[0])}`
                                : "Tap + to add status"
                        }
                    />
                </ListItemButton>

                <input
                    type="file"
                    id="status-upload"
                    hidden
                    accept="image/*,video/*"
                    multiple
                    onChange={handleUploadStatus}
                />

                <Divider />

                {/* Grouped User Statuses */}
                {userStatusGroups.length ? (
                    userStatusGroups.map((userStatuses, idx) => {
                        const hasUnseen = userStatuses.some(s => !hasUserViewedStatus(s, currentUser?.userId));
                        const borderColor = hasUnseen ? "#25D366" : "#f1f4f2";
                        return (
                            <ListItemButton
                                key={`user-${userStatuses[0]?.user_id}-${idx}`}
                                selected={selectedStatus?.user_id === userStatuses[0]?.user_id}
                                onClick={() => onSelect(userStatuses[0], userStatuses)}
                            >
                                <ListItemAvatar>
                                    <Box sx={{
                                        borderRadius: "50%",
                                        p: 0.8,
                                        border: `2px solid ${borderColor}`,
                                        display: "flex",
                                        m: 2,
                                    }}>
                                        <Avatar src={userStatuses[0]?.user?.profilePicture} />
                                    </Box>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={userStatuses[0]?.user?.username || userStatuses[0]?.user?.name || userStatuses[0]?.createdBy?.username || userStatuses[0]?.createdBy?.name || userStatuses[0]?.createdBy}
                                    secondary={`${userStatuses.length} status${userStatuses.length > 1 ? 'es' : ''} • ${formatStatusTime(userStatuses[0])}`}
                                />
                            </ListItemButton>
                        );
                    })
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No status updates
                    </Typography>
                )}
            </List>
        </Box>
    );
};

export default StatusList;
