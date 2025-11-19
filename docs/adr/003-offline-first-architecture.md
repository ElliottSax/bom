# ADR-003: Offline-First Architecture

**Date:** 2025-11-19
**Status:** Proposed
**Deciders:** Technical Lead, Mobile Squad Lead, Backend Squad Lead

## Context

Scripture study often happens in locations with poor or no internet connectivity (commute, church buildings, travel). Users expect:
- Full scripture reading offline
- Ability to create highlights/notes offline
- Seamless sync when connectivity returns
- No data loss
- Fast, reliable experience regardless of network

## Decision

We will implement an **offline-first architecture** where:
1. All data is read from and written to local storage first
2. Sync happens opportunistically in the background
3. App remains fully functional without network
4. Conflicts are resolved gracefully

**Technical Stack:**
- **Scripture Content:** SQLite database (read-only, bundled with app)
- **User Data:** PouchDB (mobile) syncing to CouchDB (server)
- **Sync Protocol:** CouchDB replication protocol (master-master)
- **Conflict Resolution:** Last-write-wins with timestamps (default), manual merge (advanced)

## Rationale

### Key Requirements:

1. **User Experience:**
   - Zero degradation in offline mode
   - Instant reads (no network latency)
   - Optimistic updates (instant writes)
   - Background sync (non-blocking)

2. **Religious Context:**
   - Spiritual study shouldn't depend on network
   - Church buildings often have poor connectivity
   - International users may have limited data
   - Reverent experience requires reliability

3. **Technical Benefits:**
   - Better performance (local-first)
   - Reduced server load
   - Natural offline support
   - Resilient to network issues

### Why Offline-First vs. Online-First:

**Online-First Problems:**
- Loading spinners disrupt study experience
- Network failures break app functionality
- Poor UX in low connectivity areas
- Server downtime affects all users

**Offline-First Benefits:**
- App works immediately, always
- Better performance perception
- Graceful degradation
- Reduced infrastructure costs

## Architecture

### Data Layers:

```
┌─────────────────────────────────────┐
│   Application Layer                 │
│   (React Native UI)                 │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│   Data Access Layer                 │
│   - Scripture Queries               │
│   - User Data CRUD                  │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│   Local Storage                     │
│   ┌─────────────┬─────────────────┐ │
│   │  SQLite     │    PouchDB      │ │
│   │ (Scripture) │  (User Data)    │ │
│   └─────────────┴─────────────────┘ │
└───────────┬─────────────────────────┘
            │
     ┌──────▼──────┐
     │   Network   │
     │  Available? │
     └──────┬──────┘
            │
     ┌──────▼──────────────────────┐
     │   Sync Engine               │
     │   - Queue Changes           │
     │   - Bidirectional Sync      │
     │   - Conflict Resolution     │
     └──────┬──────────────────────┘
            │
     ┌──────▼──────────────────────┐
     │   CouchDB (Server)          │
     │   Per-User Databases        │
     └─────────────────────────────┘
```

### Scripture Content (Read-Only):

**Storage:** SQLite database (10-50 MB)
**Strategy:** Bundled with app, rarely updated

```javascript
// Full Book of Mormon text cached locally
const db = await SQLite.openDatabase('scriptures.db');

// Instant reads, no network required
const verses = await db.executeSql(
  'SELECT * FROM verses WHERE book = ? AND chapter = ?',
  ['1-nephi', 3]
);
```

**Updates:**
- Check for scripture updates on app launch
- Download delta updates if available
- Apply updates in background

### User Data (Read-Write):

**Storage:** PouchDB (mobile) ↔ CouchDB (server)
**Strategy:** Immediate local write, background sync

```javascript
// Local database per user
const localDB = new PouchDB('user_123_data');
const remoteDB = new PouchDB('https://sync.gospellibrary.org/user_123');

// Write to local immediately (optimistic)
await localDB.put({
  _id: 'highlight_abc',
  type: 'highlight',
  verseId: '1-nephi-3-7',
  color: 'yellow',
  timestamp: Date.now()
});

// Sync automatically when online
localDB.sync(remoteDB, {
  live: true,
  retry: true
});
```

## Consequences

### Positive:

- ✅ App works instantly, offline or online
- ✅ No loading spinners for local data
- ✅ Optimistic updates feel instant
- ✅ Resilient to network issues
- ✅ Lower server costs (less API traffic)
- ✅ Better performance perceived by users
- ✅ Graceful degradation
- ✅ Data locality (privacy benefit)

### Negative:

- ❌ Increased complexity (sync engine)
- ❌ Storage required on device (~60-80 MB)
- ❌ Conflict resolution needed
- ❌ Harder to debug (distributed state)
- ❌ Initial sync can take time

### Neutral:

- 🔄 Need robust conflict resolution strategy
- 🔄 Testing offline scenarios requires discipline
- 🔄 Cache invalidation challenges

## Alternatives Considered

### Option 1: Online-First with Caching

**Approach:**
- Fetch data from API
- Cache in memory or local storage
- Fall back to cache if offline

**Pros:**
- Simpler to implement
- Familiar pattern
- Less storage required

**Cons:**
- Poor offline experience
- Loading states disrupt UX
- Network failures block app
- Cache invalidation complex
- Not truly offline-capable

**Decision:** Rejected - doesn't meet UX requirements

