package edu.cit.cituforumsmobile

import edu.cit.cituforumsmobile.api.service.AuthApiService
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import edu.cit.cituforumsmobile.api.dto.JwtAuthResponse
import edu.cit.cituforumsmobile.api.dto.LoginRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.converter.gson.GsonConverterFactory
import androidx.core.content.edit
import edu.cit.cituforumsmobile.api.config.ApiConfig
import retrofit2.Retrofit

class LoginActivity : Activity() {
    private lateinit var authApiService: AuthApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val sharedPrefs = getSharedPreferences("my_app", MODE_PRIVATE)
        val jwtToken = sharedPrefs.getString("jwt_token", null)

        if (jwtToken != null) {
            //  Token exists, proceed to ForumListActivity
            Log.d("LoginActivity", "Valid token found, redirecting to ForumListActivity")
            val intent = Intent(this, ForumActivity::class.java)
            startActivity(intent)
            finish() //  Close LoginActivity
            return
        }

        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        authApiService = retrofit.create(AuthApiService::class.java)

        val usernameOrEmail = findViewById<EditText>(R.id.login_useroremail)
        val password = findViewById<EditText>(R.id.login_password)
        val buttonLogin = findViewById<Button>(R.id.login_loginbutton)
        val textviewRegister = findViewById<TextView>(R.id.login_registerbutton)

        intent?.let {
            it.getStringExtra("username")?.let { username ->
                usernameOrEmail.setText(username)
            }
        }

        buttonLogin.setOnClickListener {
            val usernameOrEmail = usernameOrEmail.text.toString()
            val password = password.text.toString()

            if(usernameOrEmail.isNotEmpty() && password.isNotEmpty()){
                performLogin(usernameOrEmail, password)

//                val intent = Intent(this, ForumActivity::class.java)
//                startActivity(intent)

            } else {
                Toast.makeText(
                    this,
                    "Username and Password must not be blank.",
                    Toast.LENGTH_LONG)
                    .show()
            }
        }

        textviewRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun performLogin(usernameOrEmail: String, password: String) {
        val loginRequest = LoginRequest(usernameOrEmail, password)
        val call = authApiService.login(loginRequest)

        call.enqueue(object : Callback<JwtAuthResponse> {
            override fun onResponse(call: Call<JwtAuthResponse>, response: Response<JwtAuthResponse>) {
                if (response.isSuccessful) {
                    val jwtAuthResponse = response.body()
                    val jwtToken = jwtAuthResponse?.accessToken
                    val memberDto = jwtAuthResponse?.memberDto
                    Log.d("LoginActivity", "Login successful: Token: $jwtToken, User: $memberDto")

                    if (jwtToken != null) {
                        val sharedPrefs = getSharedPreferences("my_app_prefs", MODE_PRIVATE)
                        sharedPrefs.edit() { putString("jwt_token", jwtToken) }
                    }

                    // 4. Store all the user data.
                    if (memberDto != null) {
                        val sharedPrefs = getSharedPreferences("my_app_prefs", MODE_PRIVATE)
                        sharedPrefs.edit().putLong("user_id", memberDto.id).apply()
                        sharedPrefs.edit().putString("user_username", memberDto.username).apply()  // Changed from name
                        sharedPrefs.edit().putString("user_email", memberDto.email).apply()
                        sharedPrefs.edit().putString("user_firstName", memberDto.firstName).apply()
                        sharedPrefs.edit().putString("user_lastName", memberDto.lastName).apply()
                        sharedPrefs.edit().putString("user_role", memberDto.role).apply()
                        sharedPrefs.edit().putString("user_status", memberDto.status).apply()
                        sharedPrefs.edit().putString("user_createdAt", memberDto.createdAt).apply()
                        sharedPrefs.edit().putString("user_phoneNumber", memberDto.phoneNumber).apply()
                        sharedPrefs.edit().putString("user_studentNumber", memberDto.studentNumber).apply()
                        sharedPrefs.edit().putString("user_city", memberDto.city).apply()
                        sharedPrefs.edit().putString("user_province", memberDto.province).apply()
                        sharedPrefs.edit().putString("user_address", memberDto.address).apply()
                        sharedPrefs.edit().putString("user_bio", memberDto.bio).apply()

                        // You might want to store the roles as a single string or in a more suitable format for SharedPrefs
                        if (memberDto.roles != null) {
                            sharedPrefs.edit().putString("user_roles", memberDto.roles.joinToString(",")).apply()
                        }
                    }

                    val intent = Intent(this@LoginActivity, ForumActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Login failed"
                    Log.e("LoginActivity", "Login failed with code ${response.code()}: $errorMessage")
                    Toast.makeText(this@LoginActivity, "Login Failed: $errorMessage", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<JwtAuthResponse>, t: Throwable) {
                Log.e("LoginActivity", "Network error: ${t.message}")
                Toast.makeText(this@LoginActivity, "Network Error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}