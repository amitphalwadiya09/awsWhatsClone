import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../Slice/UserSlice";
import chatReducer from "../Slice/ChatSlice";
import messageReducer from "../Slice/MessageSlice";
import statusReducer from "../Slice/StatusSlice";
import userDataReducer from "../Slice/UserDataSlice";
import webSocketReducer from "../Slice/WebSocketSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer,
        userData: userDataReducer,
        message: messageReducer,
        status: statusReducer,
        webSocket: webSocketReducer,
    },
});

export default store;