package com.unsam.scholarium.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

// 400 - Bad Request
@ResponseStatus(HttpStatus.BAD_REQUEST)
class BusinessException(message: String) : RuntimeException(message)

// 403 - Forbidden
@ResponseStatus(HttpStatus.FORBIDDEN)
class NotAdminException(message: String) : RuntimeException(message)

// 404 - Not Found
@ResponseStatus(HttpStatus.NOT_FOUND)
class ElementDoesNotExistException(message: String) : RuntimeException(message)