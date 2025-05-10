package edu.cit.cituforumsmobile.api.dto

data class MemberRegistrationRequest(
    val name: String,
    val email: String,
    val password: String,
    val firstName: String?,
    val lastName: String?,
    val phoneNumber: String?,
    val studentNumber: String?,
    val city: String?,
    val province: String?,
    val address: String?,
    val bio: String?
)