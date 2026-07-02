import { createUser } from '../Api/userApiCall';
import { signInWithCognito } from '../CognitoAuth/Cognito';
import { connectSocket } from '../service/webSocketManager';
import { jwtDecode } from "jwt-decode";

export const handleLogin = async (email, password) => {
    if (!email || !password) {
        throw new Error("Please enter email and password");
    }

    try {
        const response = await signInWithCognito(email, password);
        const { accessToken, idToken, refreshToken } = response || {};

        // Store tokens in localStorage
        if (idToken) {
            localStorage.setItem('idToken', idToken);
        }
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        const decodedToken = jwtDecode(idToken);

        const userId = await decodedToken.sub; // Cognito User ID
        // console.log("Decoded Token:", decodedToken);

        console.log("User ID:", userId);

        const normalizedEmail = email?.trim().toLowerCase();
        await createUser(
            userId,
            normalizedEmail
        );


        connectSocket(idToken); // Connect to WebSocket with the idToken
        return { accessToken, idToken, refreshToken };
    } catch (err) {
        const message = err?.message || "Invalid email or password";
        throw new Error(message);
    }
}