import { createSlice } from "@reduxjs/toolkit";

const getMessageId = (message) => {
    if (!message) return null;
    return message._id || message.message_id || message.messageId || `${message.sender || message.userId || "unknown"}-${message.createdAt || message.created_at || Date.now()}-${message.content || message.contentUrl || message.file || "no-content"}`;
};

const normalizeId = (value) => (value == null ? "" : String(value));

const initialState = {
    messages: [],
    activeConversationId: null,
    selectedMessage: null,
    messageStatus: {},
    typingStatus: {},
}

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            const incomingMessages = Array.isArray(action.payload) ? action.payload : [];
            const seen = new Set();
            state.messages = incomingMessages.filter((message) => {
                const id = getMessageId(message);
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });
        },
        addMessage: (state, action) => {
            const incoming = action.payload;
            const incomingId = getMessageId(incoming);
            if (!incomingId) return;
            const existingIndex = state.messages.findIndex((message) => getMessageId(message) === incomingId);
            if (existingIndex !== -1) {
                state.messages[existingIndex] = incoming;
            } else {
                state.messages.push(incoming);
            }
        },
        setSelectedMessage: (state, action) => {
            state.selectedMessage = action.payload;
        },
        EditMessage: (state, action) => {
            const updatedMessage = action.payload;
            state.messages = state.messages.map(message =>
                message._id === updatedMessage._id ? updatedMessage : message
            );
            if (state.selectedMessage && state.selectedMessage._id === updatedMessage._id) {
                state.selectedMessage = updatedMessage;
            }
        },
        deleteMessageState: (state, action) => {
            const messageId = action.payload;
            state.messages = state.messages.filter(message => {
                const id = message._id || message.message_id || message.messageId;
                return id !== messageId;
            });
            if (state.selectedMessage) {
                const selectedId = state.selectedMessage._id || state.selectedMessage.message_id || state.selectedMessage.messageId;
                if (selectedId === messageId) {
                    state.selectedMessage = null;
                }
            }
        },
        markMessageDeleted: (state, action) => {
            const payload = action.payload;
            const messageId = payload?.messageId || payload?.message_id || payload?._id || payload;
            state.messages = state.messages.map(message => {
                const messageKey = message._id || message.message_id || message.messageId;
                if (messageKey !== messageId) return message;
                return {
                    ...message,
                    content: 'This message was deleted',
                    contentType: 'text',
                    contentUrl: null,
                    file: null,
                    fileName: null,
                    fileType: null,
                    isMessageDeleted: true,
                    messageStatus: 'deleted',
                };
            });
            if (state.selectedMessage) {
                const selectedId = state.selectedMessage._id || state.selectedMessage.message_id || state.selectedMessage.messageId;
                if (selectedId === messageId) {
                    state.selectedMessage = {
                        ...state.selectedMessage,
                        content: 'This message was deleted',
                        contentType: 'text',
                        contentUrl: null,
                        file: null,
                        fileName: null,
                        fileType: null,
                        isMessageDeleted: true,
                        messageStatus: 'deleted',
                    };
                }
            }
        },
        setMessageStatus: (state, action) => {
            const { messageId, status } = action.payload;
            state.messageStatus[messageId] = status;
        },
        markMessagesAsRead: (state, action) => {
            const payload = action.payload || {};
            const conversationId = payload.conversationId || payload;
            const currentUserId = payload.currentUserId || payload.userId;
            const messageIds = Array.isArray(payload.messageIds)
                ? payload.messageIds.filter(Boolean)
                : payload.messageId
                    ? [payload.messageId]
                    : [];
            const currentUserIdentifier = normalizeId(currentUserId);

            state.messages = state.messages.map((message) => {
                const messageKey = message.message_id || message.messageId || message._id;
                const matchesConversation = message.conversation_id === conversationId || message.conversationId === conversationId;
                const matchesMessage = messageIds.length === 0 || messageIds.includes(messageKey);
                if (!matchesConversation || !matchesMessage) {
                    return message;
                }

                const messageSenderId = normalizeId(message.sender || message.userId || message.user);
                if (messageSenderId === currentUserIdentifier) {
                    return message;
                }

                const nextSeenBy = Array.from(new Set([
                    ...(Array.isArray(message.seenBy) ? message.seenBy : []),
                    currentUserIdentifier,
                ].filter(Boolean)));

                return {
                    ...message,
                    read: true,
                    messageStatus: "seen",
                    seenBy: nextSeenBy,
                };
            });
        },
        messageSeen: (state, action) => {
            const { messageIds, seenByUserId } = action.payload;

            state.messages = state.messages.map((msg) => {
                if (!messageIds.includes(msg.message_id)) {
                    return msg;
                }

                const seenBy = [...(msg.seenBy || [])];

                if (!seenBy.includes(seenByUserId)) {
                    seenBy.push(seenByUserId);
                }

                return {
                    ...msg,
                    seenBy,
                    messageStatus: "seen"
                };
            });
        },
        addReaction: (state, action) => {
            const { messageId, reaction } = action.payload;
            const messageIndex = state.messages.findIndex(message => message._id === messageId);
            if (messageIndex !== -1) {
                const message = state.messages[messageIndex];
                const existingReactionIndex = message.reactions.findIndex(r => r.userId === reaction.userId);
                if (existingReactionIndex !== -1) {
                    message.reactions[existingReactionIndex] = reaction;
                } else {
                    message.reactions.push(reaction);
                }
            }
        },

    }
})

export const { setMessages, addMessage, setSelectedMessage, messageSeen, EditMessage, deleteMessageState, markMessageDeleted, setMessageStatus, markMessagesAsRead, addReaction } = messageSlice.actions;

export default messageSlice.reducer;