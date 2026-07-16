package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.people.domain.Post;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PostResponse(
        UUID id,
        String content,
        String imageUrl,
        UUID authorId,
        String authorName,
        String authorPhotoUrl,
        String authorUsername,
        int likesCount,
        boolean likedByCurrentUser,
        LocalDateTime timestamp,
        List<CommentResponse> comments,
        String postType,
        UUID groupId
) {
    public static PostResponse from(Post post, int likesCount, boolean likedByCurrentUser, List<CommentResponse> comments) {
        if (post == null) return null;
        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getImageUrl(),
                post.getAuthor().getId(),
                post.getAuthor().getName(),
                post.getAuthor().getPhotoUrl(),
                post.getAuthor().getUsername(),
                likesCount,
                likedByCurrentUser,
                post.getUpdatedAt(),
                comments,
                post.getPostType(),
                post.getGroupId()
        );
    }
}
