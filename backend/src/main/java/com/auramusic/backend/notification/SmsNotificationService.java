package com.auramusic.backend.notification;

import com.auramusic.backend.domain.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

@Service
public class SmsNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SmsNotificationService.class);

    private final TwilioSmsClient twilioSmsClient;
    private final boolean enabled;
    private final String accountSid;
    private final String authToken;
    private final String from;

    public SmsNotificationService(
            TwilioSmsClient twilioSmsClient,
            @Value("${auramusic.sms.enabled:false}") boolean enabled,
            @Value("${auramusic.sms.twilio.account-sid:}") String accountSid,
            @Value("${auramusic.sms.twilio.auth-token:}") String authToken,
            @Value("${auramusic.sms.twilio.from:}") String from
    ) {
        this.twilioSmsClient = twilioSmsClient;
        this.enabled = enabled;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
    }

    public void sendWelcome(User user) {
        if (!enabled) {
            log.debug("SMS deshabilitado para el entorno actual");
            return;
        }
        if (isBlank(accountSid) || isBlank(authToken) || isBlank(from) || isBlank(user.getPhone())) {
            log.warn("SMS habilitado, pero falta configuracion de Twilio o telefono del usuario");
            return;
        }

        try {
            twilioSmsClient.send(
                    accountSid,
                    authToken,
                    from,
                    user.getPhone(),
                    "AuraMusic: Bienvenido, " + user.getDisplayName() + ". Tu cuenta fue creada correctamente."
            );
        } catch (RestClientException | IllegalArgumentException exception) {
            log.warn("No fue posible enviar el SMS de bienvenida: {}", exception.getMessage());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
