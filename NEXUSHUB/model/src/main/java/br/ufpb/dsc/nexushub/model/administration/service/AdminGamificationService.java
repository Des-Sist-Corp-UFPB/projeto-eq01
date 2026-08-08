package br.ufpb.dsc.nexushub.model.administration.service;

import br.ufpb.dsc.nexushub.model.administration.domain.Badge;
import br.ufpb.dsc.nexushub.model.administration.domain.XpRule;
import br.ufpb.dsc.nexushub.model.administration.repository.BadgeRepository;
import br.ufpb.dsc.nexushub.model.administration.repository.XpRuleRepository;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminGamificationService {
    private final BadgeRepository badgeRepository;
    private final XpRuleRepository xpRuleRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public AdminGamificationService(BadgeRepository badgeRepository,
                                     XpRuleRepository xpRuleRepository,
                                     UserRepository userRepository,
                                     ProjectRepository projectRepository) {
        this.badgeRepository = badgeRepository;
        this.xpRuleRepository = xpRuleRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<Badge> listBadges() {
        return badgeRepository.findAll();
    }

    @Transactional
    public Badge saveBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    @Transactional
    public void deleteBadge(UUID id) {
        badgeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<XpRule> listXpRules() {
        return xpRuleRepository.findAll();
    }

    @Transactional
    public XpRule updateXpRule(String actionKey, int newValue) {
        XpRule rule = xpRuleRepository.findByActionKey(actionKey)
                .orElseGet(() -> {
                    XpRule r = new XpRule();
                    r.setActionKey(actionKey);
                    return r;
                });
        rule.setXpValue(newValue);
        return xpRuleRepository.save(rule);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> detectXpAnomalies() {
        // Detect anomalous users having points > 500
        List<Map<String, Object>> anomalies = new ArrayList<>();
        List<User> users = userRepository.findAll();
        for (User u : users) {
            // Check project count * 50 as default
            long count = projectRepository.findAll().stream()
                    .filter(p -> p.getOwner() != null && u.getHuman() != null && u.getHuman().getId().equals(p.getOwner().getId()))
                    .count();
            if (count > 10) { // arbitrary threshold to flag fraud
                Map<String, Object> anomaly = new LinkedHashMap<>();
                anomaly.put("userId", u.getId());
                anomaly.put("name", u.getHuman().getName());
                anomaly.put("projectCount", count);
                anomaly.put("reason", "Múltiplos projetos criados pelo mesmo usuário em tempo reduzido.");
                anomalies.add(anomaly);
            }
        }
        return anomalies;
    }
}
