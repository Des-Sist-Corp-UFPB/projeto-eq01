package br.ufpb.dsc.nexushub.model.administration.service;

import br.ufpb.dsc.nexushub.model.administration.domain.BannedWord;
import br.ufpb.dsc.nexushub.model.administration.domain.ReportTicket;
import br.ufpb.dsc.nexushub.model.administration.repository.BannedWordRepository;
import br.ufpb.dsc.nexushub.model.administration.repository.ReportTicketRepository;
import br.ufpb.dsc.nexushub.model.people.repository.CommentRepository;
import br.ufpb.dsc.nexushub.model.people.repository.PostRepository;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminContentService {
    private final ReportTicketRepository ticketRepository;
    private final BannedWordRepository bannedWordRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public AdminContentService(ReportTicketRepository ticketRepository,
                               BannedWordRepository bannedWordRepository,
                               PostRepository postRepository,
                               CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.bannedWordRepository = bannedWordRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<ReportTicket> listPendingTickets() {
        return ticketRepository.findAllByStatusOrderByCreatedTimeDesc("PENDING");
    }

    @Transactional
    public void resolveTicket(UUID id, String action, UUID moderatorId) {
        ReportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket não encontrado."));
        ticket.setStatus(action.toUpperCase()); // RESOLVED, ARCHIVED
        ticket.setModeratorId(moderatorId);
        ticketRepository.save(ticket);

        if ("RESOLVED".equals(action.toUpperCase())) {
            // Delete target content if resolved
            if ("POST".equalsIgnoreCase(ticket.getTargetType())) {
                postRepository.deleteById(ticket.getTargetId());
            } else if ("COMMENT".equalsIgnoreCase(ticket.getTargetType())) {
                commentRepository.deleteById(ticket.getTargetId());
            }
        }
    }

    @Transactional
    public ReportTicket report(String targetType, UUID targetId, String reason) {
        ReportTicket ticket = new ReportTicket();
        ticket.setTargetType(targetType.toUpperCase());
        ticket.setTargetId(targetId);
        ticket.setReason(reason);
        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<BannedWord> listBannedWords() {
        return bannedWordRepository.findAll();
    }

    @Transactional
    public BannedWord addBannedWord(String word) {
        if (word == null || word.trim().isBlank()) {
            throw new IllegalArgumentException("Palavra não pode ser vazia.");
        }
        String cleanWord = word.trim().toLowerCase();
        if (bannedWordRepository.findByWordIgnoreCase(cleanWord).isPresent()) {
            throw new IllegalArgumentException("Palavra já cadastrada.");
        }
        BannedWord bw = new BannedWord();
        bw.setWord(cleanWord);
        return bannedWordRepository.save(bw);
    }

    @Transactional
    public void removeBannedWord(UUID id) {
        bannedWordRepository.deleteById(id);
    }

    public String censor(String content) {
        if (content == null || content.isBlank()) return content;
        String censored = content;
        List<BannedWord> list = bannedWordRepository.findAll();
        for (BannedWord bw : list) {
            censored = censored.replaceAll("(?i)" + java.util.regex.Pattern.quote(bw.getWord()), "***");
        }
        return censored;
    }
}
