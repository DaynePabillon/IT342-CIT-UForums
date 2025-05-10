package edu.cit.cituforumsmobile.api.dto

data class MemberDto(
    val id: Long,
    val username: String, // Changed from name
    val email: String,
    val firstName: String?, // Use nullable types for fields that might be null
    val lastName: String?,
    val role: String?,
    val roles: List<String>?,
    val status: String?,
    val createdAt: String?,
    val phoneNumber: String?,
    val studentNumber: String?,
    val city: String?,
    val province: String?,
    val address: String?,
    val bio: String?
)