package edu.cit.cituforumsmobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import android.widget.Toolbar
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.api.dto.ThreadDto
import androidx.recyclerview.widget.LinearLayoutManager
import edu.cit.cituforumsmobile.adapter.PaginationAdapter
import edu.cit.cituforumsmobile.adapter.ThreadsAdapter
import edu.cit.cituforumsmobile.api.config.ApiConfig
import edu.cit.cituforumsmobile.api.dto.PagedResponseDto
import edu.cit.cituforumsmobile.api.service.ThreadApiService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import android.view.Gravity
//import edu.cit.cituforumsmobile.activity.CreateThreadActivity
//import edu.cit.cituforumsmobile.activity.ThreadDetailActivity

class ThreadListActivity : AppCompatActivity() { // Change to AppCompatActivity

    private lateinit var forumTitleTextView: TextView
    private lateinit var forumDescriptionTextView: TextView
    private lateinit var threadsRecyclerView: RecyclerView
    private lateinit var threadsAdapter: ThreadsAdapter
    private val threadsList = mutableListOf<ThreadDto>()
    private lateinit var threadApiService: ThreadApiService // Use ThreadApiService
    private var forumId: Long = -1
    private var currentPage = 0
    private var isLastPage = false
    private lateinit var threadlistnextButton: Button
    private lateinit var threadlistprevButton: Button
    private lateinit var pageNumberRecyclerView: RecyclerView // Declare the RecyclerView for page numbers
    private lateinit var paginationAdapter: PaginationAdapter
    private lateinit var newThreadButton: Button
    private val pageSize = 10
    private lateinit var toolbar: androidx.appcompat.widget.Toolbar  // Declare Toolbar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_thread_list)  //  Ensure this layout contains all the necessary views

        // 5. Initialize views
        toolbar = findViewById(R.id.toolbar) // Initialize toolbar
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true) // Enable back button
        toolbar.setNavigationOnClickListener {
            finish()
        }

        forumTitleTextView = findViewById(R.id.forum_title_text_view)
        forumDescriptionTextView = findViewById(R.id.forum_description_text_view)
        threadsRecyclerView = findViewById(R.id.threads_recycler_view)
        threadsRecyclerView.layoutManager = LinearLayoutManager(this)
        threadlistnextButton = findViewById(R.id.threadlist_next_button)  // Initialize the buttons
        threadlistprevButton = findViewById(R.id.threadlist_prev_button)
        threadlistprevButton.isEnabled = false
        pageNumberRecyclerView = findViewById(R.id.pagination_recycler_view) // Initialize the RecyclerView
        pageNumberRecyclerView.layoutManager =
            LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        newThreadButton = Button(this) //  Initialize New Thread Button
        newThreadButton.text = "New Thread"
        val toolbarLayoutParams = Toolbar.LayoutParams(
            Toolbar.LayoutParams.WRAP_CONTENT,
            Toolbar.LayoutParams.WRAP_CONTENT,
            Gravity.END
        )
        newThreadButton.layoutParams = toolbarLayoutParams
        newThreadButton.setPadding(16, 0, 16, 0)
        toolbar.addView(newThreadButton) // Add to the toolbar


        // 6. Get data from intent
        forumId = intent.getLongExtra("forum_id", -1)
        val forumTitle = intent.getStringExtra("forum_title")
        val forumDescription = intent.getStringExtra("forum_description")

        // Set forum title and description
        forumTitleTextView.text = forumTitle
        forumDescriptionTextView.text = forumDescription

        // 7. Initialize Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        threadApiService = retrofit.create(ThreadApiService::class.java) // Use ThreadApiService

        // 8. Initialize adapter
        threadsAdapter = ThreadsAdapter(threadsList,
            onThreadClickListener = { thread ->
                // Start ThreadDetailActivity
                val intent = Intent(this, ThreadDetailActivity::class.java)
                intent.putExtra("thread_id", thread.id)
                intent.putExtra("thread_title", thread.title)
                intent.putExtra("thread_content", thread.content)
                intent.putExtra("thread_author", thread.createdBy.name)
                intent.putExtra("thread_created_at", thread.createdAt)
                startActivity(intent)
            })
        threadsRecyclerView.adapter = threadsAdapter

        // 9. Load initial threads
        loadThreads()

        // 10. Set button listeners for pagination
        threadlistnextButton.setOnClickListener {
            currentPage++
            loadThreads()
            threadlistprevButton.isEnabled = true
        }

        threadlistprevButton.setOnClickListener {
            currentPage--
            loadThreads()
            if (currentPage == 0) {
                threadlistprevButton.isEnabled = false
            }
        }

        // 11. New Thread Button Listener
        newThreadButton.setOnClickListener {
            //start activity for creating new thread
            val intent = Intent(this, CreateThreadActivity::class.java)
            intent.putExtra("forum_id", forumId)
            startActivity(intent)
        }

    }

    private fun loadThreads() {
        if (forumId == -1L) {
            Toast.makeText(this, "Invalid Forum ID", Toast.LENGTH_LONG).show()
            return
        }

        val call = threadApiService.getThreadsByForumId(forumId, currentPage, 10) // 10 is page size
        call.enqueue(object : Callback<PagedResponseDto<ThreadDto>> {  // Use PagedResponseDto
            override fun onResponse(
                call: Call<PagedResponseDto<ThreadDto>>,
                response: Response<PagedResponseDto<ThreadDto>>
            ) {
                if (response.isSuccessful) {
                    val pagedResponse = response.body() ?: return  // Handle null body
                    val newThreads = pagedResponse.content ?: emptyList() // Get the list of threads
                    Log.d("ThreadListActivity", "Retrieved ${newThreads.size} threads")
                    threadsAdapter.clearThreads()
                    threadsAdapter.addThreads(newThreads)
                    isLastPage = pagedResponse.last // Get last from response
                    threadlistnextButton.isEnabled = !isLastPage
                    threadlistprevButton.isEnabled = currentPage > 0

                    // Initialize and set adapter for pagination RecyclerView
                    paginationAdapter = PaginationAdapter(
                        totalPages = pagedResponse.totalPages,
                        currentPage = pagedResponse.page,
                    ) { page ->
                        currentPage = page - 1
                        loadThreads()
                        threadlistprevButton.isEnabled = currentPage > 0
                    }
                    pageNumberRecyclerView.adapter = paginationAdapter

                } else {
                    Log.e(
                        "ThreadListActivity",
                        "Failed to load threads: ${response.code()}, ${
                            response.errorBody()?.string()
                        }"
                    )
                    Toast.makeText(
                        this@ThreadListActivity,
                        "Failed to load threads",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }

            override fun onFailure(call: Call<PagedResponseDto<ThreadDto>>, t: Throwable) {  // Use PagedResponseDto
                Log.e("ThreadListActivity", "Network error: ${t.message}")
                Toast.makeText(this@ThreadListActivity, "Network Error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }
}