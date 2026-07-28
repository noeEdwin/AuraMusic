package com.auramusic.backend.live;

import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.RevokedTokenRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.CustomUserDetailsService;
import com.auramusic.backend.security.JwtService;
import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class StompJwtInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Pattern BAND_STATE_DESTINATION = Pattern.compile("^/topic/bands/(\\d+)/state$");

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RevokedTokenRepository revokedTokenRepository;
    private final UserRepository userRepository;
    private final BandMemberRepository bandMemberRepository;

    public StompJwtInterceptor(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            RevokedTokenRepository revokedTokenRepository,
            UserRepository userRepository,
            BandMemberRepository bandMemberRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.revokedTokenRepository = revokedTokenRepository;
        this.userRepository = userRepository;
        this.bandMemberRepository = bandMemberRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            accessor.setUser(authenticate(accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION)));
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            requireBandMember(accessor.getUser(), accessor.getDestination());
        } else if (StompCommand.SEND.equals(command)) {
            if (accessor.getUser() == null) {
                throw new MessagingException("La conexion WebSocket no esta autenticada");
            }
        }

        return message;
    }

    private Authentication authenticate(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new MessagingException("Se requiere un token JWT para la conexion WebSocket");
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (token.isBlank()
                || !jwtService.isValid(token)
                || revokedTokenRepository.existsByTokenHash(jwtService.hashToken(token))) {
            throw new MessagingException("El token JWT no es valido");
        }

        String email = jwtService.extractEmail(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    private void requireBandMember(Principal principal, String destination) {
        if (principal == null) {
            throw new MessagingException("La conexion WebSocket no esta autenticada");
        }

        Matcher matcher = destination == null ? null : BAND_STATE_DESTINATION.matcher(destination);
        if (matcher == null || !matcher.matches()) {
            throw new MessagingException("Destino WebSocket no permitido");
        }

        Long bandId = Long.valueOf(matcher.group(1));
        Long userId = userRepository.findByEmail(principal.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new MessagingException("Usuario no encontrado"));
        if (!bandMemberRepository.existsByBandIdAndUserId(bandId, userId)) {
            throw new MessagingException("El usuario no pertenece a la banda");
        }
    }
}
