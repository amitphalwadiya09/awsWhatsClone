import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import ChatWindowMain from "./ChatWindow/ChatWindowMain";
import ChatListMain from "./ChatListPage/ChatListMain";
import WithOutChatWindow from "./WithOutChatWindow";

const MainChatPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { selectedChat } = useSelector((state) => state.chat || {});
    if (isMobile) {

        return (
            <Box sx={{ width: "100%", height: "100%" }}>
                {!selectedChat && <ChatListMain />}
                {selectedChat && <ChatWindowMain />}
            </Box>
        );
    }


    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>

            {/* Chat List */}
            <Box
                sx={{
                    width: "40%",
                    borderRight: "1px solid #e0e0e0"
                }}
            >
                <ChatListMain />
            </Box>

            {/* Chat Window */}
            <Box sx={{ width: "60%" }}>
                {selectedChat ? (<ChatWindowMain />) : (<WithOutChatWindow></WithOutChatWindow>)}

            </Box>

        </Box>
    );
};

export default MainChatPage

