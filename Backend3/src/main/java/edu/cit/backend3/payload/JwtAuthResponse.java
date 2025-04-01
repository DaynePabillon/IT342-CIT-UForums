package edu.cit.backend3.payload;

import java.util.Map;

public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Map<String, Object> user;

    public JwtAuthResponse(String accessToken, Map<String, Object> user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Map<String, Object> getUser() {
        return user;
    }

    public void setUser(Map<String, Object> user) {
        this.user = user;
    }
} 