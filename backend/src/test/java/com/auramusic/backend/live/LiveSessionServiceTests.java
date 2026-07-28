package com.auramusic.backend.live;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.auramusic.backend.domain.entity.BandMember;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.MessagingException;

@ExtendWith(MockitoExtension.class)
class LiveSessionServiceTests {

    private static final Long BAND_ID = 7L;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BandMemberRepository bandMemberRepository;

    private LiveSessionService service;

    @BeforeEach
    void setUp() {
        service = new LiveSessionService(userRepository, bandMemberRepository);
    }

    @Test
    void leaderCanStartAndUpdateSession() {
        User leader = user(11L, "leader@auramusic.local");
        when(userRepository.findByEmail(leader.getEmail())).thenReturn(Optional.of(leader));
        when(bandMemberRepository.findByBandIdAndUserId(BAND_ID, leader.getId()))
                .thenReturn(Optional.of(member("LEADER")));

        LiveSessionState started = service.handle(
                BAND_ID,
                new LiveSessionCommand("START_SESSION", 4L, 12L, null),
                leader.getEmail()
        );
        LiveSessionState playing = service.handle(
                BAND_ID,
                new LiveSessionCommand("PLAY", null, null, null),
                leader.getEmail()
        );

        assertTrue(started.active());
        assertEquals(4L, started.setlistId());
        assertEquals(12L, started.activeItemId());
        assertTrue(playing.playing());
    }

    @Test
    void memberCanSynchronizeButCannotChangeSession() {
        User leader = user(11L, "leader@auramusic.local");
        User member = user(12L, "member@auramusic.local");
        when(userRepository.findByEmail(leader.getEmail())).thenReturn(Optional.of(leader));
        when(userRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(bandMemberRepository.findByBandIdAndUserId(BAND_ID, leader.getId()))
                .thenReturn(Optional.of(member("LEADER")));
        when(bandMemberRepository.findByBandIdAndUserId(BAND_ID, member.getId()))
                .thenReturn(Optional.of(member("MEMBER")));

        service.handle(BAND_ID, new LiveSessionCommand("START_SESSION", 4L, 12L, null), leader.getEmail());
        LiveSessionState synchronizedState = service.handle(
                BAND_ID,
                new LiveSessionCommand("SYNC_REQUEST", null, null, null),
                member.getEmail()
        );

        assertTrue(synchronizedState.active());
        assertThrows(MessagingException.class, () -> service.handle(
                BAND_ID,
                new LiveSessionCommand("PAUSE", null, null, null),
                member.getEmail()
        ));
    }

    @Test
    void userOutsideBandCannotJoinSession() {
        User user = user(13L, "outsider@auramusic.local");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(bandMemberRepository.findByBandIdAndUserId(BAND_ID, user.getId())).thenReturn(Optional.empty());

        assertThrows(MessagingException.class, () -> service.handle(
                BAND_ID,
                new LiveSessionCommand("SYNC_REQUEST", null, null, null),
                user.getEmail()
        ));
    }

    @Test
    void closingSessionBroadcastsInactiveStateAndRemovesIt() {
        User leader = user(11L, "leader@auramusic.local");
        when(userRepository.findByEmail(leader.getEmail())).thenReturn(Optional.of(leader));
        when(bandMemberRepository.findByBandIdAndUserId(BAND_ID, leader.getId()))
                .thenReturn(Optional.of(member("LEADER")));

        service.handle(BAND_ID, new LiveSessionCommand("START_SESSION", 4L, 12L, null), leader.getEmail());
        LiveSessionState closed = service.handle(
                BAND_ID,
                new LiveSessionCommand("CLOSE_SESSION", null, null, null),
                leader.getEmail()
        );
        LiveSessionState afterClose = service.handle(
                BAND_ID,
                new LiveSessionCommand("SYNC_REQUEST", null, null, null),
                leader.getEmail()
        );

        assertFalse(closed.active());
        assertFalse(afterClose.active());
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private BandMember member(String role) {
        BandMember member = new BandMember();
        member.setMemberRole(role);
        return member;
    }
}
