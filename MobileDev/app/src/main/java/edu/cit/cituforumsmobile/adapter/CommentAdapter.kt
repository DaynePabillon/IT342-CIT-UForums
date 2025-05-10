package edu.cit.cituforumsmobile.adapter

import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.R
import edu.cit.cituforumsmobile.api.dto.CommentDto

// 3. RecyclerView Adapter for Comments
class CommentAdapter(private val comments: MutableList<CommentDto>) :
    RecyclerView.Adapter<CommentAdapter.CommentViewHolder>() {

    class CommentViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        val authorNameTextView: TextView = itemView.findViewById(R.id.commentAuthorNameTextView)
        val commentTextTextView: TextView = itemView.findViewById(R.id.commentTextTextView)
        val createdDateTextView: TextView = itemView.findViewById(R.id.commentDateTextView)
    }

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): CommentViewHolder {
        val itemView = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.comment_item, parent, false) // Use a layout file
        return CommentViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: CommentViewHolder, position: Int) {
        val comment = comments[position]
        holder.authorNameTextView.text = "Author: ${comment.author.name}"
        holder.commentTextTextView.text = comment.content
        holder.createdDateTextView.text = "Date: ${comment.createdAt}"
    }

    override fun getItemCount() = comments.size

    fun addComments(newComments: List<CommentDto>) {
        comments.addAll(newComments)
        notifyDataSetChanged()
    }

    fun clearComments() {
        comments.clear()
        notifyDataSetChanged()
    }
}