package com.unsam.scholarium

import io.github.cdimascio.dotenv.dotenv
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ScholariumApplication

fun main(args: Array<String>) {
    val dotenv = dotenv {
        ignoreIfMalformed = true
        ignoreIfMissing = true
    }

    // Esto carga las variables del .env a las propiedades del sistema
    dotenv.entries().forEach { entry ->
        System.setProperty(entry.key, entry.value)
    }

    runApplication<ScholariumApplication>(*args)
}