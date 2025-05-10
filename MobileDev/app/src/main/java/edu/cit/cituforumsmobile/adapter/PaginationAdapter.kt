package edu.cit.cituforumsmobile.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.cituforumsmobile.R

// New Adapter for displaying page numbers
class PaginationAdapter(
    private val totalPages: Int,
    private val currentPage: Int,
    private val onPageSelected: (Int) -> Unit
) : RecyclerView.Adapter<PaginationAdapter.PageViewHolder>() {

    class PageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val pageNumberTextView: TextView = itemView.findViewById(R.id.pageNumberTextView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PageViewHolder {
        val itemView = LayoutInflater.from(parent.context)
            .inflate(R.layout.page_number_item, parent, false) // Create item_page_number.xml
        return PageViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: PageViewHolder, position: Int) {
        val pageNumber = position + 1
        holder.pageNumberTextView.text = pageNumber.toString()

        if (position == currentPage) {
            holder.pageNumberTextView.setBackgroundResource(R.color.selected_page_number_color) //  selected_page_color
        } else {
            holder.pageNumberTextView.setBackgroundResource(android.R.color.transparent)
        }

        holder.pageNumberTextView.setOnClickListener {
            onPageSelected(pageNumber)
        }
    }

    override fun getItemCount() = totalPages
}