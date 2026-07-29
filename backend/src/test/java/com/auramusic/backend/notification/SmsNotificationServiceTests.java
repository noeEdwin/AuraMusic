package com.auramusic.backend.notification;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.auramusic.backend.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;

@ExtendWith(MockitoExtension.class)
class SmsNotificationServiceTests {

    @Mock
    private TwilioSmsClient twilioSmsClient;

    @Test
    void sendsWelcomeSmsWhenEnabled() {
        SmsNotificationService service = service(true);

        service.sendWelcome(user("+529518695421"));

        verify(twilioSmsClient).send(
                "AC_test",
                "token",
                "+15551234567",
                "+529518695421",
                "AuraMusic: Bienvenido, Test User. Tu cuenta fue creada correctamente."
        );
    }

    @Test
    void doesNotSendWhenDisabled() {
        SmsNotificationService service = service(false);

        service.sendWelcome(user("+529518695421"));

        verifyNoInteractions(twilioSmsClient);
    }

    @Test
    void ignoresTwilioFailures() {
        SmsNotificationService service = service(true);
        doThrow(new RestClientException("twilio unavailable"))
                .when(twilioSmsClient)
                .send(
                        "AC_test",
                        "token",
                        "+15551234567",
                        "+529518695421",
                        "AuraMusic: Bienvenido, Test User. Tu cuenta fue creada correctamente."
                );

        service.sendWelcome(user("+529518695421"));

        verify(twilioSmsClient).send(
                "AC_test",
                "token",
                "+15551234567",
                "+529518695421",
                "AuraMusic: Bienvenido, Test User. Tu cuenta fue creada correctamente."
        );
    }

    private SmsNotificationService service(boolean enabled) {
        return new SmsNotificationService(
                twilioSmsClient,
                enabled,
                "AC_test",
                "token",
                "+15551234567"
        );
    }

    private User user(String phone) {
        User user = new User();
        user.setDisplayName("Test User");
        user.setPhone(phone);
        return user;
    }
}
