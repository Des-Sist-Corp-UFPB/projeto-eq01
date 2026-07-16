package br.ufpb.dsc.nexushub.model.dto;

import java.time.LocalDate;
import java.util.List;

public record PerfilUpdateRequest(
        String username,
        String nome,
        String email,
        String senha,
        String bio,
        String fotoUrl,
        LocalDate birthDate,
        Integer genderType,
        String genderOther,
        boolean showBirthday,
        String course,
        Integer period,
        String matricula,
        @jakarta.validation.constraints.Pattern(regexp = "^$|^\\d{4}\\.[12]$", message = "Período de ingresso deve estar no formato YYYY.Semestre (ex: 2023.1)")
        String ingressPeriod,
        @jakarta.validation.constraints.Pattern(regexp = "^$|^\\d{4}\\.[12]$", message = "Período de conclusão deve estar no formato YYYY.Semestre (ex: 2024.2)")
        String conclusionPeriod,
        String whatsapp,
        String githubUrl,
        String instagramUrl,
        String linkedinUrl,
        String websiteUrl,
        boolean notifRecommendations,
        boolean notifApplications,
        boolean notifAnnouncements,
        boolean notifEdicts,
        boolean notifAdmin,
        String experience,
        String education,
        String certification,
        List<String> technologies
) {
}
