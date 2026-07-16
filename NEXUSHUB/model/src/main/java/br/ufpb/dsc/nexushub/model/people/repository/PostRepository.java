package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Post;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findAllByRecordStatusOrderByUpdatedAtDesc(Integer recordStatus);
    Page<Post> findAllByRecordStatusOrderByUpdatedAtDesc(Integer recordStatus, Pageable pageable);
    List<Post> findAllByAuthorIdAndRecordStatusOrderByUpdatedAtDesc(UUID authorId, Integer recordStatus);
    List<Post> findAllByGroupIdAndRecordStatusOrderByUpdatedAtDesc(UUID groupId, Integer recordStatus);
    Page<Post> findAllByGroupIdAndRecordStatusOrderByUpdatedAtDesc(UUID groupId, Integer recordStatus, Pageable pageable);
    List<Post> findAllByProjectIdAndRecordStatusOrderByUpdatedAtDesc(UUID projectId, Integer recordStatus);
    Page<Post> findAllByProjectIdAndRecordStatusOrderByUpdatedAtDesc(UUID projectId, Integer recordStatus, Pageable pageable);
}
