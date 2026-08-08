package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.identity.domain.User;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        String username,
        String email,
        String cargo,
        String fotoUrl,
        boolean onboardingCompleted,
        String userType,
        boolean showBirthday,
        String bio,
        LocalDate birthDate,
        Integer genderType,
        String genderOther,
        String course,
        String period,
        String matricula,
        String ingressPeriod,
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
    public static UsuarioResponse from(User user) {
        if (user == null) {
            return null;
        }
        var human = user.getHuman();
        List<String> techNames = java.util.Collections.emptyList();
        if (human.getTechnologies() != null) {
            techNames = human.getTechnologies().stream()
                    .map(br.ufpb.dsc.nexushub.model.people.domain.Technology::getName)
                    .toList();
        }

        return new UsuarioResponse(
                user.getId(),
                human.getName(),
                human.getUsername(),
                user.getEmail(),
                user.getRole().getName(),
                human.getPhotoUrl(),
                user.isOnboardingCompleted(),
                human.getUserType(),
                human.isShowBirthday(),
                human.getBio(),
                human.getBirthDate(),
                human.getGenderType(),
                human.getGenderOther(),
                human.getCourse(),
                human.getPeriod(),
                human.getMatricula(),
                human.getIngressPeriod(),
                human.getConclusionPeriod(),
                human.getWhatsapp(),
                human.getGithubUrl(),
                human.getInstagramUrl(),
                human.getLinkedinUrl(),
                human.getWebsiteUrl(),
                human.isNotifRecommendations(),
                human.isNotifApplications(),
                human.isNotifAnnouncements(),
                human.isNotifEdicts(),
                human.isNotifAdmin(),
                human.getExperience(),
                human.getEducation(),
                human.getCertification(),
                techNames
        );
    }
}
