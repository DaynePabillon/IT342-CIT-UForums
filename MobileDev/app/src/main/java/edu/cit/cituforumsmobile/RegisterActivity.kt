package edu.cit.cituforumsmobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button

class RegisterActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val buttonLogin = findViewById<Button>(R.id.register_loginbutton)
        buttonLogin.setOnClickListener {
            val intent = Intent(this,LoginActivity::class.java)
            startActivity(intent)
        }
    }
}