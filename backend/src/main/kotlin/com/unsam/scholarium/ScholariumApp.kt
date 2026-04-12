package com.unsam.scholarium

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ScholariumApplication

fun main(args: Array<String>) {
    runApplication<ScholariumApplication>(*args)
}