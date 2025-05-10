package edu.cit.cituforumsmobile.api.service

import edu.cit.cituforumsmobile.api.dto.ForumDto
import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

// 3.  Define the Retrofit service interface
interface ForumApiService {
    @GET("api/forums")
    fun getAllForums(
        @Query("page") page: Int,
        @Query("size") size: Int
    ): Call<PagedResponseDto<ForumDto>>
}