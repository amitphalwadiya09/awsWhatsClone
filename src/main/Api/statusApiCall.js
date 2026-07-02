import axiosInstance from "./axiosInstance";

export const createStatus = async (statusData) => {
    try {
        const response = await axiosInstance.post("/createStatus", statusData);
        console.log("Status created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating status:", error);
        throw error;
    }
}
export const getUserStatuses = async () => {
    try {
        const response = await axiosInstance.get("/getStatus");
        console.log("User statuses fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user statuses:", error);
        throw error;
    }
}

export const getAllStatuses = async () => {
    try {
        const response = await axiosInstance.get("/getAllStatus");
        console.log("Statuses fetched successfully:", response.data);
        return response.data.status || [];
    } catch (error) {
        console.error("Error fetching statuses:", error);
        throw error;
    }
}

export const deleteStatus = async (statusId) => {
    try {
        const response = await axiosInstance.delete("/deleteStatus", { data: { statusId } });
        console.log("Status deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting status:", error);
        throw error;
    }
}

export const viewStatus = async (data) => {
    try {
        const response = await axiosInstance.post("/viewStatus", data);
        console.log("Status viewed successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error viewing status:", error);
        throw error;
    }
}
