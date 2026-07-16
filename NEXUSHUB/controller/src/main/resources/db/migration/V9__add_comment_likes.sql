CREATE TABLE feed_comment_like (
    idlike UUID NOT NULL PRIMARY KEY,
    idcomment UUID NOT NULL CONSTRAINT fk_comment_like_comment REFERENCES feed_comment(idcomment) ON DELETE CASCADE,
    idhuman UUID NOT NULL CONSTRAINT fk_comment_like_human REFERENCES usr_human(idhuman) ON DELETE CASCADE,
    tscreated TIMESTAMP NOT NULL
);
