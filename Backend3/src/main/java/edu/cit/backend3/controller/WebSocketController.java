package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.WebSocketMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * Controller for handling WebSocket messages
 */
@Controller
public class WebSocketController {

    /**
     * Handle new thread messages and broadcast to subscribers
     */
    @MessageMapping("/thread.new")
    public WebSocketMessage<ThreadDto> handleNewThread(
            @Payload WebSocketMessage<ThreadDto> message,
            SimpMessageHeaderAccessor headerAccessor,
            SimpMessagingTemplate messagingTemplate) {
        // Add username to WebSocket session
        if (message.getContent() != null && message.getContent().getAuthor() != null) {
            headerAccessor.getSessionAttributes().put("username", message.getContent().getAuthor().getUsername());
        }
        
        // Get the forum ID from the message content and send to the specific forum topic
        if (message.getContent() != null && message.getContent().getForumId() != null) {
            Long forumId = message.getContent().getForumId();
            messagingTemplate.convertAndSend("/topic/forum/" + forumId, message);
            
            // Also send to the general forum topic for global updates
            messagingTemplate.convertAndSend("/topic/forum", message);
        }
        
        return message;
    }

    /**
     * Handle new comment messages and broadcast to thread subscribers
     */
    @MessageMapping("/comment.new")
    public WebSocketMessage<CommentDto> handleNewComment(
            @Payload WebSocketMessage<CommentDto> message,
            SimpMessageHeaderAccessor headerAccessor,
            SimpMessagingTemplate messagingTemplate) {
        // Add username to WebSocket session
        if (message.getContent() != null && message.getContent().getAuthor() != null) {
            headerAccessor.getSessionAttributes().put("username", message.getContent().getAuthor().getUsername());
        }
        
        // Get the thread ID from the message content and send to the specific thread topic
        if (message.getContent() != null && message.getContent().getThreadId() != null) {
            Long threadId = message.getContent().getThreadId();
            messagingTemplate.convertAndSend("/topic/thread/" + threadId, message);
        }
        
        return message;
    }

    /**
     * Handle thread updates and broadcast to thread subscribers
     */
    @MessageMapping("/thread.update")
    public WebSocketMessage<ThreadDto> handleThreadUpdate(
            @Payload WebSocketMessage<ThreadDto> message,
            SimpMessagingTemplate messagingTemplate) {
        // Get the thread ID from the message content and send to the specific thread topic
        if (message.getContent() != null && message.getContent().getId() != null) {
            Long threadId = message.getContent().getId();
            messagingTemplate.convertAndSend("/topic/thread/" + threadId, message);
        }
        return message;
    }
}
