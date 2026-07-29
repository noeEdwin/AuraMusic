package com.auramusic.backend.live;

import com.auramusic.backend.domain.entity.BandMember;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.UserRepository;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LiveSessionService {

    private final ConcurrentMap<Long, LiveSessionState> sessions = new ConcurrentHashMap<>();
    private final UserRepository userRepository;
    private final BandMemberRepository bandMemberRepository;

    public LiveSessionService(UserRepository userRepository, BandMemberRepository bandMemberRepository) {
        this.userRepository = userRepository;
        this.bandMemberRepository = bandMemberRepository;
    }

    @Transactional(readOnly = true)
    public synchronized LiveSessionState handle(Long bandId, LiveSessionCommand command, String email) {
        BandMember member = findMember(bandId, email);
        String type = normalizeType(command.type());

        if ("SYNC_REQUEST".equals(type)) {
            return sessions.getOrDefault(bandId, LiveSessionState.inactive(bandId));
        }

        if ("START_SESSION".equals(type)) {
            LiveSessionState current = sessions.get(bandId);
            if (current != null && current.active()) {
                return current;
            }
            LiveSessionState state = new LiveSessionState(
                    bandId,
                    true,
                    command.setlistId(),
                    command.activeItemId(),
                    false,
                    0,
                    Instant.now()
            );
            sessions.put(bandId, state);
            return state;
        }

        LiveSessionState current = sessions.get(bandId);
        if ("CLOSE_SESSION".equals(type)) {
            LiveSessionState closed = current == null
                    ? LiveSessionState.inactive(bandId)
                    : new LiveSessionState(bandId, false, current.setlistId(), current.activeItemId(), false,
                    current.positionSeconds(), Instant.now());
            sessions.remove(bandId);
            return closed;
        }

        if (current == null || !current.active()) {
            throw new MessagingException("La sesion de la banda no esta activa");
        }

        return switch (type) {
            case "PLAY" -> update(current, true, current.activeItemId(), current.positionSeconds());
            case "PAUSE" -> update(current, false, current.activeItemId(), current.positionSeconds());
            case "CHANGE_SONG" -> update(current, current.playing(), requireValue(command.activeItemId(), "activeItemId"), 0);
            case "SEEK" -> update(current, current.playing(), current.activeItemId(), requirePosition(command.positionSeconds()));
            default -> throw new MessagingException("Comando WebSocket no soportado: " + type);
        };
    }

    private LiveSessionState update(LiveSessionState current, boolean playing, Long activeItemId, int positionSeconds) {
        LiveSessionState updated = new LiveSessionState(
                current.bandId(),
                true,
                current.setlistId(),
                activeItemId,
                playing,
                positionSeconds,
                Instant.now()
        );
        sessions.put(current.bandId(), updated);
        return updated;
    }

    private BandMember findMember(Long bandId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MessagingException("Usuario no encontrado"));
        return bandMemberRepository.findByBandIdAndUserId(bandId, user.getId())
                .orElseThrow(() -> new MessagingException("El usuario no pertenece a la banda"));
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            throw new MessagingException("El comando WebSocket requiere type");
        }
        return type.trim().toUpperCase(Locale.ROOT);
    }

    private Long requireValue(Long value, String field) {
        if (value == null) {
            throw new MessagingException("El comando requiere " + field);
        }
        return value;
    }

    private int requirePosition(Integer position) {
        if (position == null || position < 0) {
            throw new MessagingException("positionSeconds debe ser mayor o igual a cero");
        }
        return position;
    }
}
