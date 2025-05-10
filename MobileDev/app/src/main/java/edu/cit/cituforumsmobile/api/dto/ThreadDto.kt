package edu.cit.cituforumsmobile.api.dto

data class ThreadDto(
    val id: Long,
    val title: String,
    val content: String,
    val createdBy: MemberSummaryDto,
    val forumId: Long,
    val createdAt: String //  Or consider using a Date/Time library
)