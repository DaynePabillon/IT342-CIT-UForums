package edu.cit.cituforumsmobile.api.dto

data class CommentDto(
    val id: Long,
    val content: String,
    val author: MemberSummaryDto,
    val createdAt: String // Or a Date/Time library
)