import { createSlice } from "@reduxjs/toolkit"



const initialState = {
    chats: [],
    groupChats: [],
    selectedChat: null,
    lastMessage: null,
    selectedChatParticipants: [],
    typingStatus: [],
}

const chatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setChats: (state, action) => {
            const sortedChats = action.payload.sort((a, b) => {
                const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
                const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
                return bTime - aTime;
            })
            state.chats = sortedChats;
        },
        removeChat: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.filter((chat) => chat.conversation_id !== chatId);
            if (state.selectedChat && state.selectedChat.conversation_id === chatId) {
                state.selectedChat = null;
            }
        },
        AddChats: (state, action) => {
            const newChat = action.payload;
            state.chats = [newChat, ...state.chats];
        },
        updateChat: (state, action) => {
            const updatedChat = action.payload;
            const conversationId = updatedChat?.conversation_id || updatedChat?.conversationId;
            const index = state.chats.findIndex(chat => (chat.conversation_id || chat.conversationId) === conversationId);
            if (index !== -1) {
                state.chats[index] = {
                    ...state.chats[index],
                    ...updatedChat,
                };
            }
        },
        deleteChat: (state, action) => {
            const conversationId = action.payload;
            state.chats = state.chats.filter(chat => chat.conversation_id !== conversationId);
            if (state.selectedChat?.conversation_id === conversationId) {
                state.selectedChat = null;
            }
        },
        SetSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
        SetselectedChatParticipants: (state, action) => {
            state.selectedChatParticipants = action.payload;
        },
        RemoveSelectedChatParticipants: (state, action) => {
            const userId = action.payload;
            state.selectedChatParticipants = state.selectedChatParticipants.filter(
                (participant) => participant._id !== userId && participant.userId !== userId
            );
        },
        AddSelectedChatParticipants: (state, action) => {
            const payload = action.payload;
            if (Array.isArray(payload)) {
                state.selectedChatParticipants = [...state.selectedChatParticipants, ...payload];
            } else {
                state.selectedChatParticipants = [...state.selectedChatParticipants, payload];
            }
        },
        setLastMessage: (state, action) => {
            const payload = action.payload || {};
            const message = payload.message || payload;
            const currentUserId = payload.currentUserId || payload.userId;
            const incrementUnread = payload.incrementUnread !== false;
            const conversationId = message?.conversation_id || message?.conversationId;

            if (!conversationId) return;

            const index = state.chats.findIndex(
                c => c.conversation_id === conversationId || c.conversationId === conversationId
            );

            if (index !== -1) {
                const existingChat = state.chats[index];
                const existingUnreadEntries = Array.isArray(existingChat.unReadMessageCount)
                    ? existingChat.unReadMessageCount
                    : [];

                let updatedUnreadEntries = [...existingUnreadEntries];
                let nextUnreadCount = existingChat.unreadCount ?? 0;

                if (incrementUnread && currentUserId) {
                    const existingEntryIndex = updatedUnreadEntries.findIndex(entry => entry.userId === currentUserId);
                    if (existingEntryIndex !== -1) {
                        updatedUnreadEntries[existingEntryIndex] = {
                            ...updatedUnreadEntries[existingEntryIndex],
                            count: (updatedUnreadEntries[existingEntryIndex].count || 0) + 1,
                        };
                    } else {
                        updatedUnreadEntries.push({ userId: currentUserId, count: 1 });
                    }

                    nextUnreadCount = updatedUnreadEntries.find(entry => entry.userId === currentUserId)?.count ?? nextUnreadCount;
                } else if (incrementUnread && state.selectedChat?.conversation_id !== conversationId && state.selectedChat?.conversationId !== conversationId) {
                    nextUnreadCount += 1;
                }

                state.chats[index] = {
                    ...existingChat,
                    lastMessage: message,
                    unreadCount: nextUnreadCount,
                    unReadMessageCount: updatedUnreadEntries,
                };

                const updatedChat = state.chats.splice(index, 1)[0];
                state.chats.unshift(updatedChat);
            }
        },
        updateUnreadCount: (state, action) => {
            const payload = action.payload || {};
            const conversationId = payload.conversationId || payload.conversation_id;
            const unreadCounts = Array.isArray(payload.unReadMessageCount)
                ? payload.unReadMessageCount
                : Array.isArray(payload.unreadCounts)
                    ? payload.unreadCounts
                    : [];
            const currentUserId = payload.currentUserId || payload.userId;
            const unreadCount = payload.unreadCount ?? unreadCounts.find((item) => item.userId === currentUserId || item.userId === state.selectedChat?.userId || item.userId === state.selectedChat?.participants?.[0]?.userId)?.count ?? 0;

            const chat = state.chats.find(
                c => c.conversation_id === conversationId || c.conversationId === conversationId
            );

            if (chat) {
                chat.unreadCount = unreadCount;
                chat.unReadMessageCount = unreadCounts;
            }

            if (state.selectedChat?.conversation_id === conversationId || state.selectedChat?.conversationId === conversationId) {
                state.selectedChat = {
                    ...state.selectedChat,
                    unreadCount,
                    unReadMessageCount: unreadCounts,
                };
            }
        },
        clearChatUnread: (state, action) => {
            const conversationId = action.payload?.conversationId || action.payload?.conversation_id || action.payload;
            if (!conversationId) return;

            const chat = state.chats.find(
                c => c.conversation_id === conversationId || c.conversationId === conversationId
            );

            if (chat) {
                chat.unreadCount = 0;
                chat.unReadMessageCount = Array.isArray(chat.unReadMessageCount)
                    ? chat.unReadMessageCount.map((entry) => ({ ...entry, count: 0 }))
                    : [];
            }

            if (state.selectedChat?.conversation_id === conversationId || state.selectedChat?.conversationId === conversationId) {
                state.selectedChat = {
                    ...state.selectedChat,
                    unreadCount: 0,
                    unReadMessageCount: Array.isArray(state.selectedChat?.unReadMessageCount)
                        ? state.selectedChat.unReadMessageCount.map((entry) => ({ ...entry, count: 0 }))
                        : []
                };
            }
        },
        setTypingStatus: (state, action) => {
            const { conversationId, user, isTyping } = action.payload;
            console.log("Updating typing status in Redux:", { conversationId, user, isTyping });
            const existingIndex = state.typingStatus.findIndex(status => status.conversationId === conversationId && status.user?.userId === user?.userId);
            if (isTyping) {
                if (existingIndex !== -1) {
                    state.typingStatus[existingIndex] = { conversationId, user, isTyping };
                } else {
                    state.typingStatus.push({ conversationId, user, isTyping });
                }
            } else {
                state.typingStatus = state.typingStatus.filter(status => !(status.conversationId === conversationId && status.user?.userId === user?.userId));
            }
            state.chats = state.chats.map(chat => {
                if (chat.conversation_id === conversationId) {
                    const updatedParticipants = chat.participants.map(participant => {
                        if (participant.userId === user.userId) {
                            return { ...participant, ...user, isTyping };
                        }
                        return participant;
                    });
                    return { ...chat, participants: updatedParticipants };
                }
                return chat;
            });
        },
    }
})

export const {
    setChats,
    AddChats,
    updateChat,
    deleteChat,
    SetSelectedChat,
    setLastMessage,
    removeChat,
    updateUnreadCount,
    clearChatUnread,
    setTypingStatus,
    SetselectedChatParticipants,
    RemoveSelectedChatParticipants,
    AddSelectedChatParticipants
} = chatSlice.actions;
export default chatSlice.reducer;