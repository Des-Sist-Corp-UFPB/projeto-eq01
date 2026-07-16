package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.people.domain.Testimonial;
import java.time.LocalDateTime;
import java.util.UUID;

public record TestimonialResponse(
        UUID id,
        UUID receiverId,
        UUID senderId,
        String senderName,
        String senderPhotoUrl,
        String senderUsername,
        String content,
        boolean accepted,
        LocalDateTime updatedAt
) {
    public static TestimonialResponse from(Testimonial t) {
        if (t == null) return null;
        var sender = t.getSender();
        return new TestimonialResponse(
                t.getId(),
                t.getReceiver().getId(),
                sender.getId(),
                sender.getName(),
                sender.getPhotoUrl(),
                sender.getUsername(),
                t.getContent(),
                t.isAccepted(),
                t.getUpdatedAt()
        );
    }
}
