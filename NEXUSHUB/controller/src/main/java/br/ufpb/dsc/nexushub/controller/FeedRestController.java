package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.CommentResponse;
import br.ufpb.dsc.nexushub.model.dto.PostResponse;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Comment;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import br.ufpb.dsc.nexushub.model.people.service.FeedService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed")
public class FeedRestController {

    private final FeedService feedService;
    private final IdentityService identityService;

    public FeedRestController(FeedService feedService, IdentityService identityService) {
        this.feedService = feedService;
        this.identityService = identityService;
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int size,
            Principal principal) {
        UUID currentHumanId = null;
        if (principal != null) {
            User user = identityService.findByEmail(principal.getName());
            currentHumanId = user.getHuman().getId();
        }
        return ResponseEntity.ok(feedService.getFeed(currentHumanId, page, size));
    }

    @GetMapping("/grupo/{groupId}")
    public ResponseEntity<List<PostResponse>> getGroupFeed(
            @PathVariable UUID groupId,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int size,
            Principal principal) {
        UUID currentHumanId = null;
        if (principal != null) {
            User user = identityService.findByEmail(principal.getName());
            currentHumanId = user.getHuman().getId();
        }
        return ResponseEntity.ok(feedService.getFeedByGroup(groupId, currentHumanId, page, size));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        Post post = feedService.createPost(user.getHuman().getId(), request.content(), request.imageUrl(), request.postType(), request.groupId(), user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable UUID id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        boolean liked = feedService.toggleLike(id, user.getHuman().getId());
        return ResponseEntity.ok().body(new LikeToggleResponse(liked));
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<?> addComment(@PathVariable UUID id, @Valid @RequestBody CommentRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        Comment comment = feedService.addComment(id, user.getHuman().getId(), request.content(), user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(CommentResponse.from(comment));
    }

    @PostMapping("/comentarios/{id}/like")
    public ResponseEntity<?> toggleCommentLike(@PathVariable UUID id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        boolean liked = feedService.toggleCommentLike(id, user.getHuman().getId());
        return ResponseEntity.ok().body(new LikeToggleResponse(liked));
    }

    public record PostRequest(
            @NotBlank @jakarta.validation.constraints.Size(max = 3000, message = "O post não pode exceder 3000 caracteres.") String content,
            String imageUrl,
            String postType,
            UUID groupId
    ) {}

    public record CommentRequest(
            @NotBlank String content
    ) {}

    public record LikeToggleResponse(
            boolean liked
    ) {}
}
