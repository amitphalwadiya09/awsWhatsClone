import store from "../Redux/Store/store";
import { AddChats, updateChat, deleteChat, setTypingStatus, updateUnreadCount, setLastMessage } from "../Redux/Slice/ChatSlice";
import { addMessage, setMessages, markMessagesAsRead, messageSeen } from "../Redux/Slice/MessageSlice";
import { setConnected, setDisconnected, setConnecting, setError } from "../Redux/Slice/WebSocketSlice";
import { setUserOffline, setUserOnline, setOnlineUsers } from "../Redux/Slice/UserDataSlice";
import { useSelector } from "react-redux";

let socket;
let isConnecting = false;
const pendingSocketMessages = [];

export const sendSocketMessage = (payload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
        return true;
    }

    pendingSocketMessages.push(payload);
    console.warn("WebSocket not open yet, queued message:", payload);
    return false;
};

export const connectSocket = (token) => {

    if (isConnecting) {
        console.log("WebSocket connection already in progress");
        return;
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log("Closing existing WebSocket connection");
        socket.close();
    }

    isConnecting = true;
    store.dispatch(setConnecting());

    const websocketUrl = import.meta.env.VITE_AWS_WEBSOCKET_API;
    socket = new WebSocket(`${websocketUrl}?token=${token}`);

    socket.onopen = () => {
        console.log("WebSocket connection established");
        isConnecting = false;
        store.dispatch(setConnected());

        while (pendingSocketMessages.length > 0) {
            const queuedPayload = pendingSocketMessages.shift();
            if (queuedPayload) {
                socket.send(JSON.stringify(queuedPayload));
            }
        }

        setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                sendSocketMessage({ action: "userOnline" });
            }
        }, 300);
    };

    socket.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            console.log("Received WebSocket event:", payload);

            // Skip error responses from the backend (e.g., when event is undefined or it's an error message)
            if (!payload?.event) {
                console.warn("Received malformed WebSocket message (no event field):", payload);
                return;
            }
            if (payload?.event === "NEW_MESSAGE" && payload?.data) {
                const message = payload.data;
                const state = store.getState();
                const selectedChat = state.chat?.selectedChat;
                const currentUser = state.user?.user;
                const currentConversationId = selectedChat?.conversationId || selectedChat?.conversation_id;
                const currentUserId = currentUser?.userId;
                const isOwnMessage = String(message?.sender || "") === String(currentUserId || "");

                store.dispatch(addMessage(message));
                store.dispatch(setLastMessage({
                    message,
                    currentUserId,
                    incrementUnread: !isOwnMessage,
                }));

                const incomingConversationId = message?.conversation_id || message?.conversationId;
                if (currentConversationId && (currentConversationId === incomingConversationId) && !isOwnMessage) {
                    console.log("Active chat matches incoming message. Sending messageSeen.");
                    store.dispatch(markMessagesAsRead({ conversationId: incomingConversationId, currentUserId }));
                    sendSocketMessage({
                        action: "messageSeen",
                        conversationId: incomingConversationId,
                        seenMessageUserId: currentUserId,
                        messageId: message?.message_id || message?.messageId || message?._id,
                    });
                }
            }

            if (payload?.event === "USER_ONLINE") {
                console.log("USER_ONLINE received:", payload.data);
                store.dispatch(setUserOnline({ userId: payload.data.userId }));
                return;
            }

            if (payload?.event === "USER_OFFLINE") {
                console.log("USER_OFFLINE received:", payload.data);
                store.dispatch(setUserOffline({ userId: payload.data.userId }));
                return;
            }

            if (payload?.event === "ONLINE_USERS_LIST") {
                console.log("ONLINE_USERS_LIST received:", payload.data);
                store.dispatch(setOnlineUsers(payload.data?.userIds || []));
                return;
            }

            if (payload?.event === "TYPING_START" || payload?.event === "TYPING_END") {
                store.dispatch(setTypingStatus(payload.data));
                return;
            }

            if (payload?.event === "NEW_CONVERSATION") {
                store.dispatch(AddChats(payload.data));
                console.log("NEW_CONVERSATION received:", payload.data);
                return;
            }

            if (payload?.event === "UPDATE_CONVERSATION") {
                store.dispatch(updateChat(payload.data));
                console.log("UPDATE_CONVERSATION received:", payload.data);
                return;
            }

            if (payload?.event === "DELETE_CONVERSATION") {
                store.dispatch(deleteChat(payload.data));
                console.log("DELETE_CONVERSATION received:", payload.data);
                return;
            }
            if (payload?.event === "MESSAGE_SEEN") {
                const data = payload.data || {};
                const conversationId = data.conversationId || data.conversation_id;
                const currentUserId = store.getState().user?.user?.userId || store.getState().user?.user?._id;
                const messageIds = Array.isArray(data.messageIds)
                    ? data.messageIds.filter(Boolean)
                    : data.messageId
                        ? [data.messageId]
                        : [];

                store.dispatch(messageSeen({
                    messageIds,
                    seenByUserId: data.seenByUserId || data.userId || currentUserId,
                }));

                store.dispatch(updateUnreadCount({
                    ...data,
                    conversationId,
                    currentUserId,
                    unReadMessageCount: data.unReadMessageCount || data.unreadCounts || [],
                }));

                return;
            }

            // Add handlers for other event types here
            console.log("Unhandled WebSocket event type:", payload?.event);
        } catch (err) {
            console.error("Failed to parse WebSocket message:", err, event.data);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnecting = false;
        store.dispatch(setError(error?.message || "WebSocket error"));
    };

    socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
        isConnecting = false;
        store.dispatch(setDisconnected());
    };
};

export const getSocket = () => socket;