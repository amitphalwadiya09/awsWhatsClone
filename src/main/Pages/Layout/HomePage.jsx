import React, { useEffect, useState } from 'react'
import MainChatPage from '../Chats/MainChatPage'
import { connectSocket } from '../../service/webSocketManager';



const HomePage = () => {
    const idToken = localStorage.getItem('idToken');
    useEffect(() => {
        // Initial connection
        connectSocket(idToken);

        const interval = setInterval(() => {
            console.log("Reconnecting WebSocket...");
            connectSocket(idToken);
        }, 2 * 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [idToken]);

    return (
        <MainChatPage />
    )
}

export default HomePage