package br.ufpb.dsc.nexushub.model.people.service;

import br.ufpb.dsc.nexushub.model.dto.PostResponse;
import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import java.util.List;
import java.util.UUID;

public interface FeedService {

    List<PostResponse> getFeed(UUID currentUserId);

    List<PostResponse> getFeed(UUID currentUserId, int page, int size);

    List<PostResponse> getPostsByAuthor(UUID authorId, UUID currentUserId);

    Post createPost(UUID authorHumanId, String content, String imageUrl, UUID currentUserId);

    Post createPost(UUID authorHumanId, String content, String imageUrl, String postType, UUID currentUserId);

    Post createPost(UUID authorHumanId, String content, String imageUrl, String postType, UUID groupId, UUID currentUserId);

    List<PostResponse> getFeedByGroup(UUID groupId, UUID currentHumanId);

    List<PostResponse> getFeedByGroup(UUID groupId, UUID currentHumanId, int page, int size);

    boolean toggleLike(UUID postId, UUID humanId);

    boolean toggleCommentLike(UUID commentId, UUID humanId);

    Comment addComment(UUID postId, UUID authorHumanId, String content, UUID currentUserId);
}
