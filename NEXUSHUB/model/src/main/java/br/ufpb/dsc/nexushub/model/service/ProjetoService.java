package br.ufpb.dsc.nexushub.model.service;

import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.dto.ProjetoResponse;
import java.util.List;

public interface ProjetoService {

    List<ProjetoResponse> listar();

    List<ProjetoResponse> listarQuentes();

    List<ProjetoResponse> listarRecentes();

    List<ProjetoResponse> listarColabs();

    List<ProjetoResponse> listarPorUsuario(String autor);

    List<ProjetoResponse> listarPorTag(String tag);

    ProjetoResponse criar(ProjetoRequest request);

    ProjetoResponse obterPorId(Long id);
}
