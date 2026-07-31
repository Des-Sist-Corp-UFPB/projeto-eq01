package br.ufpb.dsc.nexushub.controller.ai;

import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiProjectRestController {
    private final ProjectDraftAiService service;
    private final AiRateLimiter rateLimiter;

    public AiProjectRestController(ProjectDraftAiService service, AiRateLimiter rateLimiter) {
        this.service = service;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/project-draft")
    public ProjectDraftResponse projectDraft(@Valid @RequestBody ProjectDraftRequest request, Principal principal) {
        rateLimiter.check(principal.getName());
        return service.generate(request.idea());
    }
}
