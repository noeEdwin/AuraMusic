package com.auramusic.backend.live;

import java.security.Principal;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class LiveSessionController {

    private final LiveSessionService liveSessionService;
    private final SimpMessagingTemplate messagingTemplate;

    public LiveSessionController(
            LiveSessionService liveSessionService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.liveSessionService = liveSessionService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/bands/{bandId}/command")
    public void handleCommand(
            @DestinationVariable Long bandId,
            LiveSessionCommand command,
            Principal principal
    ) {
        if (principal == null) {
            throw new IllegalStateException("La conexion WebSocket no esta autenticada");
        }
        LiveSessionState state = liveSessionService.handle(bandId, command, principal.getName());
        messagingTemplate.convertAndSend("/topic/bands/" + bandId + "/state", state);
    }
}
