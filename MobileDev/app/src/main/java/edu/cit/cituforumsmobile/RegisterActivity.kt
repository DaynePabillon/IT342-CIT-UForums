package edu.cit.cituforumsmobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import com.google.android.material.textfield.TextInputLayout
import edu.cit.cituforumsmobile.api.config.ApiConfig
import edu.cit.cituforumsmobile.api.dto.MemberDto
import edu.cit.cituforumsmobile.api.dto.MemberRegistrationRequest
import edu.cit.cituforumsmobile.api.service.AuthApiService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RegisterActivity : Activity() {

    private lateinit var authApiService: AuthApiService


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)  // Use the constant from the class
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        authApiService = retrofit.create(AuthApiService::class.java)

        val name = findViewById<TextInputLayout>(R.id.register_username_layout)
        val email = findViewById<TextInputLayout>(R.id.register_email_layout)
        val password = findViewById<TextInputLayout>(R.id.register_password_layout)
        val confirmPassword = findViewById<TextInputLayout>(R.id.register_confirmpassword_layout)

        val firstName = findViewById<TextInputLayout>(R.id.register_firstname_layout)
        val lastName = findViewById<TextInputLayout>(R.id.register_lastname_layout)
        val phoneNumber = findViewById<TextInputLayout>(R.id.register_phonenumber_layout)
        val studentID = findViewById<TextInputLayout>(R.id.register_studentid_layout)

        val city = findViewById<TextInputLayout>(R.id.register_city_layout)
        val province = findViewById<TextInputLayout>(R.id.register_province_layout)
        val address = findViewById<TextInputLayout>(R.id.register_address_layout)

        val bio = findViewById<TextInputLayout>(R.id.register_bio_layout)

        val buttonRegister = findViewById<Button>(R.id.register_registerbutton)
        val buttonLogin = findViewById<TextView>(R.id.register_loginbutton)

        // 4. Set up TextWatchers for validation
        name.editText?.addTextChangedListener(createTextWatcher(name, "Username cannot be empty", "^[a-zA-Z0-9._-]+$", "Username can only contain letters, numbers, dots, underscores, and hyphens (no spaces)", 3, 50))
        email.editText?.addTextChangedListener(createTextWatcher(email, "Email cannot be empty", "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$", "Invalid email format"))
        password.editText?.addTextChangedListener(createTextWatcher(password, "Password cannot be empty", ".{6,}", "Password must be at least 6 characters"))
        confirmPassword.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val passwordText = password.editText?.text.toString()
                if (s.toString() != passwordText) {
                    confirmPassword.error = "Passwords do not match"
                } else {
                    confirmPassword.error = null
                }
            }

            override fun afterTextChanged(s: Editable?) {}
        })
        phoneNumber.editText?.addTextChangedListener(createTextWatcher(phoneNumber, null, "^\\d{11}$", "Phone number must be 11 digits without dashes or spaces"))
        studentID.editText?.addTextChangedListener(createTextWatcher(studentID, "Student ID cannot be empty", "^\\d{2}-\\d{4}-\\d{3}$", "Student ID must be in format ##-####-###"))
        bio.editText?.addTextChangedListener(createTextWatcher(bio, null, "^.{0,500}$", "Bio cannot exceed 500 characters"))

        buttonRegister.setOnClickListener {
            val nameString = name.editText?.text.toString()
            val emailString = email.editText?.text.toString()
            val passwordString = password.editText?.text.toString()
            val confirmPasswordString = confirmPassword.editText?.text.toString()
            val firstNameString = firstName.editText?.text.toString()
            val lastNameString = lastName.editText?.text.toString()
            val phoneNumberString = phoneNumber.editText?.text.toString()
            val studentIDString = studentID.editText?.text.toString()
            val cityString = city.editText?.text.toString()
            val provinceString = province.editText?.text.toString()
            val addressString = address.editText?.text.toString()
            val bioString = bio.editText?.text.toString()

            // Perform final validation before registration
            var isValid = true
            if (name.error != null) isValid = false
            if (email.error != null) isValid = false
            if (password.error != null) isValid = false
            if (confirmPassword.error != null) isValid = false
            if (phoneNumber.error != null) isValid = false
            if (studentID.error != null) isValid = false
            if (bio.error != null) isValid = false

            if (!isValid) {
                Toast.makeText(this, "Please fix the errors in the form.", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val registrationRequest = MemberRegistrationRequest(
                name = nameString,
                email = emailString,
                password = passwordString,
                firstName = firstNameString,
                lastName = lastNameString,
                phoneNumber = phoneNumberString,
                studentNumber = studentIDString,
                city = cityString,
                province = provinceString,
                address = addressString,
                bio = bioString
            )

            performRegistration(registrationRequest)
        }

        buttonLogin.setOnClickListener {
            val intent = Intent(this,LoginActivity::class.java)
            startActivity(intent)
        }
    }

    // 6.  Helper function to create TextWatcher
    private fun createTextWatcher(textInputLayout: TextInputLayout, emptyMessage: String?, regex: String?, errorMessage: String?, minLength: Int? = null, maxLength: Int? = null): TextWatcher {
        return object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val text = s.toString()
                if (text.isEmpty() && emptyMessage != null) {
                    textInputLayout.error = emptyMessage
                } else if (regex != null && !text.matches(Regex(regex))) {
                    textInputLayout.error = errorMessage
                } else if (minLength != null && text.length < minLength) {
                    textInputLayout.error = errorMessage
                } else if (maxLength != null && text.length > maxLength) {
                    textInputLayout.error = errorMessage
                } else {
                    textInputLayout.error = null // Clear the error
                }
            }

            override fun afterTextChanged(s: Editable?) {}
        }
    }

    private fun performRegistration(registrationRequest: MemberRegistrationRequest) {
        val call = authApiService.registerMember(registrationRequest)

        call.enqueue(object : Callback<MemberDto> {
            override fun onResponse(call: Call<MemberDto>, response: Response<MemberDto>) {
                if (response.isSuccessful) {
                    val registeredMember = response.body()
                    Log.d("RegisterActivity", "Registration successful: $registeredMember")
                    Toast.makeText(this@RegisterActivity, "Registration successful!", Toast.LENGTH_LONG).show()

                    val intent = Intent(this@RegisterActivity, LoginActivity::class.java).apply {
                        putExtra("username", registrationRequest.name)
                    }
                    startActivity(intent)
                    finish()
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Registration failed"
                    Log.e("RegisterActivity", "Registration failed with code ${response.code()}: $errorMessage")
                    Toast.makeText(this@RegisterActivity, "Registration Failed: $errorMessage", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<MemberDto>, t: Throwable) {
                Log.e("RegisterActivity", "Network error: ${t.message}")
                Toast.makeText(this@RegisterActivity, "Network Error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}