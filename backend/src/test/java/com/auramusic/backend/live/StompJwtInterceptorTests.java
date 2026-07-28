package com.auramusic.backend.live;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.RevokedTokenRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.CustomUserDetailsService;
import com.auramusic.backend.security.JwtService;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

@ExtendWith(MockitoExtension.class)
class StompJwtInterceptorTests {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private RevokedTokenRepository revokedTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BandMemberRepository bandMemberRepository;

    @Mock
    private MessageChannel channel;

    private StompJwtInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new StompJwtInterceptor(
                jwtService,
                userDetailsService,
                revokedTokenRepository,
                userRepository,
                bandMemberRepository
        );
    }

    @Test
    void authenticatesConnectWithValidJwt() {
        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername("leader@auramusic.local")
                .password("ignored")
                .authorities("ROLE_MUSICIAN")
                .build();
        when(jwtService.isValid("valid-token")).thenReturn(true);
        when(jwtService.extractEmail("valid-token")).thenReturn(details.getUsername());
        when(jwtService.hashToken("valid-token")).thenReturn("hash");
        when(revokedTokenRepository.existsByTokenHash("hash")).thenReturn(false);
        when(userDetailsService.loadUserByUsername(details.getUsername())).thenReturn(details);

        AtomicReference<java.security.Principal> sessionUser = new AtomicReference<>();
        Message<?> result = interceptor.preSend(connect("Bearer valid-token", sessionUser), channel);

        assertNotNull(StompHeaderAccessor.wrap(result).getUser());
        assertNotNull(sessionUser.get());
    }

    @Test
    void rejectsConnectWithoutJwt() {
        assertThrows(MessagingException.class, () -> interceptor.preSend(connect(null, new AtomicReference<>()), channel));
    }

    @Test
    void rejectsSubscriptionForNonMember() {
        User user = new User();
        user.setId(19L);
        user.setEmail("outsider@auramusic.local");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(bandMemberRepository.existsByBandIdAndUserId(7L, user.getId())).thenReturn(false);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/bands/7/state");
        accessor.setUser(new UsernamePasswordAuthenticationToken(user.getEmail(), null));
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(MessagingException.class, () -> interceptor.preSend(message, channel));
    }

    private Message<byte[]> connect(String authorization, AtomicReference<java.security.Principal> sessionUser) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        if (authorization != null) {
            accessor.addNativeHeader(HttpHeaders.AUTHORIZATION, authorization);
        }
        accessor.setUserChangeCallback(sessionUser::set);
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
