import axiosInstance from "./axiosInstance";

export const createConversation = async (participants, isGroup, groupName) => {
    try {
        const response = await axiosInstance.post(
            "/createConversation",
            {
                participants,
                isGroup,
                groupName
            }
        );

        return response.data;
    } catch (error) {
        console.error("Create Conversation Error:", error);
        throw error;
    }
};

export const getUserConversations = async () => {
    try {
        const response = await axiosInstance.get("/getConversations");
        return response.data;
    } catch (error) {
        console.error("Get User Conversations Error:", error);
        throw error;
    }
};

export const deleteConversation = async (conversationId) => {
    try {
        const response = await axiosInstance.delete("/deleteConversation", {
            data: { conversationId }
        });
        return response.data;
    } catch (error) {
        console.error("Delete Conversation Error:", error);
        throw error;
    }
}

export const addUserToConversation = async (data) => {
    try {
        const response = await axiosInstance.post("/addUserToConversation", data);
        return response.data;
    } catch (error) {
        console.error("Add User to Conversation Error:", error);
        throw error;
    }
}
export const removeUserFromConversation = async (conversationId, removeUserId) => {
    try {
        const response = await axiosInstance.post("/removeUserFromGroup", {
            conversationId,
            removeUserId,
        });
        return response.data;
    } catch (error) {
        console.error("Remove User from Conversation Error:", error);
        throw error;
    }
}

export const addAdminToGroup = async (conversationId, newAdminId) => {
    try {
        const response = await axiosInstance.post("/addAdmin", {
            conversationId,
            newAdminId,
        });
        return response.data;
    } catch (error) {
        console.error("Add Admin to Group Error:", error);
        throw error;
    }
}

export const removeAdminFromGroup = async (conversationId, adminIdToRemove) => {
    try {
        const response = await axiosInstance.post("/removeAdmin", {
            conversationId,
            adminIdToRemove,
        });
        return response.data;
    } catch (error) {
        console.error("Remove Admin from Group Error:", error);
        throw error;
    }
}

export const leaveConversation = async (conversationId) => {
    try {
        const response = await axiosInstance.post("/leaveConversation", {
            conversationId,
        });
        return response.data;
    } catch (error) {
        console.error("Leave Conversation Error:", error);
        throw error;
    }
}

export const updateGroupDetails = async (data) => {
    try {
        const response = await axiosInstance.put("/updateGroupDetails", data);
        return response.data;
    } catch (error) {
        console.error("Update Group Details Error:", error);
        throw error;
    }
}


