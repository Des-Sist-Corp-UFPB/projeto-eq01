package br.ufpb.dsc.nexushub.model.groups.service.impl;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.domain.GroupHumanMember;
import br.ufpb.dsc.nexushub.model.dto.GrupoRequest;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupHumanMemberRepository;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.groups.service.GroupService;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final HumanRepository humanRepository;
    private final GroupHumanMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final IdentityService identityService;

    public GroupServiceImpl(
            GroupRepository groupRepository,
            HumanRepository humanRepository,
            GroupHumanMemberRepository memberRepository,
            UserRepository userRepository,
            IdentityService identityService
    ) {
        this.groupRepository = groupRepository;
        this.humanRepository = humanRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.identityService = identityService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Group> listActiveGroups() {
        return groupRepository.findAll().stream()
                .filter(group -> group.getRecordStatus() == 1)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Group getGroup(UUID groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo nao encontrado."));
    }

    @Override
    @Transactional(readOnly = true)
    public String getResponsibleName(UUID groupId) {
        Group group = getGroup(groupId);
        return memberRepository.findByGroup(group).stream()
                .filter(member -> Boolean.TRUE.equals(member.getAdmin()))
                .findFirst()
                .map(member -> member.getHuman().getName())
                .orElse(null);
    }

    @Override
    @Transactional
    public Group createGroup(String name, String description, Integer type, UUID creatorHumanId, UUID updatedById) {
        UUID updater = updatedById == null ? identityService.firstUser().getId() : updatedById;
        Group group = groupRepository.save(new Group(name, description, type == null ? 1 : type, "#1e3a8a", null, updater));
        if (creatorHumanId != null) {
            addHumanToGroup(group.getId(), creatorHumanId, true, updater);
        }
        return group;
    }

    @Override
    @Transactional
    public Group createGroup(GrupoRequest request) {
        User creator = resolveCreator(request.criadorId());
        UUID updater = creator.getId();
        Group group = groupRepository.save(new Group(
                request.nome(),
                request.descricao(),
                parseGroupType(request.area()),
                parseGroupStatus(request.tipo()),
                request.cor() == null || request.cor().isBlank() ? "#1e3a8a" : request.cor(),
                request.logo(),
                updater
        ));
        addHumanToGroup(group.getId(), creator.getHuman().getId(), true, updater);
        return group;
    }

    @Override
    @Transactional
    public GroupHumanMember addHumanToGroup(UUID groupId, UUID humanId, boolean admin, UUID updatedById) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo nao encontrado."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa nao encontrada."));
        return memberRepository.findByGroupAndHuman(group, human)
                .orElseGet(() -> memberRepository.save(new GroupHumanMember(group, human, admin, updatedById)));
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId) {
        Group group = getGroup(groupId);
        group.deactivate(identityService.firstUser().getId());
        groupRepository.save(group);
    }

    private Integer parseType(String value, Integer fallback) {
        try {
            return value == null || value.isBlank() ? fallback : Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private Integer parseGroupType(String value) {
        if (value == null || value.isBlank()) {
            return 1;
        }
        return switch (value.trim().toLowerCase()) {
            case "comunidade" -> 2;
            case "externo" -> 3;
            default -> 1;
        };
    }

    private Integer parseGroupStatus(String value) {
        if (value == null || value.isBlank()) {
            return 1;
        }
        return "restrito".equalsIgnoreCase(value.trim()) ? 2 : 1;
    }

    private User resolveCreator(UUID creatorId) {
        if (creatorId == null) {
            throw new IllegalArgumentException("Criador do grupo e obrigatorio.");
        }
        return userRepository.findById(creatorId)
                .or(() -> userRepository.findAll().stream()
                        .filter(user -> user.getHuman().getId().equals(creatorId))
                        .findFirst())
                .orElseThrow(() -> new IllegalArgumentException("Criador do grupo nao encontrado."));
    }
}
