const Message = ({text, userName}) => {
    return (
        <div className="message">
            <strong>{userName}</strong>: {text}
        </div>
    )
}

export default Message;