package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String content,
        String authorName,
        String authorPhotoUrl,
        String authorUsername,
        LocalDateTime timestamp,
        int likesCount,
        boolean likedByCurrentUser
) {
    public static CommentResponse from(Comment comment, int likesCount, boolean likedByCurrentUser) {
        if (comment == null) return null;
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getName(),
                comment.getAuthor().getPhotoUrl(),
                comment.getAuthor().getUsername(),
                comment.getUpdatedAt(),
                likesCount,
                likedByCurrentUser
        );
    }

    public static CommentResponse from(Comment comment) {
        return from(comment, 0, false);
    }
}
