package com.auramusic.backend.admin;

import com.auramusic.backend.admin.dto.AdminUserResponse;
import com.auramusic.backend.admin.dto.UpdateAdminUserRequest;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AdminUserResponse update(Long id, UpdateAdminUserRequest request) {
        User user = findUser(id);
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsernameAndIdNot(username, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El username ya esta registrado");
        }
        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(normalize(request.phone()));
        user.setDisplayName(request.displayName().trim());
        user.setAvatarUrl(normalize(request.avatarUrl()));
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id, String requesterEmail) {
        User user = findUser(id);
        if (user.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivar tu propia cuenta");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
