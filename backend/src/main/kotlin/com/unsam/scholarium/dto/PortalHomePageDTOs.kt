package com.unsam.scholarium.dto

import com.unsam.scholarium.model.Block

data class BlocksResponse(
    val blocks: List<Block>,
    val error: String? = null
)

data class UpdateBlocksRequest(
    val blocks: List<Block>
)