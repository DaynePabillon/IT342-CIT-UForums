package edu.cit.backend3.service;

import edu.cit.backend3.dto.WebSocketMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for sending WebSocket messages
 */
@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Send a message to a specific topic
     *
     * @param destination the destination topic
     * @param message     the message to send
     */
    public <T> void sendMessage(String destination, WebSocketMessage<T> message) {
        messagingTemplate.convertAndSend(destination, message);
    }

    /**
     * Send a message to a forum topic
     *
     * @param forumId the forum ID
     * @param message the message to send
     */
    public <T> void sendForumMessage(Long forumId, WebSocketMessage<T> message) {
        sendMessage("/topic/forum/" + forumId, message);
    }

    /**
     * Send a message to a thread topic
     *
     * @param threadId the thread ID
     * @param message  the message to send
     */
    public <T> void sendThreadMessage(Long threadId, WebSocketMessage<T> message) {
        sendMessage("/topic/thread/" + threadId, message);
    }

    /**
     * Send a message to the public topic
     *
     * @param message the message to send
     */
    public <T> void sendPublicMessage(WebSocketMessage<T> message) {
        sendMessage("/topic/public", message);
    }
}
