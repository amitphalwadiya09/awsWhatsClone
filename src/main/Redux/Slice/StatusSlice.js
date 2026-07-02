import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    statuses: [],
    myStatus: [],
    viewedStatus: [],
    unseenStatus: [],
    selectedStatus: null,
    statusViewers: []
}

const statusSlice = createSlice({
    name: "statuses",
    initialState,
    reducers: {
        setStatuses: (state, action) => {
            state.statuses = action.payload;
        },
        updateStatus: (state, action) => {
            const updatedStatus = action.payload;
            state.statuses = state.statuses.map(status =>
                status.status_id === updatedStatus.status_id ? updatedStatus : status
            );
            if (state.selectedStatus && state.selectedStatus.status_id === updatedStatus.status_id) {
                state.selectedStatus = updatedStatus;
            }
        },
        setMyStatus: (state, action) => {
            state.myStatus = action.payload;
        },
        RemoveStatus: (state, action) => {
            const statusId = action.payload;
            state.statuses = state.statuses.filter(status => status.status_id !== statusId);
        },
        AddStatus: (state, action) => {
            state.statuses = [...state.statuses, action.payload]
        },
        setViewedStatus: (state, action) => {
            state.viewedStatus = action.payload;
        },
        AddViewedStatus: (state, action) => {
            state.viewedStatus = [...state.viewedStatus, action.payload]
        },
        setUnseenStatus: (state, action) => {
            state.unseenStatus = action.payload;
        },
        RemoveUnseenStatus: (state, action) => {
            const statusId = action.payload;
            state.unseenStatus = state.unseenStatus.filter(status =>
                status.status_id !== statusId);
        }

    }
})

export const {
    setStatuses,
    setMyStatus,
    RemoveStatus,
    AddStatus,
    setViewedStatus,
    AddViewedStatus,
    setUnseenStatus,
    RemoveUnseenStatus,
    updateStatus
}
    = statusSlice.actions;

export default statusSlice.reducer;