import React from 'react'
import MessageWindow from '../MessageWindow/MessageWindow'
import MessageTyping from '../MessageWindow/MessageTyping'

const ChatWindow = () => {
    return (
        <>
            <MessageWindow></MessageWindow>
            <MessageTyping></MessageTyping>
        </>
    )
}

export default ChatWindow