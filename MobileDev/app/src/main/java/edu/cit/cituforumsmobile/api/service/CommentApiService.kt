package edu.cit.cituforumsmobile.api.service

import edu.cit.cituforumsmobile.api.dto.CommentDto
import edu.cit.cituforumsmobile.api.dto.CommentRequest
import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import edu.cit.cituforumsmobile.api.dto.ThreadDto
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface CommentApiService {
    @GET("/api/comments/thread/{threadId}")  // Changed base URL and endpoint
    fun getComments(
        @Path("threadId") threadId: Long,
        @Query("page") page: Int,
        @Query("size") size: Int
    ): Call<PagedResponseDto<CommentDto>>

    @POST("/api/comments/thread/{threadId}") // Changed base URL and endpoint
    fun createComment(
        @Path("threadId") threadId: Long,
        @Body commentRequest: CommentRequest
    ): Call<CommentDto> //  Or a more detailed response
}