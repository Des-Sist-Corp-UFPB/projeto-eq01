package br.ufpb.dsc.nexushub.model.people.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.dto.PostResponse;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import br.ufpb.dsc.nexushub.model.people.repository.*;
import br.ufpb.dsc.nexushub.model.people.service.impl.FeedServiceImpl;
import br.ufpb.dsc.nexushub.model.administration.repository.BannedWordRepository;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos da Rede Social e Feed (FeedService & HumanService)")
public class FeedAndHumanServiceMetodosTest {

    private PostRepository postRepository = mock(PostRepository.class);
    private LikeRepository likeRepository = mock(LikeRepository.class);
    private CommentRepository commentRepository = mock(CommentRepository.class);
    private HumanRepository humanRepository = mock(HumanRepository.class);
    private CommentLikeRepository commentLikeRepository = mock(CommentLikeRepository.class);
    private BannedWordRepository bannedWordRepository = mock(BannedWordRepository.class);

    private FeedServiceImpl feedService;

    @BeforeEach
    void setup() {
        feedService = new FeedServiceImpl(
                postRepository, likeRepository, commentRepository, humanRepository, commentLikeRepository, bannedWordRepository
        );
    }

    @Test
    @DisplayName("Metodo createPost: Deve criar uma postagem com sucesso e retornar o objeto Post cadastrado")
    void testCreatePost_Sucesso() {
        UUID humanId = UUID.randomUUID();
        Human author = mock(Human.class);
        when(humanRepository.findById(humanId)).thenReturn(Optional.of(author));
        when(bannedWordRepository.findAll()).thenReturn(List.of());
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post post = feedService.createPost(humanId, "Olá comunidade NexusHub!", "GERAL", null);

        assertNotNull(post, "O metodo createPost nao deve retornar nulo");
        assertEquals("Olá comunidade NexusHub!", post.getContent(), "O conteudo do post retornado deve ser igual ao enviado");
        assertEquals(author, post.getAuthor(), "O autor do post deve corresponder ao id retornado pelo repositorio");
        verify(postRepository).save(any(Post.class));
    }

    @Test
    @DisplayName("Metodo createPost: Deve lancar IllegalArgumentException caso o autor nao exista")
    void testCreatePost_AutorInexistente() {
        UUID invalidId = UUID.randomUUID();
        when(humanRepository.findById(invalidId)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            feedService.createPost(invalidId, "Conteudo", "GERAL", null);
        });

        assertTrue(ex.getMessage().contains("Autor não encontrado"), "A mensagem de excecao deve indicar que o autor nao foi encontrado");
    }

    @Test
    @DisplayName("Metodo toggleLike: Deve alternar o status de curtida do usuario no post")
    void testToggleLike_AlternarCurtida() {
        UUID postId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Post post = mock(Post.class);
        Human human = mock(Human.class);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(humanRepository.findById(humanId)).thenReturn(Optional.of(human));
        when(likeRepository.findByPostIdAndHumanId(postId, humanId)).thenReturn(Optional.empty());

        boolean liked = feedService.toggleLike(postId, humanId);

        assertTrue(liked, "O metodo toggleLike deve retornar true quando o post for curtido");
        verify(likeRepository).save(any());
    }
}
