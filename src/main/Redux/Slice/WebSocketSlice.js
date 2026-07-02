import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isConnected: false,
    status: "DISCONNECTED", // CONNECTING, CONNECTED, DISCONNECTED
    error: null,
    lastMessage: null,
    connectionTime: null
};

const webSocketSlice = createSlice({
    name: "webSocket",
    initialState,
    reducers: {
        setConnected: (state, action) => {
            state.isConnected = true;
            state.status = "CONNECTED";
            state.error = null;
            state.connectionTime = new Date().toISOString();
        },
        setDisconnected: (state) => {
            state.isConnected = false;
            state.status = "DISCONNECTED";
            state.connectionTime = null;
        },
        setConnecting: (state) => {
            state.status = "CONNECTING";
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.status = "DISCONNECTED";
            state.isConnected = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLastMessage: (state, action) => {
            state.lastMessage = action.payload;
        }
    }
});

export const {
    setConnected,
    setDisconnected,
    setConnecting,
    setError,
    clearError,
    setLastMessage
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
