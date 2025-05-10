package edu.cit.cituforumsmobile.api.dto

data class CommentRequest(
    val text: String,
    val threadid: Long,
)