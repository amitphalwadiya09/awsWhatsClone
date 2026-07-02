import { deleteCognitoUser } from "../CognitoAuth/Cognito";
import axiosInstance from "./axiosInstance";
import axios from "axios";

export const createUser = async (userId, email) => {
    try {

        const response = await axiosInstance.post('/createUser', {
            userId, email
        })
        console.log("User created successfully:", response.data);
        return response.data
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/getCurrentUser');
        // console.log("Current user data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        throw error;
    }
}

export const updateUserDetails = async (data) => {
    try {
        const response = await axiosInstance.put('/updateUser', data);
        // console.log("User details updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating user details:", error);
        throw error;
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/getAllUsers');
        // console.log("All users data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
}

export const getuserGroupChat = async () => {
    try {
        const response = await axiosInstance.get('/getUserGroupChat');
        // console.log("User group chat data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user group chat:", error);
        throw error;
    }
}

export const getOtherUser = async (otherUserId) => {
    try {
        const response = await axiosInstance.get('/getOtherUser', {
            params: { userId: otherUserId }
        });
        // console.log("User data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

export const deleteUser = async (email) => {
    try {
        const deleteCognitoResponse = await deleteCognitoUser(email);
        const cognitoDeleteSucceeded =
            deleteCognitoResponse === "success" ||
            deleteCognitoResponse?.success === true;

        if (!cognitoDeleteSucceeded) {
            const message = deleteCognitoResponse?.message || "Cognito user deletion failed";
            throw new Error(message);
        }

        const response = await axiosInstance.delete('/deleteUser');

        localStorage.clear();
        console.log("User deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

