package edu.cit.cituforumsmobile.data

import edu.cit.cituforumsmobile.R

data class Comment (
    var commentPicture: Int,
    var commentUsername: String = "",
    var commentDate: String = "",
    var commentMessage: String = "",
)