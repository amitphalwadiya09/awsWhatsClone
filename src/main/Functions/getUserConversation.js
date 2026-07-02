


const getUserAllConversations = async () => {
    try {
        const response = await getUserConversations();
        return response.data;

    } catch (error) {
        console.error("Error fetching conversations:", error);
    }
}

export default getUserConversations;