package com.auramusic.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Pattern(
                regexp = "^\\+52\\d{10}$",
                message = "El telefono debe usar formato mexicano internacional, por ejemplo +529518695421"
        ) @Size(max = 13) String phone,
        @NotBlank @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
                message = "La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial"
        ) String password,
        @NotBlank @Size(max = 100) String displayName,
        @NotBlank String role
) {
}
