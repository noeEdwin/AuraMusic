package com.auramusic.backend.admin;

import com.auramusic.backend.admin.dto.AdminUserResponse;
import com.auramusic.backend.admin.dto.CreateAdminUserRequest;
import com.auramusic.backend.admin.dto.UpdateAdminUserRequest;
import com.auramusic.backend.domain.entity.Role;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "MUSICIAN", "SOLO");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> list() {
        return userRepository.findAllByOrderByIdDesc().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse get(Long id) {
        return AdminUserResponse.from(findUser(id));
    }

    @Transactional
    public AdminUserResponse create(CreateAdminUserRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El username ya esta registrado");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        User user = new User();
        user.setRole(findRole(request.role()));
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        user.setAvatarUrl(normalize(request.avatarUrl()));
        user.setEnabled(true);
        return AdminUserResponse.from(userRepository.save(user));
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
    public AdminUserResponse activate(Long id) {
        User user = findUser(id);
        user.setEnabled(true);
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

    private Role findRole(String requestedRole) {
        String roleName = requestedRole.trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no permitido");
        }
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol no configurado"));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
