-- Create the "user" table
-- Stores information about individual users.
CREATE TABLE "user" (
    "userId" TEXT PRIMARY KEY,
    "username" TEXT NOT NULL,
    "hasBotStarted" BOOLEAN NOT NULL DEFAULT TRUE,
    "lang" TEXT NOT NULL DEFAULT "en"
);

-- Create the "group" table
-- Stores information about groups/chats where the bot is active.
CREATE TABLE "group" (
    "id" SERIAL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "canCreate" INTEGER NOT NULL DEFAULT 0,
    "canDelete" INTEGER NOT NULL DEFAULT 0,
    "canRename" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "lang" TEXT NOT NULL DEFAULT "en"
);

-- Create the "tag" table
-- Stores the tags created within groups.
CREATE TABLE "tag" (
    "id" BIGSERIAL PRIMARY KEY,
    "group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastTagged" TIMESTAMPTZ,
    "creatorId" TEXT NOT NULL,
    FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE,
    UNIQUE ("group_id", "name") -- A tag name should be unique within a group
);

-- Create the "subscriber" table
-- A join table to manage which users are subscribed to which tags (many-to-many).
CREATE TABLE "subscriber" (
    "userId" TEXT NOT NULL,
    "tagId" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY ("userId", "tagId"),
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE,
    FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE
);

-- Create the "admin" table
-- A join table to manage which users are admins of which groups (many-to-many).
CREATE TABLE "admin" (
    "userId" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    PRIMARY KEY ("userId", "group_id"),
    FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE
);

-- Create indexes for foreign keys to improve query performance
CREATE INDEX "idx_tag_group_id" ON "tag"("group_id");
CREATE INDEX "idx_tag_creatorId" ON "tag"("creatorId");
CREATE INDEX "idx_subscriber_userId" ON "subscriber"("userId");
CREATE INDEX "idx_subscriber_tagId" ON "subscriber"("tagId");
CREATE INDEX "idx_admin_userId" ON "admin"("userId");
CREATE INDEX "idx_admin_group_id" ON "admin"("group_id");