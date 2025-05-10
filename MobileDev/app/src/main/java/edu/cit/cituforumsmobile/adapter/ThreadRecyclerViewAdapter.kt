package edu.cit.cituforumsmobile.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.R
import edu.cit.cituforumsmobile.data.ForumThread

class ThreadRecyclerViewAdapter(private val listOfThreads: List<ForumThread>)
    : RecyclerView.Adapter<ThreadRecyclerViewAdapter.ItemViewHolder>() {

    class ItemViewHolder(view: View) : RecyclerView.ViewHolder(view) {
//        val threadTitle = view.findViewById<TextView>(R.id.threa)
        val commentUsername = view.findViewById<TextView>(R.id.commentbox_username)
        val commentDate = view.findViewById<TextView>(R.id.commentbox_date)
        val commentMessage = view.findViewById<TextView>(R.id.commentbox_message)
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ItemViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.forum_box, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(
        holder: ItemViewHolder,
        position: Int
    ){
        val item = listOfThreads[position]

//        holder.commentPicture.setImageResource(item.commentPicture)
//        holder.commentUsername.setText(item.commentUsername)
//        holder.commentDate.setText(item.commentDate)
//        holder.commentMessage.setText(item.commentMessage)
    }

    override fun getItemCount(): Int {
        return listOfThreads.size
    }
}