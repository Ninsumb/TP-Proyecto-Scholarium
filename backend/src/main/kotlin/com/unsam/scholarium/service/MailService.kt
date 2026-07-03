package com.unsam.scholarium.service

import jakarta.mail.internet.MimeMessage
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class MailService(
    private val mailSender: JavaMailSender
) {
    fun send(to: String, subject: String, body: String, isHtml: Boolean = false) {
        if (isHtml) {
            val message: MimeMessage = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")
            
            helper.setTo(to)
            helper.setSubject(subject)
            helper.setText(body, true) 
            
            mailSender.send(message)
        } else {
            val message = SimpleMailMessage()

            message.setTo(to)
            message.subject = subject
            message.text = body

            mailSender.send(message)
        }
    }
}