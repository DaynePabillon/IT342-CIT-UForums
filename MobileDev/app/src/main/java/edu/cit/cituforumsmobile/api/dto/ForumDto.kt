package edu.cit.cituforumsmobile.api.dto

data class ForumDto(
    val id: Long,  // Add the ID, make sure it matches the backend
    val title: String,
    val description: String,
    val categoryName: String,
    val postCount: Int
)