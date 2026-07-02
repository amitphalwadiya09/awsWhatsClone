import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {},
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        clearUser(state) {
            state.user = {};
        },
        updateUser(state, action) {
            state.user = { ...state.user, ...action.payload };
        }

    },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;

export default userSlice.reducer;