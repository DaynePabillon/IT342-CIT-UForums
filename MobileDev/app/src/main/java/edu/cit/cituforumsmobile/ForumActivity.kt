package edu.cit.cituforumsmobile

import android.content.Intent
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.api.dto.ForumDto
import edu.cit.cituforumsmobile.adapter.ForumsAdapter
import edu.cit.cituforumsmobile.api.config.ApiConfig
import edu.cit.cituforumsmobile.api.service.AuthApiService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import android.util.Log
import android.view.Gravity
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import edu.cit.cituforumsmobile.adapter.PaginationAdapter
import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import edu.cit.cituforumsmobile.api.service.ForumApiService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ForumActivity : AppCompatActivity() { // Change to AppCompatActivity

    private lateinit var authApiService: AuthApiService
    private lateinit var forumsRecyclerView: RecyclerView
    private lateinit var forumsAdapter: ForumsAdapter
    private val forumsList = mutableListOf<ForumDto>()
    private lateinit var forumApiService: ForumApiService
    private var currentPage = 0
    private var isLastPage = false
    private lateinit var forum_nextButton: Button
    private lateinit var forum_prevButton: Button
    private lateinit var pageNumberRecyclerView: RecyclerView
    private lateinit var paginationAdapter: PaginationAdapter
    private val pageSize = 10
    private lateinit var toolbar: Toolbar // Declare Toolbar
    private var newForumButton: Button? = null// Declare newForumButton


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forum)

        // Initialize toolbar
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)


        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        authApiService = retrofit.create(AuthApiService::class.java)
        forumApiService = retrofit.create(ForumApiService::class.java)

        forumsRecyclerView = findViewById(R.id.forums_recycler_view)
        forumsRecyclerView.layoutManager = LinearLayoutManager(this)

        forumsAdapter = ForumsAdapter(forumsList,
            onForumClickListener = { forum ->
                Log.d("ForumActivity", "Clicked on forum: ${forum.title}")
                val intent = Intent(this, ThreadListActivity::class.java)
                intent.putExtra("forum_id", forum.id)
                intent.putExtra("forum_title", forum.title)
                intent.putExtra("forum_description", forum.description)
                intent.putExtra("forum_category", forum.categoryName)
                intent.putExtra("forum_post_count", forum.postCount)
                startActivity(intent)
            },
            onLoadMoreListener = {
            })

        forumsRecyclerView.adapter = forumsAdapter

        forum_nextButton = findViewById(R.id.forum_next_button)
        forum_prevButton = findViewById(R.id.forum_prev_button)
        forum_prevButton.isEnabled = false
        pageNumberRecyclerView = findViewById(R.id.pagination_recycler_view)
        pageNumberRecyclerView.layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        // Initialize and add New Forum button to toolbar
        newForumButton = Button(this)
        newForumButton?.text = "New Forum"  // Set the text for the button
        val toolbarLayoutParams = Toolbar.LayoutParams(
            Toolbar.LayoutParams.WRAP_CONTENT, // Width and height
            Toolbar.LayoutParams.WRAP_CONTENT,
            Gravity.END // Position the button to the end (right)
        )
        newForumButton?.layoutParams = toolbarLayoutParams
        val padding = resources.getDimensionPixelSize(R.dimen.default_padding)
        newForumButton?.setPadding(padding, 0, padding, 0)
        toolbar.addView(newForumButton)

        newForumButton?.setOnClickListener {
            // Start the CreateForumActivity
            val intent = Intent(this, CreateForumActivity::class.java)
            startActivity(intent)
        }

        forum_nextButton.setOnClickListener {
            currentPage++
            loadForums()
            forum_prevButton.isEnabled = true
        }

        forum_prevButton.setOnClickListener {
            currentPage--
            loadForums()
            if (currentPage == 0) {
                forum_prevButton.isEnabled = false
            }
        }

        loadForums()
    }

    private fun loadForums() {
        val call = forumApiService.getAllForums(currentPage, pageSize)
        call.enqueue(object : Callback<PagedResponseDto<ForumDto>> {
            override fun onResponse(
                call: Call<PagedResponseDto<ForumDto>>,
                response: Response<PagedResponseDto<ForumDto>>
            ) {
                if (response.isSuccessful) {
                    val pagedResponse = response.body() ?: return
                    val newForums = pagedResponse.content
                    Log.d(
                        "ForumActivity",
                        "Retrieved ${newForums.size} forums for page $currentPage"
                    )
                    forumsAdapter.clearForums()
                    forumsAdapter.addForums(newForums)
                    isLastPage = pagedResponse.last
                    forum_nextButton.isEnabled = !isLastPage
                    forum_prevButton.isEnabled = currentPage > 0

                    paginationAdapter = PaginationAdapter(
                        totalPages = pagedResponse.totalPages,
                        currentPage = pagedResponse.page
                    ) { page ->
                        currentPage = page - 1
                        loadForums()
                        forum_prevButton.isEnabled = currentPage > 0
                    }
                    pageNumberRecyclerView.adapter = paginationAdapter
                } else {
                    Log.e(
                        "ForumActivity",
                        "Failed to load forums: ${response.code()}, ${
                            response.errorBody()?.string()
                        }"
                    )
                    Toast.makeText(
                        this@ForumActivity,
                        "Failed to load forums",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }

            override fun onFailure(call: Call<PagedResponseDto<ForumDto>>, t: Throwable) {
                Log.e("ForumActivity", "Network error: ${t.message}")
                Toast.makeText(this@ForumActivity, "Network Error: ${t.message}", Toast.LENGTH_LONG)
                    .show()
            }
        })
    }
}