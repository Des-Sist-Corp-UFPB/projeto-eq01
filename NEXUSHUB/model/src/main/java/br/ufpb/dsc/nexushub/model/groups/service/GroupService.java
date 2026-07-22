package br.ufpb.dsc.nexushub.model.groups.service;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.domain.GroupHumanMember;
import br.ufpb.dsc.nexushub.model.dto.GrupoRequest;
import java.util.List;
import java.util.UUID;

public interface GroupService {

    List<Group> listActiveGroups();

    Group getGroup(UUID groupId);

    String getResponsibleName(UUID groupId);

    Group createGroup(String name, String description, Integer type, UUID creatorHumanId, UUID updatedById);

    Group createGroup(GrupoRequest request);

    GroupHumanMember addHumanToGroup(UUID groupId, UUID humanId, boolean admin, UUID updatedById);

    void deleteGroup(UUID groupId);
}
