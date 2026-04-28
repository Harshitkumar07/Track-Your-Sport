# Arena Security Specification

## Data Invariants
1. A **Thread** must always belong to a valid **Community**.
2. A **Message** must always belong to a valid **Thread**.
3. Users cannot spoof their `uid` or `authorId`.
4. Timestamps (`createdAt`, `lastMessageAt`) must be server-generated.
5. Message content and thread titles have strict size limits to prevent resource exhaustion.

## The Dirty Dozen (Attack Payloads)

1. **Identity Spoofing**: `createThread` with `authorId: "someone_else"`.
2. **Community Injection**: `createThread` with `communityId: "non_existent_sport"`.
3. **Shadow Update**: `updateThread` adding `isVerified: true` field.
4. **Time Spoofing**: `createMessage` with `createdAt: 1970-01-01`.
5. **Payload Bloat**: `createMessage` with `content` > 10,000 characters.
6. **Orphaned Message**: `createMessage` in a non-existent thread.
7. **Privilege Escalation**: `updateUser` of another user's profile.
8. **Thread Stealing**: `updateThread` changing the `authorId`.
9. **Cross-Community Writing**: `createThread` at path `/communities/A/threads/T` with `communityId: 'B'`.
10. **State Corruption**: `updateThread` setting `messageCount: -1`.
11. **Shadow Key Update**: `updateUser` with extra fields not in schema.
12. **Unauthenticated Read**: Attempting to `list` threads without being signed in.

## Test Strategy (Phase 4)
- All "Dirty Dozen" payloads must return `PERMISSION_DENIED`.
- Authenticated owners can modify only the subset of fields allowed by `affectedKeys().hasOnly()`.
- Thread `messageCount` increments must be accompanied by the message write (validated via `isValidThread` on update if needed, though mostly handled by `affectedKeys`).
