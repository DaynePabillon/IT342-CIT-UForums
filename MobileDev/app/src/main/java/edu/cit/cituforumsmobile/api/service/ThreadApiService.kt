package edu.cit.cituforumsmobile.api.service

import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import edu.cit.cituforumsmobile.api.dto.ThreadDto
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query

interface ThreadApiService {
    @GET("api/threads/forum/{forumId}") //  Correct endpoint, use path parameter
    fun getThreadsByForumId(
        @Path("forumId") forumId: Long,
        @Query("page") page: Int,
        @Query("size") size: Int
    ): Call<PagedResponseDto<ThreadDto>>  // Changed to PagedResponseDto

    @GET("/threads/{threadId}")
    fun getThreadDetails(
        @Path("threadId") threadId: Long,
        @Header("Authorization") token: String
    ): Call<ThreadDto>
}