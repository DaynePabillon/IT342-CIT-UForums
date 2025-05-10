package edu.cit.cituforumsmobile.api.service// ApiService.kt (Mobile - Android Kotlin - Create a new Kotlin file)
import edu.cit.cituforumsmobile.api.dto.JwtAuthResponse
import edu.cit.cituforumsmobile.api.dto.LoginRequest
import edu.cit.cituforumsmobile.api.dto.MemberDto
import edu.cit.cituforumsmobile.api.dto.MemberRegistrationRequest
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    @POST("api/auth/login")
    fun login(@Body loginRequest: LoginRequest): Call<JwtAuthResponse>

    @POST("api/auth/register")
    fun registerMember(@Body registrationRequest: MemberRegistrationRequest): Call<MemberDto>
}