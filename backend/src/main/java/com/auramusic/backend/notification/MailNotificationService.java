package com.auramusic.backend.notification;

import com.auramusic.backend.domain.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(MailNotificationService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;
    private final String frontendBaseUrl;

    public MailNotificationService(
            JavaMailSender mailSender,
            @Value("${auramusic.mail.enabled:true}") boolean enabled,
            @Value("${auramusic.mail.from:no-reply@auramusic.lat}") String from,
            @Value("${auramusic.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
        this.frontendBaseUrl = frontendBaseUrl.replaceAll("/$", "");
    }

    public void sendWelcome(User user) {
        send(
                user.getEmail(),
                "Bienvenido a AuraMusic",
                "Hola " + user.getDisplayName() + ",\n\n"
                        + "Tu cuenta de AuraMusic fue creada correctamente.\n"
                        + "Ya puedes iniciar sesion y administrar tus canciones, artistas y bandas.\n\n"
                        + "Ingresa en: " + frontendBaseUrl + "/login\n\n"
                        + "Equipo AuraMusic"
        );
    }

    public void sendPasswordReset(User user, String token, long expirationMinutes) {
        send(
                user.getEmail(),
                "Restablece tu contrasena de AuraMusic",
                "Hola " + user.getDisplayName() + ",\n\n"
                        + "Recibimos una solicitud para restablecer tu contrasena.\n"
                        + "Usa este token dentro de los proximos " + expirationMinutes + " minutos:\n\n"
                        + token + "\n\n"
                        + "Tambien puedes abrir este enlace:\n"
                        + frontendBaseUrl + "/reset-password?token=" + token + "\n\n"
                        + "Si no solicitaste este cambio, ignora este correo.\n\n"
                        + "Equipo AuraMusic"
        );
    }

    private void send(String recipient, String subject, String text) {
        if (!enabled) {
            log.debug("Correo deshabilitado para el entorno actual");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.warn("No fue posible enviar el correo de notificacion", exception);
        }
    }
}
