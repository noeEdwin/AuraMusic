package com.auramusic.backend.setlist;

import com.auramusic.backend.domain.entity.Band;
import com.auramusic.backend.domain.entity.BandMember;
import com.auramusic.backend.domain.entity.Setlist;
import com.auramusic.backend.domain.entity.SetlistItem;
import com.auramusic.backend.domain.entity.Song;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.BandMemberRepository;
import com.auramusic.backend.repository.BandRepository;
import com.auramusic.backend.repository.SetlistItemRepository;
import com.auramusic.backend.repository.SetlistRepository;
import com.auramusic.backend.repository.SongRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.setlist.dto.AddSetlistItemRequest;
import com.auramusic.backend.setlist.dto.DuplicateSetlistRequest;
import com.auramusic.backend.setlist.dto.ReorderSetlistRequest;
import com.auramusic.backend.setlist.dto.SetlistItemResponse;
import com.auramusic.backend.setlist.dto.SetlistResponse;
import com.auramusic.backend.setlist.dto.UpdateSetlistItemRequest;
import com.auramusic.backend.setlist.dto.UpdateSetlistRequest;
import com.auramusic.backend.setlist.dto.CreateSetlistRequest;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SetlistService {

    private static final String ADMIN = "ADMIN";

    private final SetlistRepository setlistRepository;
    private final SetlistItemRepository itemRepository;
    private final SongRepository songRepository;
    private final BandRepository bandRepository;
    private final BandMemberRepository bandMemberRepository;
    private final UserRepository userRepository;

    public SetlistService(
            SetlistRepository setlistRepository,
            SetlistItemRepository itemRepository,
            SongRepository songRepository,
            BandRepository bandRepository,
            BandMemberRepository bandMemberRepository,
            UserRepository userRepository
    ) {
        this.setlistRepository = setlistRepository;
        this.itemRepository = itemRepository;
        this.songRepository = songRepository;
        this.bandRepository = bandRepository;
        this.bandMemberRepository = bandMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SetlistResponse> list(String email) {
        User user = findUser(email);
        Set<Long> ids = new HashSet<>();
        List<Setlist> setlists = new ArrayList<>(setlistRepository.findByOwnerId(user.getId()));
        setlists.forEach(setlist -> ids.add(setlist.getId()));

        if (isAdmin(user)) {
            setlists = new ArrayList<>(setlistRepository.findAll());
        } else {
            for (BandMember membership : bandMemberRepository.findByUserId(user.getId())) {
                for (Setlist setlist : setlistRepository.findByBandId(membership.getBand().getId())) {
                    if (ids.add(setlist.getId())) {
                        setlists.add(setlist);
                    }
                }
            }
        }
        return setlists.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SetlistResponse get(Long id, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(id);
        assertCanView(setlist, user);
        return toResponse(setlist);
    }

    @Transactional
    public SetlistResponse create(CreateSetlistRequest request, String email) {
        User owner = findUser(email);
        Band band = request.bandId() == null ? null : findBand(request.bandId());
        if (band != null) {
            assertBandMember(band, owner);
        }
        assertUniqueName(owner, request.name().trim());

        Setlist setlist = new Setlist();
        setlist.setOwner(owner);
        setlist.setBand(band);
        setlist.setName(request.name().trim());
        setlist.setDescription(normalize(request.description()));
        setlist.setEventDate(request.eventDate());
        return toResponse(setlistRepository.save(setlist));
    }

    @Transactional
    public SetlistResponse update(Long id, UpdateSetlistRequest request, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(id);
        assertCanManage(setlist, user);
        if (!setlist.getName().equalsIgnoreCase(request.name().trim())) {
            assertUniqueName(setlist.getOwner(), request.name().trim());
        }
        setlist.setName(request.name().trim());
        setlist.setDescription(normalize(request.description()));
        setlist.setEventDate(request.eventDate());
        return toResponse(setlistRepository.save(setlist));
    }

    @Transactional
    public void delete(Long id, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(id);
        assertCanManage(setlist, user);
        setlistRepository.delete(setlist);
    }

    @Transactional
    public SetlistResponse addItem(Long id, AddSetlistItemRequest request, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(id);
        assertCanManage(setlist, user);
        Song song = songRepository.findById(request.songId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancion no encontrada"));
        List<SetlistItem> items = itemRepository.findBySetlistIdOrderByPositionAsc(id);
        int position = request.position() == null ? items.size() + 1 : Math.min(request.position(), items.size() + 1);
        shiftPositions(items, position);

        SetlistItem item = new SetlistItem();
        item.setSetlist(setlist);
        item.setSong(song);
        item.setPosition(position);
        item.setTransposeSteps(defaultValue(request.transposeSteps()));
        item.setBreakSeconds(defaultValue(request.breakSeconds()));
        item.setNotes(normalize(request.notes()));
        itemRepository.save(item);
        return toResponse(setlist);
    }

    @Transactional
    public SetlistResponse updateItem(
            Long setlistId,
            Long itemId,
            UpdateSetlistItemRequest request,
            String email
    ) {
        User user = findUser(email);
        Setlist setlist = findSetlist(setlistId);
        assertCanManage(setlist, user);
        SetlistItem item = findItem(setlistId, itemId);
        if (request.transposeSteps() != null) {
            item.setTransposeSteps(request.transposeSteps());
        }
        if (request.breakSeconds() != null) {
            item.setBreakSeconds(request.breakSeconds());
        }
        item.setNotes(normalize(request.notes()));
        itemRepository.save(item);
        return toResponse(setlist);
    }

    @Transactional
    public SetlistResponse reorder(Long id, ReorderSetlistRequest request, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(id);
        assertCanManage(setlist, user);
        List<SetlistItem> items = itemRepository.findBySetlistIdOrderByPositionAsc(id);
        if (items.size() != request.itemIds().size()
                || !new HashSet<>(request.itemIds()).equals(items.stream().map(SetlistItem::getId).collect(java.util.stream.Collectors.toSet()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La lista de items no coincide con el setlist");
        }

        int temporaryBase = items.stream()
                .mapToInt(SetlistItem::getPosition)
                .max()
                .orElse(0) + items.size() + 1;
        for (int index = 0; index < items.size(); index++) {
            items.get(index).setPosition(temporaryBase + index);
        }
        itemRepository.saveAllAndFlush(items);
        for (int index = 0; index < request.itemIds().size(); index++) {
            findItem(id, request.itemIds().get(index)).setPosition(index + 1);
        }
        itemRepository.flush();
        return toResponse(setlist);
    }

    @Transactional
    public void removeItem(Long setlistId, Long itemId, String email) {
        User user = findUser(email);
        Setlist setlist = findSetlist(setlistId);
        assertCanManage(setlist, user);
        SetlistItem item = findItem(setlistId, itemId);
        itemRepository.delete(item);
        itemRepository.flush();
        compactPositions(itemRepository.findBySetlistIdOrderByPositionAsc(setlistId));
    }

    @Transactional
    public SetlistResponse duplicate(Long id, DuplicateSetlistRequest request, String email) {
        User user = findUser(email);
        Setlist source = findSetlist(id);
        assertCanView(source, user);
        assertUniqueName(user, request.name().trim());

        Setlist copy = new Setlist();
        copy.setOwner(user);
        copy.setBand(source.getBand());
        copy.setName(request.name().trim());
        copy.setDescription(source.getDescription());
        copy.setEventDate(source.getEventDate());
        Setlist savedCopy = setlistRepository.save(copy);

        for (SetlistItem sourceItem : itemRepository.findBySetlistIdOrderByPositionAsc(id)) {
            SetlistItem item = new SetlistItem();
            item.setSetlist(savedCopy);
            item.setSong(sourceItem.getSong());
            item.setPosition(sourceItem.getPosition());
            item.setTransposeSteps(sourceItem.getTransposeSteps());
            item.setBreakSeconds(sourceItem.getBreakSeconds());
            item.setNotes(sourceItem.getNotes());
            itemRepository.save(item);
        }
        return toResponse(savedCopy);
    }

    private SetlistResponse toResponse(Setlist setlist) {
        List<SetlistItemResponse> items = itemRepository.findBySetlistIdOrderByPositionAsc(setlist.getId()).stream()
                .map(SetlistItemResponse::from)
                .toList();
        int total = items.stream()
                .mapToInt(item -> item.song().durationSeconds() + item.breakSeconds())
                .sum();
        return SetlistResponse.from(setlist, items, total);
    }

    private void shiftPositions(List<SetlistItem> items, int position) {
        items.stream()
                .filter(item -> item.getPosition() >= position)
                .sorted((first, second) -> second.getPosition().compareTo(first.getPosition()))
                .forEach(item -> item.setPosition(item.getPosition() + 1));
        itemRepository.saveAll(items);
    }

    private void compactPositions(List<SetlistItem> items) {
        for (int index = 0; index < items.size(); index++) {
            items.get(index).setPosition(index + 1);
        }
        itemRepository.saveAll(items);
    }

    private void assertCanView(Setlist setlist, User user) {
        if (isAdmin(user) || setlist.getOwner().getId().equals(user.getId())
                || (setlist.getBand() != null && bandMemberRepository.existsByBandIdAndUserId(setlist.getBand().getId(), user.getId()))) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a este setlist");
    }

    private void assertCanManage(Setlist setlist, User user) {
        if (isAdmin(user) || setlist.getOwner().getId().equals(user.getId())
                || (setlist.getBand() != null
                && bandMemberRepository.existsByBandIdAndUserId(setlist.getBand().getId(), user.getId()))) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Debes pertenecer a la banda para modificar este setlist");
    }

    private void assertBandMember(Band band, User user) {
        if (!isAdmin(user) && !bandMemberRepository.existsByBandIdAndUserId(band.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Debes pertenecer a la banda");
        }
    }

    private void assertUniqueName(User owner, String name) {
        if (setlistRepository.existsByOwnerIdAndName(owner.getId(), name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un setlist con ese nombre");
        }
    }

    private Setlist findSetlist(Long id) {
        return setlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Setlist no encontrado"));
    }

    private SetlistItem findItem(Long setlistId, Long itemId) {
        return itemRepository.findBySetlistIdAndId(setlistId, itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado"));
    }

    private Band findBand(Long id) {
        return bandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banda no encontrada"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && ADMIN.equals(user.getRole().getName());
    }

    private int defaultValue(Integer value) {
        return value == null ? 0 : value;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
