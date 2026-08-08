package br.ufpb.dsc.nexushub.model.people.service.impl;

import br.ufpb.dsc.nexushub.model.dto.CommentResponse;
import br.ufpb.dsc.nexushub.model.dto.PostResponse;
import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.Like;
import br.ufpb.dsc.nexushub.model.people.domain.CommentLike;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import br.ufpb.dsc.nexushub.model.people.repository.CommentRepository;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.people.repository.LikeRepository;
import br.ufpb.dsc.nexushub.model.people.repository.CommentLikeRepository;
import br.ufpb.dsc.nexushub.model.people.repository.PostRepository;
import br.ufpb.dsc.nexushub.model.people.service.FeedService;
import br.ufpb.dsc.nexushub.model.administration.repository.BannedWordRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedServiceImpl implements FeedService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final HumanRepository humanRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final BannedWordRepository bannedWordRepository;

    public FeedServiceImpl(
            PostRepository postRepository,
            LikeRepository likeRepository,
            CommentRepository commentRepository,
            HumanRepository humanRepository,
            CommentLikeRepository commentLikeRepository,
            BannedWordRepository bannedWordRepository
    ) {
        this.postRepository = postRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.humanRepository = humanRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.bannedWordRepository = bannedWordRepository;
    }

    private String censorContent(String content) {
        if (content == null || content.isBlank()) return content;
        String censored = content;
        for (var bw : bannedWordRepository.findAll()) {
            censored = censored.replaceAll("(?i)" + java.util.regex.Pattern.quote(bw.getWord()), "***");
        }
        return censored;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(UUID currentHumanId) {
        List<Post> posts = postRepository.findAllByRecordStatusOrderByUpdatedAtDesc(1);
        return mapPostsToResponses(posts, currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(UUID currentHumanId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Post> postsPage = postRepository.findAllByRecordStatusOrderByUpdatedAtDesc(1, pageable);
        return mapPostsToResponses(postsPage.getContent(), currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByAuthor(UUID authorId, UUID currentHumanId) {
        List<Post> posts = postRepository.findAllByAuthorIdAndRecordStatusOrderByUpdatedAtDesc(authorId, 1);
        return mapPostsToResponses(posts, currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeedByGroup(UUID groupId, UUID currentHumanId) {
        List<Post> posts = postRepository.findAllByGroupIdAndRecordStatusOrderByUpdatedAtDesc(groupId, 1);
        return mapPostsToResponses(posts, currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeedByGroup(UUID groupId, UUID currentHumanId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Post> postsPage = postRepository.findAllByGroupIdAndRecordStatusOrderByUpdatedAtDesc(groupId, 1, pageable);
        return mapPostsToResponses(postsPage.getContent(), currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeedByProject(UUID projectId, UUID currentHumanId) {
        List<Post> posts = postRepository.findAllByProjectIdAndRecordStatusOrderByUpdatedAtDesc(projectId, 1);
        return mapPostsToResponses(posts, currentHumanId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeedByProject(UUID projectId, UUID currentHumanId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Post> postsPage = postRepository.findAllByProjectIdAndRecordStatusOrderByUpdatedAtDesc(projectId, 1, pageable);
        return mapPostsToResponses(postsPage.getContent(), currentHumanId);
    }

    private List<PostResponse> mapPostsToResponses(List<Post> posts, UUID currentHumanId) {
        return posts.stream().map(post -> {
            List<CommentResponse> comments = commentRepository
                    .findAllByPostIdAndRecordStatusOrderByUpdatedAtAsc(post.getId(), 1)
                    .stream()
                    .map(c -> {
                        int cLikes = commentLikeRepository.countByCommentId(c.getId());
                        boolean cLiked = currentHumanId != null && commentLikeRepository.existsByCommentIdAndHumanId(c.getId(), currentHumanId);
                        return CommentResponse.from(c, cLikes, cLiked);
                    })
                    .toList();

            int likesCount = likeRepository.countByPostId(post.getId());
            boolean liked = false;
            if (currentHumanId != null) {
                liked = likeRepository.existsByPostIdAndHumanId(post.getId(), currentHumanId);
            }

            return PostResponse.from(post, likesCount, liked, comments);
        }).toList();
    }

    @Override
    @Transactional
    public Post createPost(UUID authorHumanId, String content, String imageUrl, UUID currentUserId) {
        return createPost(authorHumanId, content, imageUrl, "USER", null, currentUserId);
    }

    @Override
    @Transactional
    public Post createPost(UUID authorHumanId, String content, String imageUrl, String postType, UUID currentUserId) {
        return createPost(authorHumanId, content, imageUrl, postType, null, currentUserId);
    }

    @Override
    @Transactional
    public Post createPost(UUID authorHumanId, String content, String imageUrl, String postType, UUID groupId, UUID currentUserId) {
        return createPost(authorHumanId, content, imageUrl, postType, groupId, null, currentUserId);
    }

    @Override
    @Transactional
    public Post createPost(UUID authorHumanId, String content, String imageUrl, String postType, UUID groupId, UUID projectId, UUID currentUserId) {
        Human author = humanRepository.findById(authorHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Autor não encontrado."));
        String resolvedType = postType == null || postType.trim().isBlank() ? "USER" : postType.trim().toUpperCase();
        String censoredContent = censorContent(content);
        Post post = new Post(author, censoredContent, imageUrl, resolvedType, groupId, projectId, currentUserId);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public boolean toggleLike(UUID postId, UUID humanId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Optional<Like> existingLike = likeRepository.findByPostIdAndHumanId(postId, humanId);
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false;
        } else {
            likeRepository.save(new Like(post, human));
            return true;
        }
    }

    @Override
    @Transactional
    public boolean toggleCommentLike(UUID commentId, UUID humanId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comentário não encontrado."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndHumanId(commentId, humanId);
        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            return false;
        } else {
            commentLikeRepository.save(new CommentLike(comment, human));
            return true;
        }
    }

    @Override
    @Transactional
    public Comment addComment(UUID postId, UUID authorHumanId, String content, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));
        Human author = humanRepository.findById(authorHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Autor não encontrado."));

        String censoredContent = censorContent(content);
        Comment comment = new Comment(post, author, censoredContent, currentUserId);
        return commentRepository.save(comment);
    }
}
