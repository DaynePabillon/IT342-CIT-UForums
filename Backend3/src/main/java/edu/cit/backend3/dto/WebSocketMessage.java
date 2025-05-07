package edu.cit.backend3.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebSocket messages
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage<T> {
    
    /**
     * Type of message (e.g., NEW_THREAD, NEW_COMMENT, THREAD_UPDATE)
     */
    private MessageType type;
    
    /**
     * Content of the message
     */
    private T content;
    
    /**
     * Enum for different types of WebSocket messages
     */
    public enum MessageType {
        NEW_THREAD,
        NEW_COMMENT,
        THREAD_UPDATE,
        FORUM_UPDATE,
        USER_JOINED
    }
}
