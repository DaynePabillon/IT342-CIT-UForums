package edu.cit.cituforumsmobile.api.dto

data class JwtAuthResponse(
    val accessToken: String,
    val tokenType: String, // You might not need this, but include it if your backend sends it
    val memberDto: MemberDto? // Include if you get user info back
)