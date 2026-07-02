import axiosInstance from "./axiosInstance";

export const sendMessage = async (data) => {
    try {
        const response = await axiosInstance.post("/sendMessage", data)
        console.log("Message sent successfully:", response.data);
        return response.data;

    } catch (error) {
        console.error("Error sending message:", error.response?.data || error);
        throw error;
    }
}

export const getMessages = async (conversationId) => {

    try {
        const response = await axiosInstance.get('/getMessages', { params: { conversationId } });
        console.log("Messages fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}

export const deleteMessage = async (messageId, conversationId) => {
    try {
        const response = await axiosInstance.delete('/deleteMessage', { data: { messageId, conversationId } });
        console.log("Message deleted successfully:", response.data);
        return response.data;

    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }

}

export const editMessage = async (data) => {
    try {
        const response = await axiosInstance.put('/editMessage', data);
        console.log("Message edited successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error editing message:", error);
        throw error;
    }

}
