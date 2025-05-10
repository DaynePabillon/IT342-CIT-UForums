package edu.cit.cituforumsmobile

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import android.widget.Toast
import android.util.Log
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.adapter.CommentAdapter
import edu.cit.cituforumsmobile.adapter.PaginationAdapter
import edu.cit.cituforumsmobile.api.config.ApiConfig
import edu.cit.cituforumsmobile.api.dto.CommentDto
import edu.cit.cituforumsmobile.api.dto.CommentRequest
import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import edu.cit.cituforumsmobile.api.service.CommentApiService
import edu.cit.cituforumsmobile.api.service.ThreadApiService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ThreadDetailActivity : AppCompatActivity() { // Renamed to ThreadDetailActivity

    private lateinit var threadTitleTextView: TextView
    private lateinit var threadContentTextView: TextView
    private lateinit var threadAuthorNameTextView: TextView
    private lateinit var threadCreatedDateTextView: TextView
    private lateinit var commentEditText: EditText
    private lateinit var postCommentButton: Button
    private lateinit var toolbar: Toolbar // Add Toolbar

    private val commentList = mutableListOf<CommentDto>()

    private lateinit var commentApiService: CommentApiService  // Renamed
    private lateinit var threadService: ThreadApiService // Renamed

    private var threadId: Long = -1
    private lateinit var token: String

    private lateinit var commentsRecyclerView: RecyclerView
    private lateinit var commentAdapter: CommentAdapter
    private lateinit var pageNumberRecyclerView: RecyclerView  // Add this
    private lateinit var paginationAdapter: PaginationAdapter // Add this
    private var currentPage = 0
    private val pageSize = 10
    private var isLastPage = false
    private lateinit var prevButton: Button
    private lateinit var nextButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_thread_detail) // Use activity_thread_detail.xml

        // Initialize UI elements
        toolbar = findViewById(R.id.threaddetail_toolbar) // Initialize toolbar
        setSupportActionBar(toolbar)  // Set support action bar
        supportActionBar?.setDisplayHomeAsUpEnabled(true) // Enable back button
        toolbar.setNavigationOnClickListener {
            finish()
        }

        // Initialize UI elements
        threadTitleTextView = findViewById(R.id.threadTitleTextView)
        threadContentTextView = findViewById(R.id.threadContentTextView)
        threadAuthorNameTextView = findViewById(R.id.threadAuthorNameTextView)
        threadCreatedDateTextView = findViewById(R.id.threadDateTextView)
        commentEditText = findViewById(R.id.commentEditText)
        postCommentButton = findViewById(R.id.postCommentButton)
        commentsRecyclerView = findViewById(R.id.commentsRecyclerView) //  Initialize
        pageNumberRecyclerView = findViewById(R.id.pageNumberRecyclerView) // Initialize the new RecyclerView
        prevButton = findViewById(R.id.prevButton)  // Initialize
        nextButton = findViewById(R.id.nextButton)  // Initialize

        threadId = intent.getLongExtra("thread_id", -1)
        val threadTitle = intent.getStringExtra("thread_title")
        val threadContent = intent.getStringExtra("thread_content")
        val threadAuthor = intent.getStringExtra("thread_author")
        val threadCreatedAt = intent.getStringExtra("thread_createdat")

        // Initialize Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL) // Changed base URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        commentApiService = retrofit.create(CommentApiService::class.java) // Renamed

        // Configure RecyclerView for comments
        commentAdapter = CommentAdapter(mutableListOf())
        commentsRecyclerView.layoutManager = LinearLayoutManager(this)
        commentsRecyclerView.adapter = commentAdapter

        //  Layout manager for page number recycler view
        pageNumberRecyclerView.layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        threadTitleTextView.text = threadTitle
        threadContentTextView.text = threadContent
        threadAuthorNameTextView.text = threadAuthor
        threadCreatedDateTextView.text = threadCreatedAt

        // Fetch thread details
        loadComments()

        // Set click listener for the post comment button
        postCommentButton.setOnClickListener {
            val commentText = commentEditText.text.toString().trim()
            if (commentText.isNotEmpty()) {
                postComment(commentText)
            } else {
                Toast.makeText(this, "Please enter a comment", Toast.LENGTH_SHORT).show()
            }
        }

        prevButton.setOnClickListener {
            if (currentPage > 0) {
                currentPage--
                loadComments()
            }
        }

        nextButton.setOnClickListener {
            if (!isLastPage) {
                currentPage++
                loadComments()
            }
        }
    }

    private fun loadComments() {
        if (threadId == -1L) {
            Toast.makeText(this, "Invalid Forum ID", Toast.LENGTH_LONG).show()
            return
        }

        val call = commentApiService.getComments(threadId, currentPage, 10)
        call.enqueue(object : Callback<PagedResponseDto<CommentDto>> {
            override fun onResponse(
                call: Call<PagedResponseDto<CommentDto>>,
                response: Response<PagedResponseDto<CommentDto>>
            ) {
                if (response.isSuccessful) {
                    val pagedResponse = response.body() ?: return
                    val newComments = pagedResponse.content
                    Log.d(
                        "ThreadDetailActivity",
                        "Retrieved ${newComments.size} comments for page $currentPage"
                    )
                    commentAdapter.clearComments()
                    commentAdapter.addComments(newComments)
                    isLastPage = pagedResponse.last
                    nextButton.isEnabled = !isLastPage
                    prevButton.isEnabled = currentPage > 0

                    paginationAdapter = PaginationAdapter(
                        totalPages = pagedResponse.totalPages,
                        currentPage = pagedResponse.page
                    ) { page ->
                        currentPage = page - 1
                        loadComments()
                        prevButton.isEnabled = currentPage > 0
                        nextButton.isEnabled = !isLastPage
                    }
                    pageNumberRecyclerView.adapter = paginationAdapter
                } else {
                    Log.e(
                        "ThreadDetailActivity",
                        "Failed to load comments: ${response.code()}, ${
                            response.errorBody()?.string()
                        }"
                    )
                    Toast.makeText(
                        this@ThreadDetailActivity,
                        "Failed to load comments",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }

            override fun onFailure(call: Call<PagedResponseDto<CommentDto>>, t: Throwable) {
                Log.e("ThreadDetailActivity", "Network error: ${t.message}")
                Toast.makeText(
                    this@ThreadDetailActivity,
                    "Network Error: ${t.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        })
    }

    private fun postComment(commentText: String) {
        if (threadId == -1L) {
            Toast.makeText(this, "Invalid Forum ID", Toast.LENGTH_LONG).show()
            return
        }
        val commentRequest = CommentRequest(commentText, threadId) // Include
        val call = commentApiService.createComment(threadId, commentRequest)
        call.enqueue(object : Callback<CommentDto> {
            override fun onResponse(call: Call<CommentDto>, response: Response<CommentDto>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ThreadDetailActivity, "Comment posted successfully", Toast.LENGTH_SHORT).show()
                    //  Optionally:  Update the UI to display the new comment.
                    //  For example, you might want to navigate back to the ThreadDetailActivity
                    //  and have it refresh the comment list.
//                    finish() // Close this activity after posting.
                    loadComments() // Refresh the comments
                } else {
                    Log.e("ThreadDetailActivity", "Error posting comment: ${response.message()}")
                    Toast.makeText(
                        this@ThreadDetailActivity,
                        "Failed to post comment: ${response.message()}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<CommentDto>, t: Throwable) {
                Log.e("ThreadDetailActivity", "Error posting comment: ${t.message}")
                Toast.makeText(
                    this@ThreadDetailActivity,
                    "Failed to post comment: ${t.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })
    }
}
