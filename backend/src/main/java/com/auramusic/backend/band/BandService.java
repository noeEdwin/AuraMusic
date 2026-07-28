package com.auramusic.backend.band;

import com.auramusic.backend.band.dto.AddBandMemberRequest;
import com.auramusic.backend.band.dto.BandMemberResponse;
import com.auramusic.backend.band.dto.BandResponse;
import com.auramusic.backend.band.dto.CreateBandRequest;
import com.auramusic.backend.band.dto.JoinBandRequest;
import com.auramusic.backend.band.dto.UpdateBandMemberRequest;
import com.auramusic.backend.band.dto.UpdateBandRequest;
import com.auramusic.backend.domain.entity.Band;
import com.auramusic.backend.domain.entity.BandMember;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.BandRepository;
import com.auramusic.backend.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BandService {

    private static final String ADMIN = "ADMIN";
    private static final String LEADER = "LEADER";
    private static final String MEMBER = "MEMBER";
    private static final String MUSICIAN = "MUSICIAN";

    private final BandRepository bandRepository;
    private final BandMemberRepository bandMemberRepository;
    private final UserRepository userRepository;
    private final BandInviteCodeGenerator inviteCodeGenerator;

    public BandService(
            BandRepository bandRepository,
            BandMemberRepository bandMemberRepository,
            UserRepository userRepository,
            BandInviteCodeGenerator inviteCodeGenerator
    ) {
        this.bandRepository = bandRepository;
        this.bandMemberRepository = bandMemberRepository;
        this.userRepository = userRepository;
        this.inviteCodeGenerator = inviteCodeGenerator;
    }

    @Transactional(readOnly = true)
    public List<BandResponse> listUserBands(String email) {
        User user = findUser(email);
        if (isAdmin(user)) {
            return bandRepository.findAll().stream().map(this::toResponse).toList();
        }

        return bandMemberRepository.findByUserId(user.getId()).stream()
                .map(BandMember::getBand)
                .distinct()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BandResponse getBand(Long bandId, String email) {
        User user = findUser(email);
        Band band = findBand(bandId);
        assertCanView(band, user);
        return toResponse(band);
    }

    @Transactional
    public BandResponse create(CreateBandRequest request, String email) {
        User leader = findUser(email);
        if (!isAdmin(leader) && (leader.getRole() == null || !MUSICIAN.equals(leader.getRole().getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un musico puede crear una banda");
        }
        Band band = new Band();
        band.setLeader(leader);
        band.setName(request.name().trim());
        band.setDescription(normalize(request.description()));
        band.setInviteCode(inviteCodeGenerator.generate());
        Band savedBand = bandRepository.save(band);

        BandMember leaderMember = new BandMember();
        leaderMember.setBand(savedBand);
        leaderMember.setUser(leader);
        leaderMember.setInstrument(request.instrument().trim());
        leaderMember.setMemberRole(LEADER);
        bandMemberRepository.save(leaderMember);
        return toResponse(savedBand);
    }

    @Transactional
    public BandResponse update(Long bandId, UpdateBandRequest request, String email) {
        User user = findUser(email);
        Band band = findBand(bandId);
        assertCanManage(band, user);
        band.setName(request.name().trim());
        band.setDescription(normalize(request.description()));
        return toResponse(bandRepository.save(band));
    }

    @Transactional
    public void delete(Long bandId, String email) {
        User user = findUser(email);
        Band band = findBand(bandId);
        assertCanManage(band, user);
        bandRepository.delete(band);
    }

    @Transactional(readOnly = true)
    public List<BandMemberResponse> listMembers(Long bandId, String email) {
        User user = findUser(email);
        Band band = findBand(bandId);
        assertCanView(band, user);
        return bandMemberRepository.findByBandId(bandId).stream().map(BandMemberResponse::from).toList();
    }

    @Transactional
    public BandMemberResponse addMember(Long bandId, AddBandMemberRequest request, String email) {
        User requester = findUser(email);
        Band band = findBand(bandId);
        assertCanManage(band, requester);
        User user = findUserByEmail(request.userEmail());
        assertNotMember(bandId, user.getId());

        BandMember member = new BandMember();
        member.setBand(band);
        member.setUser(user);
        member.setInstrument(request.instrument().trim());
        member.setMemberRole(MEMBER);
        return BandMemberResponse.from(bandMemberRepository.save(member));
    }

    @Transactional
    public BandMemberResponse join(JoinBandRequest request, String email) {
        User user = findUser(email);
        Band band = bandRepository.findByInviteCode(request.inviteCode().trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Codigo de invitacion no encontrado"));
        assertNotMember(band.getId(), user.getId());

        BandMember member = new BandMember();
        member.setBand(band);
        member.setUser(user);
        member.setInstrument(request.instrument().trim());
        member.setMemberRole(MEMBER);
        return BandMemberResponse.from(bandMemberRepository.save(member));
    }

    @Transactional
    public BandMemberResponse updateMember(
            Long bandId,
            Long memberId,
            UpdateBandMemberRequest request,
            String email
    ) {
        User requester = findUser(email);
        Band band = findBand(bandId);
        assertCanManage(band, requester);
        BandMember member = findMember(bandId, memberId);
        member.setInstrument(request.instrument().trim());
        return BandMemberResponse.from(bandMemberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long bandId, Long memberId, String email) {
        User requester = findUser(email);
        Band band = findBand(bandId);
        BandMember member = findMember(bandId, memberId);

        if (member.getUser().getId().equals(band.getLeader().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El lider no puede ser removido de la banda");
        }
        if (!requester.getId().equals(member.getUser().getId())) {
            assertCanManage(band, requester);
        }
        bandMemberRepository.delete(member);
    }

    private BandResponse toResponse(Band band) {
        List<BandMemberResponse> members = bandMemberRepository.findByBandId(band.getId()).stream()
                .map(BandMemberResponse::from)
                .toList();
        return BandResponse.from(band, members);
    }

    private void assertCanView(Band band, User user) {
        if (isAdmin(user) || band.getLeader().getId().equals(user.getId())
                || bandMemberRepository.existsByBandIdAndUserId(band.getId(), user.getId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No perteneces a esta banda");
    }

    private void assertCanManage(Band band, User user) {
        if (isAdmin(user) || band.getLeader().getId().equals(user.getId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el lider puede administrar la banda");
    }

    private void assertNotMember(Long bandId, Long userId) {
        if (bandMemberRepository.existsByBandIdAndUserId(bandId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya pertenece a esta banda");
        }
    }

    private Band findBand(Long bandId) {
        return bandRepository.findById(bandId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banda no encontrada"));
    }

    private BandMember findMember(Long bandId, Long memberId) {
        return bandMemberRepository.findByBandIdAndId(bandId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Integrante no encontrado"));
    }

    private User findUser(String email) {
        return findUserByEmail(email);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && Objects.equals(ADMIN, user.getRole().getName());
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
