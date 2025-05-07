package edu.cit.backend3.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time updates
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to send messages to clients
        // Messages whose destination starts with "/topic" should be routed to the broker
        config.enableSimpleBroker("/topic");
        
        // Messages whose destination starts with "/app" should be routed to message-handling methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options so that alternate
        // transports can be used if WebSocket is not available
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                    "https://it342-cit-uforums-site.onrender.com", 
                    "http://localhost:3000",
                    "http://localhost:8000",
                    "http://127.0.0.1:8000",
                    "http://127.0.0.1:3000"
                )
                .withSockJS();
    }
}
