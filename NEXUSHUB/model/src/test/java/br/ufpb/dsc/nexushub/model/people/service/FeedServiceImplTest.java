package br.ufpb.dsc.nexushub.model.people.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.dto.PostResponse;
import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.Like;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import br.ufpb.dsc.nexushub.model.people.repository.CommentRepository;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.people.repository.LikeRepository;
import br.ufpb.dsc.nexushub.model.people.repository.PostRepository;
import br.ufpb.dsc.nexushub.model.people.service.impl.FeedServiceImpl;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import br.ufpb.dsc.nexushub.model.administration.repository.BannedWordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FeedServiceImplTest {

    private PostRepository postRepository;
    private LikeRepository likeRepository;
    private CommentRepository commentRepository;
    private HumanRepository humanRepository;
    private br.ufpb.dsc.nexushub.model.people.repository.CommentLikeRepository commentLikeRepository;
    private BannedWordRepository bannedWordRepository;
    private FeedServiceImpl feedService;

    @BeforeEach
    void setUp() {
        postRepository = mock(PostRepository.class);
        likeRepository = mock(LikeRepository.class);
        commentRepository = mock(CommentRepository.class);
        humanRepository = mock(HumanRepository.class);
        commentLikeRepository = mock(br.ufpb.dsc.nexushub.model.people.repository.CommentLikeRepository.class);
        bannedWordRepository = mock(BannedWordRepository.class);
        feedService = new FeedServiceImpl(postRepository, likeRepository, commentRepository, humanRepository, commentLikeRepository, bannedWordRepository);
    }

    @Test
    void testGetFeedWithoutCurrentUser() {
        Post post = mock(Post.class);
        Human author = mock(Human.class);
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        
        when(post.getId()).thenReturn(postId);
        when(post.getAuthor()).thenReturn(author);
        when(author.getId()).thenReturn(authorId);
        when(author.getName()).thenReturn("John Doe");

        List<Post> posts = List.of(post);
        when(postRepository.findAllByRecordStatusOrderByUpdatedAtDesc(1)).thenReturn(posts);
        when(commentRepository.findAllByPostIdAndRecordStatusOrderByUpdatedAtAsc(postId, 1)).thenReturn(new ArrayList<>());
        when(likeRepository.countByPostId(postId)).thenReturn(5);

        List<PostResponse> result = feedService.getFeed(null);

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).authorName());
        assertEquals(5, result.get(0).likesCount());
        assertFalse(result.get(0).likedByCurrentUser());
        verify(likeRepository, never()).existsByPostIdAndHumanId(any(), any());
    }

    @Test
    void testGetFeedWithCurrentUserLiked() {
        Post post = mock(Post.class);
        Human author = mock(Human.class);
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID currentHumanId = UUID.randomUUID();
        
        when(post.getId()).thenReturn(postId);
        when(post.getAuthor()).thenReturn(author);
        when(author.getId()).thenReturn(authorId);
        when(author.getName()).thenReturn("Jane Doe");

        List<Post> posts = List.of(post);
        when(postRepository.findAllByRecordStatusOrderByUpdatedAtDesc(1)).thenReturn(posts);
        when(commentRepository.findAllByPostIdAndRecordStatusOrderByUpdatedAtAsc(postId, 1)).thenReturn(new ArrayList<>());
        when(likeRepository.countByPostId(postId)).thenReturn(10);
        when(likeRepository.existsByPostIdAndHumanId(postId, currentHumanId)).thenReturn(true);

        List<PostResponse> result = feedService.getFeed(currentHumanId);

        assertEquals(1, result.size());
        assertEquals("Jane Doe", result.get(0).authorName());
        assertEquals(10, result.get(0).likesCount());
        assertTrue(result.get(0).likedByCurrentUser());
    }

    @Test
    void testCreatePostSuccess() {
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Human author = mock(Human.class);
        when(humanRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post post = feedService.createPost(authorId, "New Post", "http://image.url", userId);

        assertNotNull(post);
        assertEquals("New Post", post.getContent());
        assertEquals("http://image.url", post.getImageUrl());
        assertEquals(author, post.getAuthor());
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void testCreatePostWithTypeSuccess() {
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Human author = mock(Human.class);
        when(humanRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post post = feedService.createPost(authorId, "Store Promotion", "http://image.url", "STORE", userId);

        assertNotNull(post);
        assertEquals("Store Promotion", post.getContent());
        assertEquals("STORE", post.getPostType());
        assertEquals(author, post.getAuthor());
    }

    @Test
    void testCreatePostAuthorNotFound() {
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(humanRepository.findById(authorId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            feedService.createPost(authorId, "New Post", "http://image.url", userId)
        );
    }

    @Test
    void testToggleLikeAddLike() {
        UUID postId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Post post = mock(Post.class);
        Human human = mock(Human.class);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(humanId)).thenReturn(Optional.of(human));
        when(likeRepository.findByPostIdAndHumanId(postId, humanId)).thenReturn(Optional.empty());

        boolean result = feedService.toggleLike(postId, humanId);

        assertTrue(result);
        verify(likeRepository).save(any(Like.class));
        verify(likeRepository, never()).delete(any());
    }

    @Test
    void testToggleLikeRemoveLike() {
        UUID postId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Post post = mock(Post.class);
        Human human = mock(Human.class);
        Like like = mock(Like.class);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(humanId)).thenReturn(Optional.of(human));
        when(likeRepository.findByPostIdAndHumanId(postId, humanId)).thenReturn(Optional.of(like));

        boolean result = feedService.toggleLike(postId, humanId);

        assertFalse(result);
        verify(likeRepository).delete(like);
        verify(likeRepository, never()).save(any());
    }

    @Test
    void testToggleLikePostNotFound() {
        UUID postId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> feedService.toggleLike(postId, humanId));
    }

    @Test
    void testToggleLikeHumanNotFound() {
        UUID postId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Post post = mock(Post.class);
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(humanId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> feedService.toggleLike(postId, humanId));
    }

    @Test
    void testAddCommentSuccess() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Post post = mock(Post.class);
        Human author = mock(Human.class);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment comment = feedService.addComment(postId, authorId, "Nice post", userId);

        assertNotNull(comment);
        assertEquals("Nice post", comment.getContent());
        assertEquals(post, comment.getPost());
        assertEquals(author, comment.getAuthor());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void testAddCommentPostNotFound() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            feedService.addComment(postId, authorId, "Nice post", userId)
        );
    }

    @Test
    void testAddCommentAuthorNotFound() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Post post = mock(Post.class);
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(authorId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            feedService.addComment(postId, authorId, "Nice post", userId)
        );
    }

    @Test
    void testCreatePostWithGroupSuccess() {
        UUID authorId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Human author = mock(Human.class);
        when(humanRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post post = feedService.createPost(authorId, "Group Discussion", "http://image.url", "COMMUNITY", groupId, userId);

        assertNotNull(post);
        assertEquals("Group Discussion", post.getContent());
        assertEquals("COMMUNITY", post.getPostType());
        assertEquals(groupId, post.getGroupId());
        assertEquals(author, post.getAuthor());
    }

    @Test
    void testGetFeedByGroupWithoutCurrentUser() {
        UUID groupId = UUID.randomUUID();
        Post post = mock(Post.class);
        Human author = mock(Human.class);
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();

        when(post.getId()).thenReturn(postId);
        when(post.getAuthor()).thenReturn(author);
        when(author.getId()).thenReturn(authorId);
        when(author.getName()).thenReturn("Group Member");

        List<Post> posts = List.of(post);
        when(postRepository.findAllByGroupIdAndRecordStatusOrderByUpdatedAtDesc(groupId, 1)).thenReturn(posts);
        when(commentRepository.findAllByPostIdAndRecordStatusOrderByUpdatedAtAsc(postId, 1)).thenReturn(new ArrayList<>());
        when(likeRepository.countByPostId(postId)).thenReturn(3);

        List<PostResponse> result = feedService.getFeedByGroup(groupId, null);

        assertEquals(1, result.size());
        assertEquals("Group Member", result.get(0).authorName());
        assertEquals(3, result.get(0).likesCount());
    }
}
