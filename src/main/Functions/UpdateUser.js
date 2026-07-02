import { updateUserDetails } from "../Api/userApiCall";

export const UpdateUser = async (user) => {
    try {
        // const { username, about, profilePicture, phoneNumber } = data;

        if (!user.username) {
            throw new Error("Username is required");
        }

        let fileData = null;
        let fileName = null;
        let fileType = null;
        if (user.file) {
            fileData = await convertToBase64(user.file);
            fileName = user.file.name;
            fileType = user.file.type;
        }

        const response = await updateUserDetails({
            profilePicture: user.profilePicture,
            username: user.username,
            about: user.about,
            agree: user.agreed ?? false,
            phoneNumber: '',
            file: fileData,
            fileName,
            fileType,

        });


        return response;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);

        reader.onerror = (error) => reject(error);
    });
};