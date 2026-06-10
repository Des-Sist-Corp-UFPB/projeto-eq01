package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.OportunidadeResponse;
import br.ufpb.dsc.nexushub.model.opportunities.service.OpportunityService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oportunidades")
public class OportunidadeRestController {

    private final OpportunityService opportunityService;

    public OportunidadeRestController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @GetMapping
    public List<OportunidadeResponse> listar() {
        return opportunityService.listOpenOpportunities().stream()
                .map(OportunidadeResponse::from)
                .toList();
    }
}


