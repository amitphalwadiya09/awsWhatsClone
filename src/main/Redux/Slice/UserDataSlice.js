import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allUser: [],
    onlineUser: [],
    allGroup: [],
}

const UserDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setAllUser: (state, action) => {
            state.allUser = action.payload;
        },
        setUserOnline: (state, action) => {
            const { userId } = action.payload || {};
            const normalizedId = String(userId || "").trim();
            if (!normalizedId) return;
            if (!state.onlineUser.includes(normalizedId)) {
                state.onlineUser.push(normalizedId);
            }
        },
        setUserOffline: (state, action) => {
            const { userId } = action.payload || {};
            const normalizedId = String(userId || "").trim();
            if (!normalizedId) return;
            state.onlineUser = state.onlineUser.filter(
                (id) => id !== normalizedId
            );
        },
        setOnlineUsers: (state, action) => {
            const users = Array.isArray(action.payload) ? action.payload : [];
            state.onlineUser = users.map((userId) => String(userId || "").trim()).filter(Boolean);
        },
        setAllGroup: (state, action) => {
            state.allGroup = action.payload;
        }
    }
});

export const { setAllUser, setUserOnline, setUserOffline, setOnlineUsers, setAllGroup } = UserDataSlice.actions;

export default UserDataSlice.reducer;                   