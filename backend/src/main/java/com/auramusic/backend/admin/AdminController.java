package com.auramusic.backend.admin;

import com.auramusic.backend.admin.dto.AdminSummaryResponse;
import com.auramusic.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public AdminSummaryResponse summary() {
        return new AdminSummaryResponse(userRepository.count());
    }
}
