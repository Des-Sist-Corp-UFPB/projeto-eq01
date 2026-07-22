package br.ufpb.dsc.nexushub.model.administration.service;
import br.ufpb.dsc.nexushub.model.administration.domain.FeatureFlag;
import br.ufpb.dsc.nexushub.model.administration.repository.FeatureFlagRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class FeatureFlagService {
    private final FeatureFlagRepository repository;
    public FeatureFlagService(FeatureFlagRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true)
    public boolean enabled(String code) { return repository.findByCode(code).map(FeatureFlag::isEnabled).orElse(false); }
    @Transactional(readOnly = true)
    public List<FeatureFlag> list() { return repository.findAll(); }
    @Transactional
    public FeatureFlag update(String code, boolean enabled) {
        FeatureFlag flag = repository.findByCode(code).orElseThrow(() -> new IllegalArgumentException("Feature inexistente."));
        flag.setEnabled(enabled);
        return repository.save(flag);
    }
}
