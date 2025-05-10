package edu.cit.cituforumsmobile.adapter

import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.components.ForumItemView
import edu.cit.cituforumsmobile.api.dto.ForumDto

class ForumsAdapter(
    private val forums: MutableList<ForumDto>,
    private val onForumClickListener: (ForumDto) -> Unit,
    private val onLoadMoreListener: () -> Unit
) : RecyclerView.Adapter<ForumsAdapter.ForumViewHolder>() {

    //  flag to indicate if more data is being loaded
    var isLoading = false
    // The current page number
    var pageNumber = 0
    // Number of items per page
    val pageSize = 10

    // Flag to indicate if all data has been loaded
    private var isLastPage = false

    class ForumViewHolder(itemView: ForumItemView) : RecyclerView.ViewHolder(itemView) {
        val forumItemView = itemView
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ForumViewHolder {
        //  Inflate the custom view
        val forumItemView = ForumItemView(parent.context)
        return ForumViewHolder(forumItemView)
    }

    override fun onBindViewHolder(holder: ForumViewHolder, position: Int) {
        val forum = forums[position]
        holder.forumItemView.bindData(forum, onForumClickListener)

        // Load more data when reaching the end of the list AND not the last page AND not already loading
        if (position == forums.size - 1 && !isLoading && !isLastPage) {
            isLoading = true
            pageNumber++
            onLoadMoreListener()
        }
    }

    override fun getItemCount(): Int = forums.size

    // Add new forums to the list and notify the adapter
    fun addForums(newForums: List<ForumDto>, isLastPage: Boolean = false) { // Added isLastPage parameter
        val initialSize = forums.size
        forums.addAll(newForums)
        notifyItemRangeInserted(initialSize, newForums.size)
        isLoading = false
        this.isLastPage = isLastPage // Update the flag
    }

    fun clearForums() {
        forums.clear()
        notifyDataSetChanged()
        pageNumber = 0
        isLastPage = false; // Reset
    }
}