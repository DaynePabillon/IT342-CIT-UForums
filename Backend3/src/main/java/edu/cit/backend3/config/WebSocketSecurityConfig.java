package edu.cit.backend3.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

/**
 * Security configuration for WebSocket connections
 */
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            // Allow all connection frames
            .simpTypeMatchers(SimpMessageType.CONNECT).permitAll()
            // Allow subscription to public topics
            .simpSubscribeDestMatchers("/topic/public/**").permitAll()
            // Allow subscription to thread-specific topics
            .simpSubscribeDestMatchers("/topic/thread/**").permitAll()
            // Allow subscription to forum-specific topics
            .simpSubscribeDestMatchers("/topic/forum/**").permitAll()
            // Require authentication for sending messages
            .simpDestMatchers("/app/**").authenticated()
            // Deny any other messages
            .anyMessage().denyAll();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // Disable CSRF for WebSocket connections
        return true;
    }
}
