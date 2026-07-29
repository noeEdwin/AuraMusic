package com.auramusic.backend.notification;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class TwilioSmsClient {

    private final RestClient restClient;

    public TwilioSmsClient() {
        this(RestClient.builder().baseUrl("https://api.twilio.com").build());
    }

    TwilioSmsClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public void send(String accountSid, String authToken, String from, String to, String body) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("From", from);
        form.add("To", to);
        form.add("Body", body);

        restClient.post()
                .uri("/2010-04-01/Accounts/{accountSid}/Messages.json", accountSid)
                .headers(headers -> headers.setBasicAuth(accountSid, authToken))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .toBodilessEntity();
    }
}
