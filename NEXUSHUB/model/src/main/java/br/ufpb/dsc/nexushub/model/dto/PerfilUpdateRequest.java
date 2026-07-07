package br.ufpb.dsc.nexushub.model.dto;

import java.time.LocalDate;
import java.util.List;

public record PerfilUpdateRequest(
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
        Integer ingressPeriod,
        Integer conclusionPeriod,
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