### Option 2: Online-Only

**Approach:**
- Always fetch from server
- No local storage

**Pros:**
- Simplest implementation
- Always fresh data
- No sync issues

**Cons:**
- Completely breaks offline
- Terrible UX in poor connectivity
- High server costs
- Unacceptable for scripture study

**Decision:** Rejected immediately

### Option 3: Offline-First with Custom Sync

**Approach:**
- SQLite for all data
- Custom sync protocol
- Manual conflict resolution

**Pros:**
- Full control over sync
- Optimized for use case
- No dependencies

**Cons:**
- Significant development effort
- Reinventing solved problem
- Complex to get right
- High maintenance

**Decision:** Rejected - PouchDB/CouchDB solves this

## Implementation Details

### Sync Strategy:

**Triggers:**
- App startup
- Network reconnection
- User-initiated ("Sync Now" button)
- Periodic background (every 15 minutes)
- After creating highlight/note

**Sync Phases:**
1. **Detect Changes:** Query local DB for `needs_sync = true`
2. **Upload Changes:** POST to server API
3. **Download Updates:** GET latest from server
4. **Merge:** Apply updates to local DB
5. **Resolve Conflicts:** Last-write-wins or manual
6. **Mark Synced:** Update `needs_sync = false`

### Conflict Resolution:

**Default: Last-Write-Wins**
```javascript
function resolveConflict(local, remote) {
  if (local.timestamp > remote.timestamp) {
    return local;
  }
  return remote;
}
```

**Advanced: User Choice (for notes)**
```javascript
if (hasConflict(note)) {
  showConflictDialog({
    local: localVersion,
    remote: remoteVersion,
    onResolve: (chosen) => {
      saveResolution(chosen);
    }
  });
}
```

### Data Partitioning:

**Per-User Databases:**
- Server: `user_[userId]_data`
- Local: `user_data`

**Benefits:**
- Security isolation
- Easy to sync (entire DB)
- Simpler permissions
- Easier to delete user data (GDPR)

### Performance Optimizations:

1. **Lazy Sync:**
   - Don't block UI for sync
   - Show sync indicator, allow continued use

2. **Batching:**
   - Batch multiple changes in single sync
   - Reduce network requests

3. **Compression:**
   - Compress sync payloads
   - Reduce bandwidth

4. **Incremental Sync:**
   - Only sync changes since last sync
   - Use change feed (CouchDB)

## Failure Scenarios

### Scenario 1: Offline Creation, Delete Online

**Problem:**
- User creates highlight offline
- On another device, user deletes same verse
- Devices sync - conflict

**Resolution:**
- Deletion wins (safer to lose creation than expose deleted)
- User can recreate if needed

### Scenario 2: Concurrent Edits

**Problem:**
- User edits note on device A
- User edits same note on device B
- Both offline, then sync

**Resolution:**
- Last-write-wins by timestamp
- Notify user of conflict
- Option to view both versions
- Future: Operational Transform for real-time collab

### Scenario 3: Sync Failure

**Problem:**
- Network issues prevent sync
- Changes pile up locally

**Resolution:**
- Exponential backoff retry
- Queue changes indefinitely
- Manual "Sync Now" available
- Clear sync status indicator

## Testing Strategy

1. **Network Simulation:**
   - Test with slow 3G
   - Test with intermittent connectivity
   - Test complete offline

2. **Conflict Scenarios:**
   - Unit tests for conflict resolution
   - Integration tests for sync
   - Manual testing with 2+ devices

3. **Data Integrity:**
   - Verify no data loss
   - Check sync correctness
   - Validate conflict resolution

## Success Criteria

- ✅ 100% of features work offline (except AI chat, search suggestions)
- ✅ Sync success rate >99%
- ✅ Zero data loss in sync
- ✅ Conflicts resolved correctly 100% of time
- ✅ Sync completes in <5 seconds for typical session
- ✅ App startup time not affected by sync status

## Security Considerations

1. **Local Data Encryption:**
   - SQLite: Encrypted database (SQLCipher)
   - PouchDB: Encrypted storage adapter
   - Sensitive notes encrypted before storage

2. **Sync Authentication:**
   - JWT tokens for sync endpoint
   - Per-user database access control
   - TLS for all network traffic

3. **Data Leakage:**
   - Local storage encrypted
   - Proper deletion on account removal
   - No sensitive data in logs

## Migration Path

If offline-first proves problematic:

1. Can switch to cached online-first
2. Keep local storage, change sync strategy
3. Reduce reliance on PouchDB, use simpler cache
4. Not locked in to CouchDB (can change backend)

## Maintenance Considerations

- Monitor sync success rates
- Alert on high conflict rates
- Track sync performance
- Regular conflict resolution review

## References

- [Offline First](http://offlinefirst.org/)
- [PouchDB Documentation](https://pouchdb.com/)
- [CouchDB Replication Protocol](https://docs.couchdb.org/en/stable/replication/protocol.html)
- Technical Implementation Guide: Offline-First Architecture section

## Notes

- Start simple (last-write-wins)
- Evolve to more sophisticated conflict resolution as needed
- Monitor real-world sync patterns
- Adjust strategy based on data

**Last Updated:** 2025-11-19
**Next Review:** 2026-02-19 (after Phase 1 Sprint 7)
