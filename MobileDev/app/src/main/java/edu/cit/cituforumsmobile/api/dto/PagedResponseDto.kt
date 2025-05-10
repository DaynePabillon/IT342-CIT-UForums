package edu.cit.cituforumsmobile.api.dto

data class PagedResponseDto<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val last: Boolean
)