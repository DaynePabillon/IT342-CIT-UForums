package edu.cit.cituforumsmobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button

class LoginActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val button_login = findViewById<Button>(R.id.login_loginbutton)
        button_login.setOnClickListener {
            Log.e("Button Login Test", "Button pressed")
        }

        val button_register = findViewById<Button>(R.id.login_registerbutton)
        button_register.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }
}