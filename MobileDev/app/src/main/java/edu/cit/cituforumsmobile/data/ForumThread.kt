package edu.cit.cituforumsmobile.data

data class ForumThread (
    var threadTitle: String = "",
    var threadContent: String = "",
    var threadUser: String = "",
    var threadCommentAmount: Int = 0,
    var threadDate: String = "",
)