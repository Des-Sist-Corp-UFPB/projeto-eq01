package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findAllByPostIdAndRecordStatusOrderByUpdatedAtAsc(UUID postId, Integer recordStatus);
}
