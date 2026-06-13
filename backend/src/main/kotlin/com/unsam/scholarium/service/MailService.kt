package com.unsam.scholarium.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class MailService(
    private val mailSender: JavaMailSender
) {
    fun send(to: String, subject: String, body: String) {

        val message = SimpleMailMessage()

        message.setTo(to)
        message.subject = subject
        message.text = body

        mailSender.send(message)
    }
}