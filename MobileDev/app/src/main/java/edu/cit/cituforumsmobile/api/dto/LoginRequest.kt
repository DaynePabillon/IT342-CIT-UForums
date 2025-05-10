package edu.cit.cituforumsmobile.api.dto

data class LoginRequest(
    val usernameOrEmail: String,
    val password: String
)