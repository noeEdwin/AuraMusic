package com.auramusic.backend.band;

import com.auramusic.backend.repository.BandRepository;
import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class BandInviteCodeGenerator {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 12;

    private final SecureRandom random = new SecureRandom();
    private final BandRepository bandRepository;

    public BandInviteCodeGenerator(BandRepository bandRepository) {
        this.bandRepository = bandRepository;
    }

    public String generate() {
        String code;
        do {
            StringBuilder value = new StringBuilder(CODE_LENGTH);
            for (int index = 0; index < CODE_LENGTH; index++) {
                value.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            code = value.toString();
        } while (bandRepository.existsByInviteCode(code));
        return code;
    }
}
