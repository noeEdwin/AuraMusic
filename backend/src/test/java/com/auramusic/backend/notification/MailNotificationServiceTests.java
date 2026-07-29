package com.auramusic.backend.notification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.auramusic.backend.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class MailNotificationServiceTests {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void sendsWelcomeEmailFromConfiguredAddress() {
        MailNotificationService service = new MailNotificationService(
                mailSender,
                true,
                "no-reply@auramusic.lat",
                "http://localhost:5173"
        );
        User user = user("musician@auramusic.local", "Musician");

        service.sendWelcome(user);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertEquals("no-reply@auramusic.lat", message.getFrom());
        assertEquals("musician@auramusic.local", message.getTo()[0]);
        assertEquals("Bienvenido a AuraMusic", message.getSubject());
    }

    @Test
    void doesNotSendWhenMailIsDisabled() {
        MailNotificationService service = new MailNotificationService(
                mailSender,
                false,
                "no-reply@auramusic.lat",
                "http://localhost:5173"
        );

        service.sendWelcome(user("musician@auramusic.local", "Musician"));

        verifyNoInteractions(mailSender);
    }

    private User user(String email, String displayName) {
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(displayName);
        return user;
    }
}
