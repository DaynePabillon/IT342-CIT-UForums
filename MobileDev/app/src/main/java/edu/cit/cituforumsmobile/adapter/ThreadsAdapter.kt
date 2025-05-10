package edu.cit.cituforumsmobile.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import edu.cit.cituforumsmobile.R
import edu.cit.cituforumsmobile.api.dto.ThreadDto

// 10. Adapter for RecyclerView
class ThreadsAdapter(
    private val threads: MutableList<ThreadDto>,
    private val onThreadClickListener: (ThreadDto) -> Unit
) : RecyclerView.Adapter<ThreadsAdapter.ThreadViewHolder>() {

    class ThreadViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val titleTextView: TextView = itemView.findViewById(R.id.thread_item_title)  // Use the ID from thread_item.xml
        val authorTextView: TextView = itemView.findViewById(R.id.thread_item_author)
        val contentTextView: TextView = itemView.findViewById(R.id.thread_item_content)
        val createdAtTextView: TextView = itemView.findViewById(R.id.thread_item_created_at)
        val cardView: MaterialCardView = itemView.findViewById(R.id.thread_item_card)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ThreadViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.thread_item, parent, false) //  Create this layout
        return ThreadViewHolder(view)
    }

    override fun onBindViewHolder(holder: ThreadViewHolder, position: Int) {
        val thread = threads[position]
        holder.titleTextView.text = thread.title
        holder.authorTextView.text = "By ${thread.createdBy.name}"
        holder.contentTextView.text = thread.content
        holder.createdAtTextView.text = "Posted on: ${thread.createdAt}"

        holder.cardView.setOnClickListener {
            onThreadClickListener.invoke(thread)
        }
    }

    override fun getItemCount(): Int = threads.size

    fun addThreads(newThreads: List<ThreadDto>) {
        val initialSize = threads.size
        threads.addAll(newThreads)
        notifyItemRangeInserted(initialSize, newThreads.size)
    }

    fun clearThreads(){
        threads.clear()
        notifyDataSetChanged()
    }
}