package edu.cit.cituforumsmobile.components

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import android.widget.TextView
import com.google.android.material.card.MaterialCardView
import edu.cit.cituforumsmobile.R
import edu.cit.cituforumsmobile.api.dto.ForumDto

class ForumItemView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val cardView: MaterialCardView
    private val titleTextView: TextView
    private val descriptionTextView: TextView
    private val categoryTextView: TextView
    private val postCountTextView: TextView

    init {
        // Inflate the layout
        LayoutInflater.from(context).inflate(R.layout.forum_item_view, this, true)

        // Get references to the views
        cardView = findViewById(R.id.forum_item_card)
        titleTextView = findViewById(R.id.forum_item_title)
        descriptionTextView = findViewById(R.id.forum_item_description)
        categoryTextView = findViewById(R.id.forum_item_category)
        postCountTextView = findViewById(R.id.forum_item_post_count)

        // Set orientation (important for a custom view extending LinearLayout)
        orientation = VERTICAL
    }

    // Method to bind data to the view
    fun bindData(forum: ForumDto, onForumClickListener: (ForumDto) -> Unit) {
        titleTextView.text = forum.title
        descriptionTextView.text = forum.description
        categoryTextView.text = forum.categoryName
        postCountTextView.text = "${forum.postCount} Posts"

        // Set the background color for the category badge.
        // You might want to define a color mapping based on the category name.
        val categoryColor = getCategoryColor(forum.categoryName)  // Implement this
        categoryTextView.setBackgroundColor(categoryColor)

        // Set click listener on the entire card
        cardView.setOnClickListener {
            onForumClickListener.invoke(forum)
        }
    }

    private fun getCategoryColor(categoryName: String): Int {
        //  Implement a mapping between category names and colors.
        return when (categoryName.lowercase()) {
            "general" -> resources.getColor(R.color.category_color, context.theme)  // Define in colors.xml
            "help" -> resources.getColor(R.color.category_color, context.theme)
            "news" -> resources.getColor(R.color.category_color, context.theme)
            else -> resources.getColor(R.color.category_color, context.theme) // Default color
        }
    }
}