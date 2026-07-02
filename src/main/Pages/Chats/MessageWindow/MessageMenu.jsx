import React from "react";
import { Popover, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useDispatch, useSelector } from "react-redux";
import { deleteMessage } from "../../../Api/messageApiCall";
import { markMessageDeleted } from "../../../Redux/Slice/MessageSlice";

const MessageMenu = ({ anchorEl, handleClose }) => {
    const open = Boolean(anchorEl);
    const currentUser = useSelector((state) => state.user.user);
    const selectedMessage = useSelector((state) => state.message.selectedMessage)
    const dispatch = useDispatch();

    const isMessageMine = selectedMessage?.sender === currentUser?.userId;
    const handleDelete = async () => {
        try {
            const messageId = selectedMessage?.message_id || selectedMessage?.messageId || selectedMessage?._id;
            const conversationId = selectedMessage?.conversation_id || selectedMessage?.conversationId;
            if (!messageId || !conversationId) return;

            await deleteMessage(messageId, conversationId);
            dispatch(markMessageDeleted({ message_id: messageId }));
            handleClose();
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    }

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            PaperProps={{
                sx: {
                    borderRadius: 1.5,
                    width: { xs: 140, sm: 160 },
                    bgcolor: "#fff",
                    boxShadow: "none", // remove shadow
                },
            }}
        >
            <List sx={{ p: 0 }}>
                {/* Copy */}
                <ListItemButton
                    sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                    onClick={() => {
                        navigator.clipboard.writeText(selectedMessage?.content || "");
                        handleClose();
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                        <ContentCopyIcon fontSize="small" sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Copy</Typography>}
                    />
                </ListItemButton>

                {/* Delete */}
                {isMessageMine && (
                    <ListItemButton
                        sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                        onClick={handleDelete}
                    >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <DeleteIcon fontSize="small" sx={{ fontSize: 16, color: "red" }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Delete</Typography>}
                        />
                    </ListItemButton>
                )}

                {/* Star */}
                <ListItemButton
                    sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                    onClick={() => {
                        // console.log("Star clicked!");
                        handleClose();
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                        <StarBorderIcon fontSize="small" sx={{ fontSize: 16, color: "#fbc02d" }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Star</Typography>}
                    />
                </ListItemButton>
            </List>
        </Popover>
    );
};

export default MessageMenu;