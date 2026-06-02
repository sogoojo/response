const DESIGN_REFERENCES = {
  "dropbox": {
    keywords: ["dropbox", "file storage", "file sharing", "file sync", "cloud storage", "google drive", "onedrive", "box"],
    category: "storage",
    fr: [
      "Upload files from any device",
      "Download files from any device",
      "Share files with other users",
      "Auto-sync files across devices"
    ],
    nfr: [
      "High availability (AP over CP)",
      "Support files up to 50GB",
      "Secure and reliable with recovery",
      "Fast upload/download/sync (low latency)"
    ],
    entities: [
      { name: "File", desc: "Raw uploaded data" },
      { name: "FileMetadata", desc: "Properties: id, name, size, mimeType, uploadedBy, status, chunks[]" },
      { name: "User", desc: "System participant with auth" },
      { name: "SharedFiles", desc: "Mapping table: userId → fileId" }
    ],
    apis: [
      "POST /files/presigned-url → get upload URL",
      "GET /files/{fileId}/presigned-url → get download URL",
      "POST /files/{fileId}/share → share with users",
      "GET /files/changes?since={timestamp} → sync changes",
      "PATCH /files/{fileId}/chunks → update chunk status"
    ],
    hld: {
      components: [
        "Client Apps (web/mobile/desktop) with local file monitoring",
        "Load Balancer & API Gateway (SSL, rate limiting)",
        "File Service (metadata CRUD, presigned URL generation)",
        "File Metadata DB (DynamoDB) with userId index",
        "S3 Blob Storage (multipart upload, encryption at rest)",
        "CDN (CloudFront) for geographic caching",
        "WebSocket + polling for real-time sync"
      ],
      diagram: "graph LR\n  Client[Client Apps] --> LB[Load Balancer]\n  LB --> FS[File Service]\n  FS --> MetaDB[(Metadata DB)]\n  FS --> S3[(S3 Storage)]\n  S3 --> CDN[CDN / CloudFront]\n  FS -.->|WebSocket| Client"
    },
    deepDives: [
      { topic: "Large File Support", details: "Chunked uploads (5-10MB pieces), SHA-256 fingerprinting for dedup/resume, multipart upload with presigned URLs per chunk, Content-Defined Chunking for delta sync.",
        diagram: "graph LR\n  Client[Client] -->|1. chunk file + fingerprint| API[File Service]\n  API -->|2. create multipart upload| S3[(S3)]\n  S3 -->|3. presigned URLs per chunk| Client\n  Client -->|4. upload chunks in parallel| S3\n  Client -->|5. PATCH chunk status + ETag| API\n  API -->|6. verify via ListParts| S3\n  API -->|7. CompleteMultipartUpload| S3" },
      { topic: "Upload/Download Speed", details: "CDN for downloads, parallel chunk uploads, adaptive chunk sizing, client-side compression before encryption (skip media files).",
        diagram: "graph LR\n  Upload[Upload Path] --> Compress[Compress if text] --> Encrypt[Encrypt] --> S3[(S3)]\n  Download[Download Path] --> CDN[CDN Edge]\n  CDN -->|cache miss| S3\n  CDN -->|Range requests| Client[Client]\n  Client -->|parallel chunks| CDN" },
      { topic: "File Security", details: "HTTPS in transit, S3 encryption at rest, signed URLs with 5-min expiry, signature verification at CDN edge.",
        diagram: "graph LR\n  Client[Client] -->|request download| FS[File Service]\n  FS -->|generate signed URL| Client\n  Client -->|signed URL| CDN[CloudFront]\n  CDN -->|verify signature + expiry| Check{Valid?}\n  Check -->|Yes| Content[Serve File]\n  Check -->|No| Deny[403 Denied]" }
    ]
  },

  "bitly": {
    keywords: ["bitly", "url shortener", "short url", "link shortener", "tinyurl", "url shortening"],
    category: "web",
    fr: [
      "Submit long URLs, receive shortened versions",
      "Optional custom alias",
      "Optional expiration date",
      "Access original URLs via shortened versions"
    ],
    nfr: [
      "Uniqueness: each short code → one long URL",
      "Redirection under 100ms",
      "99.99% uptime (AP over CP)",
      "1B shortened URLs, 100M DAU, 1000:1 read-to-write ratio"
    ],
    entities: [
      { name: "ShortURL", desc: "Short code (~8 bytes), long URL (~100 bytes), timestamps, custom alias, expiration" },
      { name: "User", desc: "Creator of shortened URL" }
    ],
    apis: [
      "POST /urls {long_url, custom_alias?, expiration?} → {short_url}",
      "GET /{short_code} → 302 redirect to original URL"
    ],
    hld: {
      components: [
        "Write Service (URL shortening, validation, dedup)",
        "Read Service (redirect handling, cache-first)",
        "Redis (atomic counter for code generation, caching)",
        "PostgreSQL/DynamoDB (URL mapping storage, ~500GB for 1B URLs)",
        "CDN / Edge Workers (redirect at edge for popular codes)"
      ],
      diagram: "graph LR\n  Client[Client] --> LB[Load Balancer]\n  LB --> WS[Write Service]\n  LB --> RS[Read Service]\n  WS --> Redis[(Redis Counter)]\n  WS --> DB[(URL Database)]\n  RS --> Cache[(Redis Cache)]\n  Cache -.->|miss| DB\n  RS --> CDN[CDN Edge]"
    },
    deepDives: [
      { topic: "Short Code Generation", details: "Counter-based approach: Redis INCR with batching (1000 per batch), base62 encoding, XOR with secret key to prevent enumeration. Hash approach: SHA-256 + base62, collision retry with salt",
        diagram: "graph LR\n  App[Write Service] -->|INCR batch 1000| Redis[(Redis Counter)]\n  Redis -->|next ID| App\n  App -->|base62 encode| Code[Short Code]\n  App -->|XOR secret key| Safe[Non-enumerable Code]\n  Safe -->|store mapping| DB[(URL Database)]" },
      { topic: "Read Performance", details: "B-tree index on short code as primary key, Redis/Memcached LRU cache, CDN edge caching with Cloudflare Workers for redirect at edge",
        diagram: "graph LR\n  Client[Client] -->|short.url/abc| CDN[CDN Edge]\n  CDN -->|cache hit| Redirect[302 Redirect]\n  CDN -->|cache miss| Cache[(Redis LRU)]\n  Cache -->|miss| DB[(URL DB / B-tree index)]\n  DB --> Cache\n  Cache --> CDN" },
      { topic: "Scalability", details: "Separate read/write services for independent scaling, counter batching reduces Redis pressure, multi-region with disjoint counter ranges",
        diagram: "graph LR\n  Region1[Region 1: IDs 0-500M] --> WS1[Write Service]\n  Region2[Region 2: IDs 500M-1B] --> WS2[Write Service]\n  WS1 --> DB1[(DB Shard 1)]\n  WS2 --> DB2[(DB Shard 2)]\n  RS[Read Service x N] --> Cache[(Redis Cache)]\n  Cache --> DB1\n  Cache --> DB2" }
    ]
  },

  "gopuff": {
    keywords: ["gopuff", "local delivery", "instant delivery", "doordash", "instacart", "grocery delivery", "food delivery"],
    category: "delivery",
    fr: [
      "Query item availability by location (deliverable in 1 hour)",
      "Order multiple items simultaneously"
    ],
    nfr: [
      "Availability queries under 100ms",
      "Strongly consistent ordering (no double-purchase)",
      "10K distribution centers, 100K items",
      "10M orders per day"
    ],
    entities: [
      { name: "Inventory", desc: "Physical item instance at specific DC with quantity" },
      { name: "Item", desc: "Product type (catalog entry)" },
      { name: "DistributionCenter", desc: "Physical location with lat/long" },
      { name: "Order", desc: "Collection of purchased inventory items" }
    ],
    apis: [
      "GET /availability?lat={}&long={}&filters={} → available items with quantities",
      "POST /orders {items[], location} → order confirmation or error"
    ],
    hld: {
      components: [
        "Availability Service (read path)",
        "Nearby Service (DC proximity via travel time)",
        "Order Service (atomic transactions)",
        "PostgreSQL (partitioned by region, read replicas)",
        "Redis Cache (1-min TTL for availability)"
      ],
      diagram: "graph LR\n  Client[Client] --> AS[Availability Service]\n  AS --> NS[Nearby Service]\n  AS --> Cache[(Redis Cache)]\n  Cache -.->|miss| DB[(PostgreSQL)]\n  Client --> OS[Order Service]\n  OS --> DB"
    },
    deepDives: [
      { topic: "Travel Time", details: "Sync DCs to memory every 5 min, prune by 60-mile radius, query travel time API only for candidates",
        diagram: "graph LR\n  DC[Distribution Centers] -->|sync every 5min| Mem[In-Memory Store]\n  Order[New Order] --> Prune[Prune by 60mi radius]\n  Prune --> Candidates[Candidate DCs]\n  Candidates -->|query| TravelAPI[Travel Time API]\n  TravelAPI --> Best[Select Fastest DC]" },
      { topic: "Scaling Reads", details: "20K QPS for availability. Redis cache with 1-min TTL, PostgreSQL partitioning by region (first 3 zip digits), read replicas for availability, leader for orders",
        diagram: "graph LR\n  Client[Client] --> Cache[(Redis 1-min TTL)]\n  Cache -->|miss| Replica[(Read Replica)]\n  Replica --> Leader[(Leader DB)]\n  Leader -->|partitioned by zip prefix| P1[Partition 100-199]\n  Leader --> P2[Partition 200-299]\n  Leader --> P3[Partition 300-399]" },
      { topic: "Order Consistency", details: "Single atomic PostgreSQL transaction: check all items > 0, create order, update inventory status — ACID prevents double-booking",
        diagram: "graph LR\n  Client[Client] --> OS[Order Service]\n  OS -->|BEGIN TX| DB[(PostgreSQL)]\n  DB --> Check{All items > 0?}\n  Check -->|Yes| Create[Create Order]\n  Create --> Update[Update Inventory]\n  Update --> Commit[COMMIT]\n  Check -->|No| Rollback[ROLLBACK]" }
    ]
  },

  "ticketmaster": {
    keywords: ["ticketmaster", "ticket booking", "event booking", "concert tickets", "seat reservation", "booking system"],
    category: "booking",
    fr: [
      "View events",
      "Search for events",
      "Book tickets to events"
    ],
    nfr: [
      "Availability for search, consistency for booking (no double-booking)",
      "Handle 10M users for one event",
      "Low latency search (<500ms)",
      "100:1 read-to-write ratio"
    ],
    entities: [
      { name: "Event", desc: "Date, description, type, performer" },
      { name: "Venue", desc: "Address, capacity, seat map (JSON)" },
      { name: "Ticket", desc: "Event, seat details, price, status (available/reserved/booked), bookingId" },
      { name: "Booking", desc: "User, ticket list, total price, status (in-progress/confirmed)" },
      { name: "Performer", desc: "Name, description, profile" }
    ],
    apis: [
      "GET /events/:eventId → Event & Venue & Performer & Tickets",
      "GET /events/search?keyword=&start=&end=&page= → Event[]",
      "POST /bookings/:eventId {ticketIds[], paymentDetails} → bookingId"
    ],
    hld: {
      components: [
        "API Gateway (routing, auth, rate limiting)",
        "Event Service (view requests)",
        "Search Service (Elasticsearch for full-text search)",
        "Booking Service (reservations, payments)",
        "PostgreSQL (ACID transactions for bookings)",
        "Redis (distributed locks with TTL for seat reservation)",
        "Stripe (external payment processing)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> ES[Event Service]\n  GW --> SS[Search Service]\n  GW --> BS[Booking Service]\n  ES --> DB[(PostgreSQL)]\n  SS --> ELS[(Elasticsearch)]\n  BS --> Redis[(Redis Locks)]\n  BS --> DB\n  BS --> Stripe[Stripe]"
    },
    deepDives: [
      { topic: "Ticket Reservations", details: "Redis distributed lock with TTL (10 min): SET NX EX for atomic lock, auto-expires without cron. Ticket table stays simple (available/booked). Multi-ticket: Lua script for atomicity",
        diagram: "graph LR\n  User[User] -->|1. reserve| BS[Booking Service]\n  BS -->|2. SET NX EX 600| Redis[(Redis Lock)]\n  Redis -->|locked| BS\n  BS -->|3. process payment| Stripe[Stripe]\n  Stripe -->|success| BS\n  BS -->|4. mark booked| DB[(Ticket DB)]\n  Redis -->|auto-expire 10min| Free[Release Lock]" },
      { topic: "Scaling Search", details: "Elasticsearch with inverted indexes, CDC from PostgreSQL, fuzzy search for typos. Cache event details with long TTL. CDN for edge caching",
        diagram: "graph LR\n  DB[(PostgreSQL)] -->|CDC| ES[(Elasticsearch)]\n  Client[Client] -->|search query| SS[Search Service]\n  SS --> ES\n  SS --> Cache[(Redis Cache)]\n  Cache --> CDN[CDN Edge]" },
      { topic: "High Demand Events", details: "Virtual waiting queue: Redis sorted set by timestamp, SSE/WebSocket for position updates, dequeue users periodically, check admitted set before allowing booking",
        diagram: "graph LR\n  Users[10K Users] -->|join queue| QS[Queue Service]\n  QS -->|ZADD timestamp| Queue[(Redis Sorted Set)]\n  QS -->|SSE position updates| Users\n  Cron[Dequeue Timer] -->|ZPOPMIN batch| Queue\n  Cron -->|add to admitted set| Admitted[(Redis Set)]\n  User2[Admitted User] -->|check membership| Admitted\n  Admitted -->|allowed| BS[Booking Service]" }
    ]
  },

  "fb-news-feed": {
    keywords: ["news feed", "facebook feed", "social feed", "timeline", "activity feed", "twitter feed", "x feed"],
    category: "social",
    fr: [
      "Create posts",
      "Friend/follow people",
      "View feed in reverse chronological order",
      "Page through feed"
    ],
    nfr: [
      "High availability (up to 1 min staleness OK)",
      "Post and view under 500ms",
      "2 billion users",
      "Unlimited follows"
    ],
    entities: [
      { name: "User", desc: "System individual" },
      { name: "Follow", desc: "Uni-directional relationship" },
      { name: "Post", desc: "User content with timestamp" },
      { name: "PrecomputedFeed", desc: "Cached 200 posts per user" }
    ],
    apis: [
      "POST /posts {content} → {postId}",
      "PUT /users/{id}/follow",
      "GET /feed?pageSize=&cursor= → {items: Post[], nextCursor}"
    ],
    hld: {
      components: [
        "Post Service → DynamoDB Posts table",
        "Follow Service → DynamoDB Follow table with GSI",
        "Feed Service → PrecomputedFeed table",
        "SQS + Async Workers (fan-out on write)",
        "Redis cache (replicated for viral posts)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> PS[Post Service]\n  GW --> FS[Follow Service]\n  GW --> FeedS[Feed Service]\n  PS --> PostDB[(Posts DB)]\n  PS --> SQS[SQS Queue]\n  SQS --> Workers[Async Workers]\n  Workers --> FeedDB[(Feed Cache)]\n  FeedS --> FeedDB\n  FeedS --> Cache[(Redis Cache)]"
    },
    deepDives: [
      { topic: "Fan-out on Write", details: "PrecomputedFeed table: 200 post IDs per user, O(1) lookup. Async workers via SQS prepend new posts to follower feeds. Storage: 2KB/user × 2B = 4TB",
        diagram: "graph LR\n  Author[Author Posts] --> PS[Post Service]\n  PS --> SQS[SQS Queue]\n  SQS --> W1[Worker 1]\n  SQS --> W2[Worker 2]\n  W1 -->|prepend postId| Feed1[(User A Feed)]\n  W2 -->|prepend postId| Feed2[(User B Feed)]\n  Reader[Reader] -->|O-1 lookup| Feed1" },
      { topic: "High-Follower Users", details: "Hybrid feeds: flag high-follower accounts as not-precomputed, merge at read time. Avoids writing to millions of feeds per celebrity post",
        diagram: "graph LR\n  Celebrity[Celebrity Post] -->|skip fan-out| PostDB[(Posts DB)]\n  Reader[Reader] --> FeedS[Feed Service]\n  FeedS -->|precomputed| FeedDB[(Feed Cache)]\n  FeedS -->|fetch celebrity posts| PostDB\n  FeedS -->|merge + rank| Reader" },
      { topic: "Viral Posts / Hot Keys", details: "Replicated Redis cache (not sharded) — each instance serves any post ID. Load balancer spreads viral post traffic across N instances",
        diagram: "graph LR\n  LB[Load Balancer] --> R1[(Redis Replica 1)]\n  LB --> R2[(Redis Replica 2)]\n  LB --> R3[(Redis Replica 3)]\n  R1 -->|same viral post| Client1[Client]\n  R2 -->|same viral post| Client2[Client]\n  R3 -->|same viral post| Client3[Client]" }
    ]
  },

  "tinder": {
    keywords: ["tinder", "dating app", "matching", "swipe", "bumble", "hinge", "dating platform"],
    category: "matching",
    fr: [
      "Create profile with preferences and max distance",
      "View stack of potential matches",
      "Swipe right/left on profiles",
      "Match notification on mutual swipe"
    ],
    nfr: [
      "Strong consistency for swiping (mutual match detection)",
      "20M DAU, ~100 swipes/user/day",
      "Load match stack under 300ms",
      "Never re-show previously swiped profiles"
    ],
    entities: [
      { name: "User", desc: "Profile, preferences, location" },
      { name: "Swipe", desc: "Swiping user, target user, yes/no" },
      { name: "Match", desc: "Mutual swipe connection" }
    ],
    apis: [
      "POST /profile {age_min, age_max, distance, interestedIn}",
      "GET /feed?lat=&long=&distance= → User[]",
      "POST /swipe/{userId} {decision: yes|no}"
    ],
    hld: {
      components: [
        "Profile Service → User DB",
        "Swipe Service → Cassandra (write-optimized)",
        "Redis (Lua scripts for atomic match detection)",
        "Elasticsearch/OpenSearch (geospatial feed queries)",
        "Notification Service (APNs/FCM)"
      ],
      diagram: "graph LR\n  Client[Mobile App] --> GW[API Gateway]\n  GW --> PS[Profile Service]\n  GW --> SS[Swipe Service]\n  GW --> FeedS[Feed Service]\n  PS --> UserDB[(User DB)]\n  SS --> Redis[(Redis)]\n  SS --> Cass[(Cassandra)]\n  FeedS --> ES[(Elasticsearch)]\n  SS --> Notif[Push Notifications]"
    },
    deepDives: [
      { topic: "Consistent Swiping", details: "Redis + Lua scripts: hash structure with sorted user pair key. Lua atomically checks reciprocal swipe. Archive old data to Cassandra regularly",
        diagram: "graph LR\n  U1[User A swipes right] --> SS[Swipe Service]\n  SS -->|Lua: HGET sorted pair| Redis[(Redis Hash)]\n  Redis -->|B already swiped A?| Check{Match?}\n  Check -->|Yes| Match[Create Match + Notify]\n  Check -->|No| Store[HSET swipe record]\n  Cron[Archiver] -->|old swipes| Cass[(Cassandra)]" },
      { topic: "Feed Generation", details: "Hybrid: pre-compute feeds during off-peak + Elasticsearch for fresh matches. Cache with TTL < 1 hour, refresh when user changes filters/location",
        diagram: "graph LR\n  Cron[Off-Peak Job] --> ES[(Elasticsearch)]\n  ES -->|pre-compute| Cache[(Feed Cache < 1hr TTL)]\n  User[User Opens App] --> FeedS[Feed Service]\n  FeedS --> Cache\n  FeedS -->|filter change| ES\n  ES -->|fresh query| FeedS" },
      { topic: "Avoiding Re-shown Profiles", details: "Client-side cache for recent swipes + Bloom filter for heavy swipers (false positives OK, false negatives not OK)",
        diagram: "graph LR\n  Feed[Feed Candidates] --> ClientCache{In client cache?}\n  ClientCache -->|Yes| Skip[Skip]\n  ClientCache -->|No| Bloom{In Bloom filter?}\n  Bloom -->|Probably seen| Skip\n  Bloom -->|Definitely new| Show[Show Profile]" }
    ]
  },

  "leetcode": {
    keywords: ["leetcode", "online judge", "code execution", "coding platform", "hackerrank", "codeforces", "competitive programming"],
    category: "compute",
    fr: [
      "View list of coding problems",
      "Code solutions in multiple languages",
      "Submit and get instant feedback",
      "View live competition leaderboard"
    ],
    nfr: [
      "Availability over consistency",
      "Isolation and security for user code",
      "Results within 5 seconds",
      "100K concurrent competition users"
    ],
    entities: [
      { name: "Problem", desc: "Title, question, level, tags, code stubs per language, test cases" },
      { name: "Submission", desc: "User code, execution results" },
      { name: "Leaderboard", desc: "Competition rankings by solve count/time" }
    ],
    apis: [
      "GET /problems?page=&limit= → Problem[]",
      "GET /problems/:id?language= → Problem with code stub",
      "POST /problems/:id/submit {code, language} → Submission",
      "GET /check/:submissionId → poll for results",
      "GET /leaderboard/:competitionId → ranked users"
    ],
    hld: {
      components: [
        "API Server (business logic)",
        "DynamoDB (problems, submissions)",
        "Docker containers (sandboxed code execution per language)",
        "SQS queue (buffer submissions during peaks)",
        "Redis sorted sets (real-time leaderboard)",
        "Auto-scaling container fleet"
      ],
      diagram: "graph LR\n  Client[Client + Monaco Editor] --> API[API Server]\n  API --> DB[(DynamoDB)]\n  API --> SQS[SQS Queue]\n  SQS --> Docker[Docker Containers]\n  Docker --> DB\n  Docker --> Redis[(Redis Leaderboard)]\n  API --> Redis"
    },
    deepDives: [
      { topic: "Code Execution Security", details: "Docker containers with: read-only filesystem, CPU/memory limits, 5-second timeout, disabled network, Seccomp syscall restrictions. Each submission gets isolated container",
        diagram: "graph LR\n  Sub[Submission] --> Runner[Container Runner]\n  Runner --> Docker[Docker Container]\n  Docker -->|read-only FS| RO[No writes]\n  Docker -->|CPU/mem limits| Cap[Resource capped]\n  Docker -->|5s timeout| Kill[Auto-kill]\n  Docker -->|no network| Iso[Isolated]\n  Docker -->|result| Runner" },
      { topic: "Leaderboard", details: "Redis sorted sets: ZADD for score updates, ZRANGE REV for top K. Clients poll every 5 seconds. No WebSocket needed — 5s delay acceptable",
        diagram: "graph LR\n  Result[Submission Result] -->|ZADD score| Redis[(Redis Sorted Set)]\n  Client[Client] -->|poll /leaderboard every 5s| API[API]\n  API -->|ZREVRANGE 0 99| Redis\n  Redis --> Top[Top 100 Users]" },
      { topic: "Scaling Competitions", details: "10K simultaneous submissions → ~1667 CPU cores needed. SQS queue buffers submissions, auto-scaling ECS containers pull from queue. Async: API returns immediately, client polls /check/:id",
        diagram: "graph LR\n  Users[10K Users] --> API[API Server]\n  API -->|enqueue| SQS[SQS Queue]\n  API -->|return jobId| Users\n  SQS --> ECS1[ECS Worker 1]\n  SQS --> ECS2[ECS Worker 2]\n  SQS --> ECS3[ECS Worker N]\n  ECS1 -->|result| DB[(Results DB)]\n  Users -->|poll /check/jobId| API" }
    ]
  },

  "whatsapp": {
    keywords: ["whatsapp", "messaging", "chat", "instant messaging", "telegram", "signal", "messenger", "imessage"],
    category: "messaging",
    fr: [
      "Start group chats (up to 100 participants)",
      "Send/receive messages",
      "Receive offline messages (up to 30 days)",
      "Send/receive media"
    ],
    nfr: [
      "Low latency delivery (<500ms)",
      "Guaranteed message deliverability",
      "Billions of users",
      "Minimal centralized storage",
      "Resilient against component failures"
    ],
    entities: [
      { name: "User", desc: "Account holder" },
      { name: "Chat", desc: "Conversation container (2-100 participants)" },
      { name: "Message", desc: "Content with TTL" },
      { name: "Client", desc: "Multiple devices per user" },
      { name: "Inbox", desc: "Per-client undelivered messages" }
    ],
    apis: [
      "WebSocket: createChat {participants, name} → {chatId}",
      "WebSocket: sendMessage {chatId, message, attachments} → {status, messageId}",
      "WebSocket: createAttachment {body, hash} → {attachmentId}",
      "Server push: newMessage, chatUpdate, updateLastSeen"
    ],
    hld: {
      components: [
        "L4 Load Balancer (WebSocket routing)",
        "Chat Servers (in-memory connection maps)",
        "DynamoDB (chats, messages, inbox with TTL)",
        "Redis Pub/Sub (cross-server message distribution)",
        "Blob Storage (media with presigned URLs)"
      ],
      diagram: "graph LR\n  Client[Client] --> LB[L4 Load Balancer]\n  LB --> CS1[Chat Server 1]\n  LB --> CS2[Chat Server 2]\n  CS1 <--> PubSub[(Redis Pub/Sub)]\n  CS2 <--> PubSub\n  CS1 --> DB[(DynamoDB)]\n  CS1 --> Blob[(Blob Storage)]"
    },
    deepDives: [
      { topic: "Scaling Billions", details: "Redis Pub/Sub with per-user channels (not per-chat). Consistent hashing for server assignment. Durable write before pub/sub publish. ~200M concurrent connections across hundreds of servers",
        diagram: "graph LR\n  Sender[Sender] --> CS1[Chat Server 1]\n  CS1 -->|1. write| Inbox[(Inbox Table)]\n  CS1 -->|2. PUBLISH userId| PubSub[(Redis Pub/Sub)]\n  PubSub --> CS2[Chat Server 2]\n  CS2 -->|deliver| Receiver[Receiver]\n  Hash[Consistent Hash] -.->|assign users| CS1\n  Hash -.-> CS2" },
      { topic: "Connection Failures", details: "Heartbeat pings every 10-30s. Timeout triggers reconnection and Inbox sync. Sequence numbers per chat detect gaps",
        diagram: "graph LR\n  Client[Client] -->|heartbeat every 10-30s| CS[Chat Server]\n  CS -->|timeout?| Reconnect[Client Reconnects]\n  Reconnect -->|sync from seqNum| Inbox[(Inbox Table)]\n  Inbox -->|missed messages| Client\n  Client -->|seqNum gap detected| Inbox" },
      { topic: "Message Reliability", details: "Write to Inbox table first (durable), then best-effort Pub/Sub. Periodic polling as fallback. Heartbeat piggyback for gap detection",
        diagram: "graph LR\n  Sender[Sender] --> CS[Chat Server]\n  CS -->|1. durable write| Inbox[(Inbox Table)]\n  CS -->|2. best-effort| PubSub[(Redis Pub/Sub)]\n  PubSub -->|online?| Receiver[Receiver]\n  Receiver -->|periodic poll fallback| Inbox" }
    ]
  },

  "rate-limiter": {
    keywords: ["rate limiter", "rate limiting", "throttling", "api gateway", "distributed rate limiter"],
    category: "infrastructure",
    fr: [
      "Identify clients by user ID, IP, or API key",
      "Limit HTTP requests based on configurable rules",
      "Return HTTP 429 with helpful headers when exceeded"
    ],
    nfr: [
      "Minimal latency overhead (<10ms per check)",
      "Highly available (eventual consistency OK)",
      "1M requests/second across 100M DAU"
    ],
    entities: [
      { name: "Rule", desc: "Rate limiting policy (requests per window)" },
      { name: "Client", desc: "Entity being limited (user/IP/API key)" },
      { name: "TokenBucket", desc: "Current tokens, last refill, capacity, refill rate" }
    ],
    apis: [
      "isRequestAllowed(clientId, ruleId) → {passes, remaining, resetTime}",
      "Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset"
    ],
    hld: {
      components: [
        "API Gateway (centralized rate limit check)",
        "Redis (token bucket state, Lua scripts for atomicity)",
        "Config Service (rule management)",
        "Redis Cluster (sharding by client ID)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> Redis[(Redis Cluster)]\n  GW --> App[App Servers]\n  Config[Config Service] --> GW"
    },
    deepDives: [
      { topic: "Token Bucket Algorithm", details: "Redis hash per client with tokens + last_refill. Lua script for atomic read-check-update. EXPIRE for auto-cleanup",
        diagram: "graph LR\n  Req[Request] --> GW[API Gateway]\n  GW -->|Lua script| Redis[(Redis Hash)]\n  Redis -->|tokens > 0?| Check{Allow?}\n  Check -->|Yes, decrement| Allow[Forward to Backend]\n  Check -->|No tokens| Reject[429 Too Many Requests]\n  Refill[Refill Timer] -->|add tokens| Redis" },
      { topic: "Scaling to 1M RPS", details: "Redis Cluster with consistent hashing across 10+ shards. Each shard handles ~100K ops/s. Connection pooling eliminates TCP handshake overhead",
        diagram: "graph LR\n  GW[API Gateway] --> Pool[Connection Pool]\n  Pool --> S1[(Shard 1: 100K ops/s)]\n  Pool --> S2[(Shard 2: 100K ops/s)]\n  Pool --> S3[(Shard 3: 100K ops/s)]\n  Pool --> SN[(Shard N: 100K ops/s)]\n  Hash[Consistent Hash] -.->|route clientId| Pool" },
      { topic: "Failure Mode", details: "Fail-closed: reject requests when Redis unavailable. Prevents backend overload during outages",
        diagram: "graph LR\n  Req[Request] --> GW[API Gateway]\n  GW --> Redis[(Redis)]\n  Redis -->|healthy| Check[Rate Check]\n  Check --> Backend[Backend]\n  Redis -->|down| Reject[Reject All / 503]\n  Reject -.->|protect| Backend" }
    ]
  },

  "fb-live-comments": {
    keywords: ["live comments", "live chat", "real-time comments", "live streaming comments", "twitch chat", "live video comments"],
    category: "real-time",
    fr: [
      "Post comments on live video",
      "See new comments in near-real-time",
      "Access comments posted before joining"
    ],
    nfr: [
      "Millions of concurrent videos, thousands of comments/sec/video",
      "Availability over consistency",
      "End-to-end latency under 200ms"
    ],
    entities: [
      { name: "User", desc: "Viewer or broadcaster" },
      { name: "LiveVideo", desc: "Broadcasted video stream" },
      { name: "Comment", desc: "Message on live video" }
    ],
    apis: [
      "POST /comments/:liveVideoId {message}",
      "GET /comments/:liveVideoId?cursor=&pageSize=&sort=desc"
    ],
    hld: {
      components: [
        "Comment Management Service",
        "DynamoDB (comment storage)",
        "SSE connections (server-to-client push)",
        "L7 Load Balancer (consistent hashing by videoId)",
        "Dispatcher Service (route comments to relevant servers)"
      ],
      diagram: "graph LR\n  Poster[Commenter] --> CMS[Comment Service]\n  CMS --> DB[(DynamoDB)]\n  CMS --> Dispatch[Dispatcher]\n  Dispatch --> S1[Server 1]\n  Dispatch --> S2[Server 2]\n  S1 -->|SSE| V1[Viewers]\n  S2 -->|SSE| V2[Viewers]"
    },
    deepDives: [
      { topic: "Real-Time Broadcasting", details: "SSE preferred over WebSocket (simpler, fits read-heavy pattern). L7 load balancer co-locates same-video viewers on same server",
        diagram: "graph LR\n  Commenter[Commenter] --> CMS[Comment Service]\n  CMS --> Dispatch[Dispatcher]\n  LB[L7 Load Balancer] -->|co-locate by videoId| S1[Server 1]\n  Dispatch --> S1\n  S1 -->|SSE| V1[Viewer 1]\n  S1 -->|SSE| V2[Viewer 2]" },
      { topic: "Mega-Streams (100M+ viewers)", details: "Sampling: adjust rate based on comment velocity. CDN-based pull model: ring buffer of 200 comments, snapshot to CDN every second, clients poll CDN",
        diagram: "graph LR\n  Comments[High Velocity Comments] --> Sample[Sampling Filter]\n  Sample --> Buffer[Ring Buffer: 200]\n  Buffer -->|snapshot every 1s| CDN[CDN Edge]\n  Client1[Client] -->|poll| CDN\n  Client2[Client] -->|poll| CDN\n  Client3[Client] -->|poll| CDN" },
      { topic: "Disconnections", details: "Last-Event-ID for SSE reconnection. Client-side tracking with catch-up endpoint. Replay bounded to ~5 minutes",
        diagram: "graph LR\n  Client[Client Reconnects] -->|Last-Event-ID: 42| SSE[SSE Endpoint]\n  SSE -->|replay from 42| Buffer[(5-min Buffer)]\n  Buffer --> Client\n  Client -->|catch-up| API[Catch-up Endpoint]\n  API --> Buffer" }
    ]
  },

  "fb-post-search": {
    keywords: ["post search", "facebook search", "social search", "content search", "full-text search"],
    category: "search",
    fr: [
      "Create and like posts",
      "Search posts by keyword",
      "Sort by recency or like count"
    ],
    nfr: [
      "Median query under 500ms",
      "New posts searchable within 1 minute",
      "All posts discoverable",
      "High availability"
    ],
    entities: [
      { name: "Post", desc: "Searchable content with timestamp and like count" },
      { name: "User", desc: "Post creator" },
      { name: "InvertedIndex", desc: "Keyword → post ID mapping in Redis" }
    ],
    apis: [
      "CreatePost → new post",
      "LikePost → record like",
      "SearchPosts(keyword, sortBy) → results"
    ],
    hld: {
      components: [
        "Post Service + Like Service → Ingestion Service",
        "Ingestion Service (tokenize, write to dual indexes)",
        "Redis inverted indexes (creation-time + like-count ordered)",
        "Search Service (query, aggregate, return)",
        "CDN edge caching for non-personalized results"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> PostS[Post Service]\n  GW --> SearchS[Search Service]\n  PostS --> Kafka[Kafka]\n  Kafka --> Ingest[Ingestion Service]\n  Ingest --> RedisIdx[(Redis Indexes)]\n  SearchS --> RedisIdx\n  SearchS --> CDN[CDN Cache]"
    },
    deepDives: [
      { topic: "Scaling Reads", details: "CDN edge caching + distributed Redis caching with <1 min TTL. Non-personalized results cache well",
        diagram: "graph LR\n  Client[Client] --> CDN[CDN Edge Cache]\n  CDN -->|miss| Redis[(Redis < 1min TTL)]\n  Redis -->|miss| Search[Search Service]\n  Search --> Idx[(Redis Indexes)]" },
      { topic: "Like Count Scaling", details: "Milestone-based updates (powers of 2/10) to reduce write frequency. Two-stage: approximate index + precise re-ranking",
        diagram: "graph LR\n  Like[Like Event] --> Counter[Like Counter]\n  Counter -->|milestone reached?| Check{Power of 2/10?}\n  Check -->|Yes| Update[Update Index]\n  Check -->|No| Skip[Skip index update]\n  Query[Search Query] --> Approx[Approximate Index]\n  Approx --> Rerank[Precise Re-rank]" },
      { topic: "Storage", details: "Cap keyword indexes to 1K-10K entries. Cold storage in S3 for rare keywords, lazy-load on demand",
        diagram: "graph LR\n  Idx[(Redis: Hot Keywords)] -->|capped 1K-10K| Serve[Serve Results]\n  Cold[(S3: Rare Keywords)] -->|lazy-load on demand| Idx\n  New[New Post] --> Ingest[Ingestion]\n  Ingest -->|hot keyword?| Idx\n  Ingest -->|rare keyword?| Cold" }
    ]
  },

  "top-k": {
    keywords: ["top k", "top videos", "trending", "leaderboard", "most popular", "most viewed", "ranking"],
    category: "analytics",
    fr: [
      "Query top K videos all-time (max 1000)",
      "Query tumbling windows: 1 hour, 1 day, 1 month, all-time"
    ],
    nfr: [
      "1 min max delay for view tabulation",
      "Precise results (no approximation initially)",
      "Response in tens of milliseconds",
      "700K TPS view throughput, 3.6B videos"
    ],
    entities: [
      { name: "Video", desc: "Content being viewed" },
      { name: "View", desc: "Individual view event with timestamp" },
      { name: "TimeWindow", desc: "Hour, day, month, all-time boundaries" }
    ],
    apis: [
      "GET /views/top-k?window={WINDOW}&k={K} → [{videoId, views}]"
    ],
    hld: {
      components: [
        "Kafka (view events partitioned by video ID)",
        "Flink (stream processing, hourly aggregation)",
        "PostgreSQL/TimescaleDB (view counts by time bucket)",
        "Redis (precomputed top-K cache)",
        "Cron job (cache warming before expiration)"
      ],
      diagram: "graph LR\n  Events[View Events] --> Kafka[Kafka]\n  Kafka --> Flink[Flink Processor]\n  Flink --> DB[(PostgreSQL)]\n  Flink --> Redis[(Redis Cache)]\n  Client[Client] --> API[Top-K Service]\n  API --> Redis"
    },
    deepDives: [
      { topic: "Write Throughput", details: "Shard DB by video ID (~70 shards for 10K TPS each). Flink batches individual views into hourly aggregates, reducing write frequency",
        diagram: "graph LR\n  Views[View Events] --> Kafka[Kafka]\n  Kafka --> Flink[Flink]\n  Flink -->|batch hourly aggregates| S1[(Shard 1)]\n  Flink --> S2[(Shard 2)]\n  Flink --> SN[(Shard N ~70)]" },
      { topic: "Windowed Queries", details: "Window-specific tables (LastHour, LastDay, LastMonth) with indexed views column. Single index read for serving. Flink maintains aggregates in distributed state",
        diagram: "graph LR\n  Flink[Flink] -->|maintain| Hour[(LastHour Table)]\n  Flink --> Day[(LastDay Table)]\n  Flink --> Month[(LastMonth Table)]\n  API[Query API] -->|single index read| Hour\n  API --> Day\n  API --> Month" },
      { topic: "Approximation", details: "Count-Min Sketch in Redis or Flink state. CMS.INCRBY per view, sorted sets for top 1000. Trades precision for massive throughput gain",
        diagram: "graph LR\n  View[View Event] -->|CMS.INCRBY| CMS[(Count-Min Sketch)]\n  CMS -->|estimated count| ZSet[(Redis Sorted Set)]\n  ZSet -->|ZREVRANGE 0 999| Top[Top 1000 Videos]\n  API[Client] --> Top" }
    ]
  },

  "uber": {
    keywords: ["uber", "lyft", "ride sharing", "ride hailing", "taxi", "cab", "transportation"],
    category: "location",
    fr: [
      "Input start/destination for fare estimates",
      "Request rides based on fare",
      "Match riders with nearby drivers within 1 minute",
      "Drivers accept/decline and navigate"
    ],
    nfr: [
      "Low latency matching (<1 min)",
      "Strong consistency (no double-assignment)",
      "Handle 100K requests from same location (events)"
    ],
    entities: [
      { name: "Rider", desc: "Personal info, payment, ride history" },
      { name: "Driver", desc: "Vehicle info, availability, ratings, location" },
      { name: "Fare", desc: "Pickup, destination, estimated price, ETA" },
      { name: "Ride", desc: "Links rider+driver, route, status, timestamps" },
      { name: "Location", desc: "Real-time driver lat/long/timestamp" }
    ],
    apis: [
      "POST /fare {pickupLocation, destination} → Fare",
      "POST /rides {fareId} → Ride",
      "POST /drivers/location {lat, long}",
      "PATCH /rides/:rideId {accept/deny} → Ride"
    ],
    hld: {
      components: [
        "API Gateway",
        "Ride Service (fare calc, ride lifecycle)",
        "Location Service (driver location management)",
        "Ride Matching Service (proximity-based matching)",
        "Redis with geospatial commands (GEOADD, GEOSEARCH)",
        "Notification Service (APNs/FCM)",
        "Kafka queue (ride request buffering)"
      ],
      diagram: "graph LR\n  Rider[Rider App] --> GW[API Gateway]\n  Driver[Driver App] --> GW\n  GW --> RS[Ride Service]\n  GW --> LS[Location Service]\n  RS --> Match[Matching Service]\n  LS --> GeoRedis[(Redis Geo)]\n  Match --> GeoRedis\n  Match --> Kafka[Kafka Queue]\n  Match --> Notif[Push Notifications]"
    },
    deepDives: [
      { topic: "Location Updates", details: "2M updates/sec from 10M drivers. Redis geohashing: GEOADD for location, GEOSEARCH for nearby drivers. TTL for auto-expiration. Adaptive update intervals based on speed/status",
        diagram: "graph LR\n  Driver[10M Drivers] -->|GEOADD lat lng| Redis[(Redis Geo)]\n  Rider[Rider Request] -->|GEOSEARCH radius| Redis\n  Redis --> Nearby[Nearby Drivers]\n  Driver -->|fast: every 3s| Redis\n  Driver -->|idle: every 30s| Redis\n  TTL[TTL Auto-expire] -.-> Redis" },
      { topic: "Preventing Double-Assignment", details: "Redis distributed lock with TTL (10-sec acceptance window). SET NX on driverId. Auto-expires if driver doesn't respond",
        diagram: "graph LR\n  Match[Matching Service] -->|SET NX driverId EX 10| Redis[(Redis Lock)]\n  Redis -->|locked| Notify[Push to Driver]\n  Driver[Driver] -->|accept within 10s| Accept[Confirm Ride]\n  Redis -->|expired, no response| Retry[Try Next Driver]" },
      { topic: "Peak Demand", details: "Kafka queue with FIFO + geographic partitioning. Auto-scale matching service. Durable execution (Temporal) for multi-driver retry workflow with timeout handling",
        diagram: "graph LR\n  Rides[Ride Requests] --> Kafka[Kafka: geo-partitioned]\n  Kafka --> M1[Matcher 1: Region A]\n  Kafka --> M2[Matcher 2: Region B]\n  M1 --> Temporal[Temporal Workflow]\n  Temporal -->|driver 1 timeout| Retry[Try Driver 2]\n  Retry -->|timeout| Retry2[Try Driver 3]" }
    ]
  },

  "youtube": {
    keywords: ["youtube", "video streaming", "video platform", "video upload", "netflix", "twitch", "vimeo", "video hosting"],
    category: "streaming",
    fr: [
      "Upload videos",
      "Watch/stream videos"
    ],
    nfr: [
      "High availability (AP over CP)",
      "Support large videos (10s of GBs)",
      "Low-latency streaming in bandwidth-constrained environments",
      "1M daily uploads, 100M daily views",
      "Resumable uploads"
    ],
    entities: [
      { name: "User", desc: "Uploader or viewer" },
      { name: "Video", desc: "Uploaded content" },
      { name: "VideoMetadata", desc: "Uploader, transcript URLs, storage refs" }
    ],
    apis: [
      "POST /presigned_url → upload URL for direct S3 upload",
      "GET /videos/{videoId} → VideoMetadata + manifest URL"
    ],
    hld: {
      components: [
        "Direct-to-S3 upload via presigned URLs (bypass app servers)",
        "S3 event trigger → Video Processing Service",
        "DAG-based processing: segment → transcode → manifest → complete",
        "Cassandra (video metadata, partitioned by videoId)",
        "CDN (geographic segment caching)",
        "Adaptive Bitrate Streaming (manifest-driven format selection)"
      ],
      diagram: "graph LR\n  Uploader[Upload Client] --> S3[(S3 Storage)]\n  S3 -->|event| Proc[Video Processor]\n  Proc --> S3\n  Proc --> MetaDB[(Cassandra)]\n  Viewer[Viewer] --> API[Video Service]\n  API --> MetaDB\n  API --> CDN[CDN]\n  CDN --> S3"
    },
    deepDives: [
      { topic: "Video Processing Pipeline", details: "DAG: segment into chunks → transcode each to multiple codecs in parallel → generate manifest files → mark ready. Orchestrator (Temporal) manages dependencies",
        diagram: "graph LR\n  Upload[Raw Video] --> Segment[Segment into Chunks]\n  Segment --> T1[Transcode 360p]\n  Segment --> T2[Transcode 720p]\n  Segment --> T3[Transcode 1080p]\n  T1 --> Manifest[Generate Manifest]\n  T2 --> Manifest\n  T3 --> Manifest\n  Manifest --> Ready[Mark Ready]\n  Temporal[Temporal] -.->|orchestrate| Segment" },
      { topic: "Resumable Uploads", details: "5-10MB chunks with fingerprint hashes. Track chunk status in metadata. Resume by querying progress and skipping uploaded chunks. S3 multipart upload with ETags",
        diagram: "graph LR\n  Client[Client] -->|1. init multipart| API[API]\n  API -->|uploadId| Client\n  Client -->|2. upload chunks 5-10MB| S3[(S3)]\n  Client -->|3. interrupted!| Resume[Resume]\n  Resume -->|query progress| API\n  API -->|chunks 1-5 done| Resume\n  Resume -->|upload from chunk 6| S3" },
      { topic: "Adaptive Bitrate Streaming", details: "Manifest file lists available formats per segment. Client monitors bandwidth, dynamically switches quality. CDN caches popular segments at edge",
        diagram: "graph LR\n  Client[Client] -->|fetch manifest| CDN[CDN Edge]\n  CDN --> Manifest[Manifest: 360p/720p/1080p per segment]\n  Client -->|good bandwidth| HD[1080p Segments]\n  Client -->|poor bandwidth| SD[360p Segments]\n  CDN -->|cache popular| Edge[Edge Cache]" }
    ]
  },

  "web-crawler": {
    keywords: ["web crawler", "crawler", "spider", "scraper", "search engine crawler", "googlebot", "web scraping"],
    category: "infrastructure",
    fr: [
      "Crawl web starting from seed URLs",
      "Extract and store text data for processing"
    ],
    nfr: [
      "Fault tolerant with graceful recovery",
      "Polite (robots.txt compliance, no server overload)",
      "10B pages within 5 days",
      "Scalable"
    ],
    entities: [
      { name: "URL/Metadata", desc: "URL status, depth, last crawl, content hash" },
      { name: "Domain", desc: "Last crawl time, robots.txt rules, rate limit" },
      { name: "ContentHash", desc: "Content-level dedup across URLs" }
    ],
    apis: [
      "Input: seed URLs",
      "Output: extracted text data in S3"
    ],
    hld: {
      components: [
        "Frontier Queue (SQS) for URL management",
        "Crawler Service (HTML fetching)",
        "DNS Cache",
        "Text & URL Extraction stage",
        "Metadata DB (DynamoDB)",
        "S3 Blob Storage (raw HTML + extracted text)"
      ],
      diagram: "graph LR\n  Seeds[Seed URLs] --> Queue[SQS Frontier]\n  Queue --> Crawler[Crawler Service]\n  Crawler --> DNS[DNS Cache]\n  Crawler --> S3[(S3 Storage)]\n  Crawler --> Extract[Extractor]\n  Extract --> Queue\n  Extract --> MetaDB[(Metadata DB)]"
    },
    deepDives: [
      { topic: "Fault Tolerance", details: "Multi-stage pipeline with SQS retry. Exponential backoff via ChangeMessageVisibility. Dead Letter Queue after 5 failures. Messages persist until explicitly deleted",
        diagram: "graph LR\n  URL[URL] --> SQS[SQS Queue]\n  SQS --> Crawler[Crawler]\n  Crawler -->|fail| SQS\n  SQS -->|ChangeMessageVisibility| Backoff[Exponential Backoff]\n  SQS -->|5 failures| DLQ[(Dead Letter Queue)]\n  Crawler -->|success| S3[(S3 Storage)]" },
      { topic: "Politeness", details: "robots.txt compliance per domain, Redis-based sliding window rate limiting (1 req/sec/domain), ChangeMessageVisibility to defer rate-limited URLs",
        diagram: "graph LR\n  URL[URL to Crawl] --> Robots{robots.txt OK?}\n  Robots -->|No| Skip[Skip URL]\n  Robots -->|Yes| Rate{Redis: < 1 req/s for domain?}\n  Rate -->|Yes| Fetch[Fetch Page]\n  Rate -->|No| Defer[ChangeMessageVisibility: delay]" },
      { topic: "Efficiency", details: "~8 machines at 30% bandwidth utilization. URL-level dedup via Metadata DB, content-level dedup via hash/Bloom filter. DNS caching. Max depth limit (15-20 hops) for trap prevention",
        diagram: "graph LR\n  URL[URL] --> URLDedup{Seen URL? MetadataDB}\n  URLDedup -->|Yes| Skip[Skip]\n  URLDedup -->|No| Fetch[Fetch Page]\n  Fetch --> ContentHash{Content hash in Bloom?}\n  ContentHash -->|Duplicate| Skip\n  ContentHash -->|New| Store[Store + Extract Links]\n  Store --> Depth{Depth > 15?}\n  Depth -->|Yes| Stop[Stop]\n  Depth -->|No| Queue[Re-queue links]" }
    ]
  },

  "ad-click-aggregator": {
    keywords: ["ad click", "click aggregator", "ad tracking", "click tracking", "advertising", "ad analytics"],
    category: "analytics",
    fr: [
      "Users click ads, redirect to advertiser",
      "Advertisers query click metrics with 1-min granularity"
    ],
    nfr: [
      "10K clicks/second peak",
      "Sub-second query response",
      "Fault-tolerant, no click loss",
      "Near real-time metric availability",
      "Idempotent click tracking"
    ],
    entities: [
      { name: "ClickEvent", desc: "EventId, AdId, UserId, Timestamp" },
      { name: "AggregatedMetrics", desc: "AdId, minute timestamp, unique/total clicks" },
      { name: "Impression", desc: "Unique ID per ad instance with HMAC signature" }
    ],
    apis: [
      "GET /click?adId=&impressionId= → 302 redirect",
      "GET /metrics?adId=&startTime=&endTime= → aggregated clicks"
    ],
    hld: {
      components: [
        "Click Processor (load-balanced, writes to stream)",
        "Kafka/Kinesis (partitioned by AdId)",
        "Flink/Spark Streaming (real-time aggregation)",
        "OLAP DB (Redshift/Snowflake/BigQuery)",
        "S3 Data Lake (raw events for reconciliation)",
        "Daily Spark batch job (reconciliation)"
      ],
      diagram: "graph LR\n  User[User Click] --> CP[Click Processor]\n  CP --> Kafka[Kafka]\n  Kafka --> Flink[Flink Aggregator]\n  Flink --> OLAP[(OLAP Database)]\n  Kafka --> S3[(S3 Data Lake)]\n  S3 --> Spark[Daily Reconciliation]\n  Advertiser[Advertiser] --> API[Query API]\n  API --> OLAP"
    },
    deepDives: [
      { topic: "Scaling", details: "Partition by AdId with hot shard mitigation: append random suffix (AdId:0-N), Flink strips suffix before OLAP upsert",
        diagram: "graph LR\n  Click[Click Event] -->|AdId:rand suffix| Kafka[Kafka Partitions]\n  Kafka --> F1[Flink Worker 1: AdId:0]\n  Kafka --> F2[Flink Worker 2: AdId:1]\n  F1 -->|strip suffix, aggregate| OLAP[(OLAP DB)]\n  F2 --> OLAP" },
      { topic: "Idempotency", details: "HMAC-signed impressionId per ad instance. Verify signature (microseconds), check cache for duplicate. Write to stream first, then update cache",
        diagram: "graph LR\n  Click[Click] -->|HMAC verify| Verify{Valid signature?}\n  Verify -->|No| Reject[Reject]\n  Verify -->|Yes| Dedup{In dedup cache?}\n  Dedup -->|Yes| Skip[Skip duplicate]\n  Dedup -->|No| Stream[Write to Kafka]\n  Stream --> Cache[Update dedup cache]" },
      { topic: "No Data Loss", details: "Kafka/Kinesis replication across AZs, 7-day retention. Flink checkpointing. Lambda architecture: real-time for speed + daily batch for correctness",
        diagram: "graph LR\n  Events[Click Events] --> Kafka[Kafka: 3x AZ replication]\n  Kafka --> Flink[Flink: real-time]\n  Flink -->|checkpoints| S3[(S3 State)]\n  Flink --> OLAP[(OLAP: speed layer)]\n  Kafka --> S3DL[(S3 Data Lake)]\n  S3DL --> Spark[Daily Batch Reconciliation]\n  Spark --> OLAP" }
    ]
  },

  "google-news": {
    keywords: ["google news", "news aggregator", "news feed", "rss aggregator", "content aggregation"],
    category: "aggregation",
    fr: [
      "View aggregated feed from thousands of publishers",
      "Infinite scroll through feed",
      "Click to redirect to publisher website"
    ],
    nfr: [
      "Availability over consistency",
      "Sub-200ms feed request latency",
      "30-min max publication-to-feed latency"
    ],
    entities: [
      { name: "Article", desc: "Title, summary, source, URL, timestamp" },
      { name: "Publisher", desc: "News source with RSS/API feed" },
      { name: "Category", desc: "Topic classification" }
    ],
    apis: [
      "GET /feed?category=&cursor=&pageSize= → articles with pagination"
    ],
    hld: {
      components: [
        "Article Crawler/Ingester (poll publisher RSS/APIs)",
        "Article Processing Service (categorize, deduplicate)",
        "Article Database",
        "Feed Service (cursor-based pagination)",
        "CDN (edge caching for popular feeds)"
      ],
      diagram: "graph LR\n  Publishers[Publishers] --> Crawler[Article Crawler]\n  Crawler --> Process[Processing Service]\n  Process --> DB[(Article DB)]\n  Client[Client] --> CDN[CDN]\n  CDN --> Feed[Feed Service]\n  Feed --> DB"
    },
    deepDives: [
      { topic: "Feed Latency", details: "Pre-computed feeds cached at CDN edge. Background job refreshes feeds every few minutes",
        diagram: "graph LR\n  Job[Background Job] -->|refresh every few min| FeedDB[(Feed Store)]\n  FeedDB --> CDN[CDN Edge Cache]\n  Client[Client] --> CDN\n  CDN -->|cache hit| Client" },
      { topic: "Breaking News Spikes", details: "CDN absorbs traffic spikes. Cache invalidation on breaking news updates",
        diagram: "graph LR\n  Breaking[Breaking News Update] --> Invalidate[Cache Invalidation]\n  Invalidate --> CDN[CDN Edge]\n  Users[Spike: 10x Traffic] --> CDN\n  CDN -->|absorb load| Users\n  CDN -->|miss after invalidation| Origin[Origin Server]" },
      { topic: "Pagination", details: "Cursor-based pagination for stability during continuous article ingestion",
        diagram: "graph LR\n  Client[Client] -->|cursor: article_42| API[Feed API]\n  API -->|WHERE id > 42 LIMIT 20| DB[(Article DB)]\n  DB --> API\n  API -->|next_cursor: article_62| Client" }
    ]
  },

  "yelp": {
    keywords: ["yelp", "business review", "restaurant review", "local search", "google maps", "foursquare", "tripadvisor"],
    category: "search",
    constraint: "Each user can only leave one review per business",
    fr: [
      "Search businesses by name, location (lat/long), and category",
      "View businesses and their reviews",
      "Leave reviews on businesses (mandatory 1-5 star rating + optional text)"
    ],
    nfr: [
      "Low latency search operations (<500ms)",
      "Highly available, eventual consistency is fine",
      "Scalable to 100M daily users and 10M businesses"
    ],
    entities: [
      { name: "Business", desc: "Name, description, location (lat/long), address, category, avgRating, numRatings" },
      { name: "User", desc: "Yelp user who can search and leave reviews" },
      { name: "Review", desc: "userId, businessId, rating (1-5), text (optional)" },
      { name: "Location", desc: "name, type (city/neighborhood), polygon (GeoJSON points making up the area)" }
    ],
    apis: [
      "GET /businesses?query&location&category&page → Business[] (search with pagination)",
      "GET /businesses/:businessId → Business & Review[] (view details + reviews)",
      "GET /businesses/:businessId/reviews?page= → Review[] (paginated reviews)",
      "POST /businesses/:businessId/reviews {rating, text?} → create review"
    ],
    hld: {
      components: [
        "Client (web/mobile app)",
        "API Gateway (auth, rate limiting, routing)",
        "Business Service (search + view, handles read-heavy queries)",
        "Review Service (separate service — write pattern differs from reads, crucial for scaling)",
        "Database (PostgreSQL — businesses + reviews in same DB, 10M businesses × 100 reviews = 1TB, single instance handles it)",
        "Elasticsearch (geospatial index for location, inverted index for full-text name search, B-tree index for category — synced via CDC)",
        "Locations table (name → polygon mapping from Geoapify for city/neighborhood search)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW -->|search query| BizS[Business Service]\n  GW -->|review data| RevS[Review Service]\n  BizS --> ES[(Elasticsearch)]\n  BizS --> DB[(PostgreSQL)]\n  RevS --> DB\n  RevS -->|update avgRating + numRatings| DB\n  DB -->|CDC| ES"
    },
    deepDives: [
      { topic: "Average Rating Calculation", details: "Synchronous update with optimistic locking. num_reviews column on Business table. Formula: (old_rating × num_reviews + new_rating) / (num_reviews + 1). Optimistic lock: retry if num_reviews changed. No message queue needed — only ~1 write/sec at 100M users.",
        diagram: "graph LR\n  Client[Client] --> RevS[Review Service]\n  RevS -->|1. read current avg + count| DB[(PostgreSQL)]\n  RevS -->|2. insert review| DB\n  RevS -->|3. update avg rating WHERE num_reviews unchanged| DB\n  DB -->|conflict? retry| RevS" },
      { topic: "One Review Per User", details: "Database constraint: UNIQUE(user_id, business_id). Race conditions resolved at DB level. Second concurrent write throws constraint error, handle gracefully.",
        diagram: "graph LR\n  U1[User 1] --> RevS[Review Service]\n  U2[User 2] --> RevS\n  RevS -->|INSERT review| DB[(PostgreSQL)]\n  DB -->|UNIQUE constraint| Check{Duplicate?}\n  Check -->|No| OK[201 Created]\n  Check -->|Yes| Err[409 Conflict]" },
      { topic: "Complex Search with Elasticsearch", details: "3 index types: (1) geospatial (geohash/quadtree) for location, (2) inverted index for name text search, (3) B-tree for category. Elasticsearch supports all three. Sync via CDC from PostgreSQL.",
        diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> BizS[Business Service]\n  BizS --> ES[(Elasticsearch)]\n  ES -->|geo_distance| Loc[Location Index]\n  ES -->|full-text| Name[Name Index]\n  ES -->|filter| Cat[Category Index]\n  DB[(PostgreSQL)] -->|CDC| ES" },
      { topic: "Location Search - Cities and Neighborhoods", details: "Staff-level. Radius is insufficient — neighborhoods have irregular shapes. Locations table maps name to polygon (GeoJSON from Geoapify). Use Elasticsearch geo_shape or PostGIS Geoshapes to find businesses within polygon.",
        diagram: "graph LR\n  Client[Search: Pizza in Mission SF] --> BizS[Business Service]\n  BizS -->|1. lookup| LocDB[(Locations Table)]\n  LocDB -->|polygon| BizS\n  BizS -->|2. geo_shape query with polygon| ES[(Elasticsearch)]\n  ES --> Results[Businesses in polygon]" }
    ]
  },

  "strava": {
    keywords: ["strava", "fitness tracking", "activity tracking", "running app", "cycling app", "workout tracker", "nike run club"],
    category: "tracking",
    fr: [
      "Start, pause, stop, save runs and rides",
      "Monitor route, distance, and time during activity",
      "View own and friends' completed activities"
    ],
    nfr: [
      "Availability over consistency",
      "Works offline (no network connectivity)",
      "Accurate real-time local stats",
      "10M concurrent activities"
    ],
    entities: [
      { name: "User", desc: "Profile, settings" },
      { name: "Activity", desc: "Type (RUN/RIDE), startTime, status, statusUpdateEvents (JSON), routeId, distance" },
      { name: "Route", desc: "activityId (PK), latitude, longitude, timestamp — GPS breadcrumbs" },
      { name: "Friend", desc: "userId, friendId, createdAt — bidirectional (two rows per friendship)" }
    ],
    apis: [
      "POST /activities {type: RUN|RIDE} → Activity",
      "PATCH /activities/:activityId {state: STARTED|PAUSED|COMPLETE}",
      "POST /activities/:activityId/routes {location: GPSCoordinate}",
      "GET /activities?mode={USER|FRIENDS}&page=&pageSize= → Partial<Activity>[]",
      "GET /activities/:activityId → Activity"
    ],
    hld: {
      components: [
        "Mobile App (offline-first with local storage)",
        "Activity Service (lifecycle management)",
        "GPS Data Store (time-series optimized)",
        "Social Feed Service",
        "Sync Service (batch upload on reconnect)"
      ],
      diagram: "graph LR\n  App[Mobile App] -->|sync| API[Activity Service]\n  API --> DB[(Activity DB)]\n  API --> GPS[(GPS Data Store)]\n  API --> Feed[Feed Service]\n  Feed --> Social[(Social DB)]"
    },
    deepDives: [
      { topic: "Offline Tracking", details: "Key insight: record GPS locally on client, only sync on completion/reconnect. In-memory buffer for GPS coords, persist to local storage every ~10s (Core Data iOS / Room Android). Batch upload on complete. Reduces server load 100x — no real-time pinging. Haversine formula for client-side distance calc. Status update events array for accurate elapsed time excluding pauses.",
        diagram: "graph LR\n  GPS[GPS Sensor] -->|every 2-5s| Buffer[In-Memory Buffer]\n  Buffer -->|every 10s| Local[(Local Storage)]\n  Local -->|activity complete| Batch[Batch Sync]\n  Batch -->|single request| API[Activity Service]\n  API --> DB[(Database)]\n  Buffer -->|Haversine| Distance[Distance Calc on Device]" },
      { topic: "Scaling 10M Concurrent", details: "~100M new activities/day, ~15KB per activity (600 GPS points × 24 bytes), 547.5TB/year. Shard DB by completion time (recent queries dominate). Data tiering: hot (recent) on SSD, warm (3-12 months) cheaper storage, cold (>1 year) S3. Single monolith OK — no read/write skew since client offloads most work. Horizontal scale the service, add caching if needed.",
        diagram: "graph LR\n  Client[Client: local tracking] -->|batch on complete| API[Activity Server]\n  API --> Cache[(Recent Activity Cache)]\n  API --> DB[(Database: sharded by time)]\n  DB -->|hot: SSD| Hot[Recent Activities]\n  DB -->|warm| Warm[3-12 months]\n  DB -->|cold| S3[(S3 Archive)]" },
      { topic: "Real-Time Friend Sharing", details: "Allow friends to watch your run live. Polling preferred over WebSocket/SSE — updates predictable (every 2-5s) and precision not critical. Re-introduce periodic server updates during activity while keeping local tracking. Server persists + broadcasts. Simpler than FB Live Comments — no need for pub/sub complexity.",
        diagram: "graph LR\n  Runner[Runner] -->|GPS every 2-5s| API[Activity Server]\n  API --> DB[(Database)]\n  Friend[Friend] -->|poll every 5s| API\n  API -->|latest GPS + stats| Friend\n  Runner -->|local tracking continues| Local[(Local Storage)]" },
      { topic: "Leaderboards", details: "Redis sorted sets: ZINCRBY for distance-based leaderboards, ZREVRANGE for top N. Separate sets per filter: leaderboard:run:global, leaderboard:run:USA, etc. Time-range filtering: sorted set by activityId+timestamp as score, hash with userId+distance. ZRANGEBYSCORE for time window, HMGET for distances, aggregate in-memory. Cache results with short TTL.",
        diagram: "graph LR\n  Complete[Activity Complete] -->|ZINCRBY distance| Global[(leaderboard:run:global)]\n  Complete --> Country[(leaderboard:run:USA)]\n  Client[Client] -->|ZREVRANGE 0 99| Global\n  TimeQuery[Time Filter] -->|ZRANGEBYSCORE| TimeSet[(Sorted Set: timestamp)]\n  TimeSet -->|HMGET distances| Hash[(Hash: activityId → userId,distance)]" }
    ]
  },

  "online-auction": {
    keywords: ["auction", "ebay", "bidding", "online auction", "real-time bidding"],
    category: "booking",
    fr: [
      "Post items for auction with starting price and end date",
      "Bid on items (must exceed current highest)",
      "View auction with current highest bid"
    ],
    nfr: [
      "Strong consistency for bids",
      "Real-time bid display updates",
      "Scale to 10M concurrent auctions"
    ],
    entities: [
      { name: "Auction", desc: "itemId, startTime, endTime, createdAt, startingPrice, maxBidPrice — maxBid cached on row" },
      { name: "Item", desc: "name, description, imageUrls — separate entity for reuse across auctions" },
      { name: "Bid", desc: "auctionId, price, userId, createdAt, status (accepted/rejected)" },
      { name: "User", desc: "Bidder/seller profile" }
    ],
    apis: [
      "POST /auctions {item, startDate, endDate, startingPrice} → Auction & Item",
      "POST /auctions/:auctionId/bids {Bid} → Bid",
      "GET /auctions/:auctionId → Auction & Item"
    ],
    hld: {
      components: [
        "API Gateway (auth, routing)",
        "Auction Service (CRUD for auctions/items, read-heavy)",
        "Bid Service (separate — ~100x more bids than auctions, independent scaling)",
        "PostgreSQL (auctions + bids, maxBid cached on Auction table)",
        "Kafka (durable message queue between gateway and Bid Service for fault tolerance)",
        "SSE (real-time max bid updates to viewers)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> AS[Auction Service]\n  GW -->|bids| Kafka[Kafka: partitioned by auctionId]\n  Kafka --> BS[Bid Service]\n  BS --> DB[(PostgreSQL)]\n  AS --> DB\n  BS -->|SSE via Pub/Sub| Client"
    },
    deepDives: [
      { topic: "Bid Consistency", details: "Great solution: store maxBid on Auction table (use it as cache). OCC: read auction row + maxBid, validate new bid > maxBid, UPDATE auctions SET max_bid = :new_bid WHERE id = :auction_id AND max_bid = :original_max_bid. If update affects 0 rows, retry. Avoids pessimistic locking entirely. Always store full bid history in Bids table — never just overwrite maxBid (audit trail critical for disputes).",
        diagram: "graph LR\n  Bidder[Bidder] --> BS[Bid Service]\n  BS -->|1. read Auction.maxBid| DB[(PostgreSQL)]\n  BS -->|2. validate bid > maxBid| Check{Higher?}\n  Check -->|Yes| Update[UPDATE SET max_bid WHERE max_bid = original]\n  Update -->|rows affected = 1| Write[Write Bid record]\n  Update -->|rows affected = 0| Retry[Retry from step 1]\n  Check -->|No| Reject[Reject]" },
      { topic: "Fault Tolerance", details: "Kafka message queue between API Gateway and Bid Service. Durable storage: bid safe even if Bid Service crashes. Buffers load spikes (popular auctions ending). Partition by auctionId for FIFO ordering per auction. Flow: API writes to Kafka → ack to user → Bid Service consumes at own pace. If Bid Service fails, message stays in Kafka for retry.",
        diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW -->|produce| Kafka[Kafka: partitioned by auctionId]\n  Kafka -->|ack| GW\n  GW -->|bid received| Client\n  Kafka --> BS[Bid Service]\n  BS --> DB[(PostgreSQL)]\n  BS -->|fail?| Kafka" },
      { topic: "Real-Time Bid Display", details: "SSE preferred over WebSocket (unidirectional — server pushes max bid changes). Client opens EventSource to /api/auctions/:id/bid-stream. Server maintains Set of connections per auctionId. On new accepted bid, push to all connections. Challenge: multiple SSE servers — use Redis Pub/Sub to broadcast across servers.",
        diagram: "graph LR\n  Client[Client] -->|EventSource| SSE[SSE Server]\n  SSE -->|maintain connections per auctionId| Conns[Connection Set]\n  NewBid[New Bid Accepted] --> PubSub[(Redis Pub/Sub)]\n  PubSub --> SSE1[SSE Server 1]\n  PubSub --> SSE2[SSE Server 2]\n  SSE1 -->|push maxBid| Viewers1[Viewers]\n  SSE2 -->|push maxBid| Viewers2[Viewers]" },
      { topic: "Scaling 10M Concurrent Auctions", details: "~15K bids/sec at peak (10M auctions × 100 bids / 7 days, 10x peak). Kafka handles easily. Shard PostgreSQL by auctionId — single auction's reads/writes on same shard (no scatter-gather). ~25TB storage/year (1KB auction + 500B × 100 bids). SSE scaling: Redis Pub/Sub for cross-server coordination.",
        diagram: "graph LR\n  Bids[15K bids/sec peak] --> Kafka[Kafka Partitions]\n  Kafka --> BS1[Bid Service 1]\n  Kafka --> BS2[Bid Service N]\n  BS1 --> Shard1[(DB Shard 1)]\n  BS2 --> Shard2[(DB Shard N)]\n  SSE[SSE Servers] <--> PubSub[(Redis Pub/Sub)]\n  SSE --> Clients[100M Connections]" }
    ]
  },

  "camelcamelcamel": {
    keywords: ["camelcamelcamel", "price tracking", "price history", "price alert", "price drop", "price monitor", "price comparison"],
    category: "tracking",
    fr: [
      "View price history charts for products",
      "Set price drop alerts with custom thresholds",
      "Browse and search product catalog"
    ],
    nfr: [
      "500M products tracked",
      "Price history queries under 500ms",
      "Price drop notifications within 1 hour of detection",
      "Availability over consistency (AP system)"
    ],
    entities: [
      { name: "Product", desc: "ASIN/product ID, name, category, current price, last crawled timestamp" },
      { name: "PriceRecord", desc: "productId (PK), timestamp (SK), price, seller, condition (new/used/refurbished)" },
      { name: "Alert", desc: "userId, productId, thresholdPrice, channel (email/push), status (active/triggered)" },
      { name: "User", desc: "Email, notification preferences, browser extension token" }
    ],
    apis: [
      "GET /products/:id/price-history?start=&end=&granularity= → price records for chart",
      "POST /alerts {productId, thresholdPrice, channel} → alertId",
      "GET /products/search?q= → product catalog search"
    ],
    hld: {
      components: [
        "Chrome Extension (shows price history overlay on product pages, one-click alert setup)",
        "API Service (product lookup, alert CRUD, price history queries)",
        "Crawl Scheduler (priority queue: popular products more often)",
        "Scraper Workers (fetch product pages, extract price, handle rate limiting/proxies)",
        "Price Store (time-series optimized for price history)",
        "Alert Evaluator (on price change, check matching alerts, fan-out notifications)",
        "Notification Service (email/push delivery with dedup)"
      ],
      diagram: "graph LR\n  Ext[Chrome Extension] --> API[API Service]\n  API --> PriceDB[(Price Store)]\n  API --> AlertDB[(Alert DB)]\n  Scheduler[Crawl Scheduler] --> Queue[Crawl Queue]\n  Queue --> S1[Scraper Worker 1]\n  Queue --> S2[Scraper Worker N]\n  S1 --> PriceDB\n  S1 -->|price changed| Eval[Alert Evaluator]\n  Eval --> AlertDB\n  Eval --> Notif[Notification Service]\n  Notif --> Email[Email / Push]"
    },
    deepDives: [
      { topic: "Crawling 500M Products", details: "Priority-based scheduling: hot products (high alert count, trending) every 1-4 hours, cold products every 24-48 hours. Distributed scraper workers pull from priority queue. Proxy rotation and rate limiting to avoid blocks. Chrome extension users provide real-time price signals as validation/supplement",
        subBullets: ["500M products at avg 12hr interval = ~11K products/sec crawl rate", "Priority score = alert_count × recency_weight × category_weight", "Proxy pool: rotate IPs per request, backoff on rate limits", "Extension crowdsourcing: users visiting pages = free, fresh price data"],
        diagram: "graph LR\n  Scheduler[Crawl Scheduler] -->|priority queue| Hot[Hot: every 1-4hr]\n  Scheduler --> Cold[Cold: every 24-48hr]\n  Hot --> Workers[Scraper Worker Pool]\n  Cold --> Workers\n  Workers -->|rotate| Proxies[Proxy Pool]\n  Workers --> Extract[Extract Price]\n  Extract --> PriceDB[(Price Store)]\n  Ext[Chrome Extension] -->|real-time price signal| PriceDB" },
      { topic: "Alert Evaluation & Fan-out", details: "On price change detected: publish event to Kafka partitioned by productId. Alert Evaluator consumes events, queries Alert DB for all active alerts on that product where new price ≤ threshold. Matching alerts pushed to SQS for notification delivery. Batch processing: one price change may trigger thousands of alerts",
        subBullets: ["Why Kafka? Durable, handles burst of price changes during sales events (Prime Day)", "Alert DB index: (productId, thresholdPrice) for efficient range query: WHERE productId = X AND threshold >= newPrice", "Dedup: mark alert as triggered, don't re-fire until user resets or price goes back up"],
        diagram: "graph LR\n  Change[Price Change Event] --> Kafka[Kafka: by productId]\n  Kafka --> Eval[Alert Evaluator]\n  Eval -->|WHERE threshold >= newPrice| AlertDB[(Alert DB)]\n  AlertDB -->|matching alerts| SQS[SQS]\n  SQS --> W1[Notification Worker]\n  SQS --> W2[Notification Worker]\n  W1 --> Email[Email / Push]\n  Eval -->|mark triggered| AlertDB" },
      { topic: "Price History Queries <500ms", details: "Time-series store partitioned by productId + time range. Pre-aggregate to multiple resolutions: raw (hourly data points), daily summary (min/max/avg), weekly/monthly for long-range charts. Recent data served from cache (Redis). Old data downsampled to save storage",
        subBullets: ["500M products × 365 days × 2-24 data points/day = huge dataset", "Multi-resolution: last 7 days → hourly, last 90 days → daily, beyond → weekly", "Redis cache for popular products (top 1M by alert count)", "Data tiering: hot (last 30 days in SSD), warm (1 year in HDD), cold (S3)"],
        diagram: "graph LR\n  Client[Client: price chart] --> API[API]\n  API --> Cache{Redis Cache?}\n  Cache -->|hit| Client\n  Cache -->|miss| TSDB[(Time-Series Store)]\n  TSDB -->|hourly: last 7d| API\n  TSDB -->|daily: last 90d| API\n  TSDB -->|weekly: beyond| API\n  Rollup[Rollup Job] -->|hourly→daily→weekly| TSDB" },
      { topic: "Scaling Crawl During Sales Events", details: "Prime Day / Black Friday: prices change rapidly across millions of products. Auto-scale scraper workers based on queue depth. Increase crawl frequency for products with active alerts. Circuit breaker if target site rate-limits. Backpressure: if Price Store can't keep up, slow down crawlers rather than drop data",
        subBullets: ["Queue depth monitoring: scale workers 2-10x during events", "Temporary priority boost: all products with alerts crawled every 15-30 min during sales", "Circuit breaker: if >50% requests failing, pause and retry with exponential backoff", "Kafka between scrapers and Price Store absorbs burst writes"],
        diagram: "graph LR\n  Event[Sales Event Detected] --> Boost[Boost Crawl Priority]\n  Boost --> Queue[Crawl Queue: depth spike]\n  Queue --> AutoScale[Auto-Scale Workers: 2-10x]\n  AutoScale --> S1[Scraper 1]\n  AutoScale --> SN[Scraper N]\n  S1 --> CB{Circuit Breaker}\n  CB -->|OK| Fetch[Fetch Price]\n  CB -->|rate limited| Backoff[Exponential Backoff]\n  Fetch --> Kafka[Kafka Buffer]\n  Kafka --> PriceDB[(Price Store)]" }
    ]
  },

  "instagram": {
    keywords: ["instagram", "photo sharing", "image sharing", "social media", "pinterest", "flickr"],
    category: "social",
    fr: [
      "Create posts with photos, videos, captions",
      "Follow other users",
      "See chronological feed from followed users"
    ],
    nfr: [
      "500M DAU, 100M posts/day",
      "Feed delivery under 500ms",
      "Photos up to 8MB, videos up to 4GB",
      "Fault tolerance and reliability"
    ],
    entities: [
      { name: "User", desc: "Username, profile details" },
      { name: "Post", desc: "userId, mediaS3Link, caption, createdAt, uploadStatus (pending/complete)" },
      { name: "Media", desc: "Actual bytes in S3 — photos and videos" },
      { name: "Follow", desc: "followerId (PK), followedId (SK) — unidirectional relationship" }
    ],
    apis: [
      "POST /posts {media, caption} → postId + presigned upload URL",
      "POST /follows {followedId}",
      "GET /feed?cursor=&limit= → Post[]"
    ],
    hld: {
      components: [
        "Post Service (media upload to S3, metadata to DB)",
        "Follow Service (relationship management)",
        "Feed Service (precomputed feeds)",
        "S3 (media storage with CDN)",
        "Fan-out workers (async feed updates)",
        "CDN (media delivery)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> PostS[Post Service]\n  GW --> FeedS[Feed Service]\n  PostS --> S3[(S3 Media)]\n  PostS --> DB[(Post DB)]\n  PostS --> Queue[Fan-out Queue]\n  Queue --> Workers[Workers]\n  Workers --> FeedDB[(Feed Cache)]\n  FeedS --> FeedDB\n  S3 --> CDN[CDN]"
    },
    deepDives: [
      { topic: "Feed Latency < 500ms", details: "Fan-out on read fails at scale (1000 followees × batch queries = too slow). Hybrid approach: fan-out on write for users with <100K followers (precompute into Redis feed cache), fan-out on read for celebrities (>100K followers — merge at read time). Redis stores precomputed feeds. Redis durability: AOF persistence + Sentinel for HA + Cluster for sharding.",
        diagram: "graph LR\n  Post[New Post < 100K followers] --> Queue[Message Queue]\n  Queue --> Workers[Fan-out Workers]\n  Workers -->|write postId to follower feeds| Redis[(Redis Feed Cache)]\n  Celebrity[Celebrity Post > 100K] -->|skip fan-out| PostDB[(Posts DB)]\n  Reader[Reader] --> FeedS[Feed Service]\n  FeedS -->|merge| Redis\n  FeedS -->|celebrity posts| PostDB" },
      { topic: "Media Upload & Rendering", details: "Presigned URLs for direct-to-S3 upload (bypass servers). Two approaches for metadata update: client-driven (PATCH with object_key) or server-driven (S3 event → Lambda updates metadata). Server-driven preferred for consistency. Media processing: generate multiple variants (resolutions, WebP format) via Cloudinary/Imgix. CDN serves optimized variant based on device + network conditions. Proactively warm caches for predicted viral content.",
        diagram: "graph LR\n  Client[Client] -->|POST /posts| API[Post Service]\n  API -->|presigned URL + postId| Client\n  Client -->|upload chunks| S3[(S3)]\n  S3 -->|S3 event notification| Lambda[Processing Lambda]\n  Lambda -->|resize: thumb/medium/full| S3\n  Lambda -->|update uploadStatus: complete| DB[(Post DB)]\n  Lambda -->|fan-out to followers| Queue[Message Queue]\n  S3 --> CDN[CDN: device-optimized variants]" },
      { topic: "Scaling 500M DAU", details: "Media: 100M posts/day × 2MB avg = 200TB/day, ~750PB over 10 years (S3 handles, tier to Glacier for old). Metadata: 100M × 1KB = 100GB/day. DynamoDB with partition key userId, sort key createdAt+postId. Follow table: partition key followerId, sort key followedId. Horizontally scale all microservices independently. CDN offloads media reads entirely.",
        diagram: "graph LR\n  PostS[Post Service x N] --> DB[(DynamoDB: partitioned by userId)]\n  FollowS[Follow Service x N] --> DB\n  FeedS[Feed Service x N] --> Redis[(Redis Cluster: feed cache)]\n  Media[200TB/day] --> S3[(S3)]\n  S3 -->|old media| Glacier[(Glacier)]\n  S3 --> CDN[CDN Global Edge]\n  CDN -->|serve 500M DAU| Users[Users]" }
    ]
  },

  "robinhood": {
    keywords: ["robinhood", "stock trading", "trading platform", "brokerage", "stock market", "financial trading", "etrade"],
    category: "financial",
    fr: [
      "View live stock prices",
      "Manage orders (market/limit, create/cancel)"
    ],
    nfr: [
      "Real-time price updates",
      "Order consistency (no double-execution)",
      "High availability during market hours"
    ],
    entities: [
      { name: "User", desc: "Trader account" },
      { name: "Symbol", desc: "Stock ticker (META, AAPL) with current price" },
      { name: "Order", desc: "userId, symbol, position (buy/sell), priceInCents, numShares, status (pending/submitted/filled/partially_filled/pending_cancel/cancelled/failed), externalOrderId" }
    ],
    apis: [
      "GET /subscribe?symbols=AAPL,META → SSE price stream",
      "POST /order {position, symbol, priceInCents, numShares} → Order",
      "DELETE /order/:id → {ok: true}",
      "GET /orders → Order[] (paginated)"
    ],
    hld: {
      components: [
        "Symbol Service (SSE price updates to clients, tracks Symbol → Set<userId> mapping)",
        "Symbol Price Processor (consumes exchange price feed, publishes to Redis Pub/Sub)",
        "Symbol Cache (Redis — current prices for initial load)",
        "Order Service (order lifecycle, communicates with exchange via Order Dispatch Gateway / NAT Gateway)",
        "Order Dispatch Gateway (NAT Gateway — makes exchange requests appear from small set of IPs)",
        "Trade Processor (consumes exchange trade feed, updates order status)",
        "Orders DB (PostgreSQL, partitioned by userId)",
        "External Order Metadata DB (RocksDB — maps externalOrderId → orderId, userId)"
      ],
      diagram: "graph LR\n  Client[Client] -->|SSE subscribe| SS[Symbol Service]\n  SS --> Cache[(Symbol Cache)]\n  SS <-->|Pub/Sub| Redis[(Redis)]\n  SPP[Symbol Price Processor] -->|publish| Redis\n  SPP --> Exchange[Exchange]\n  Client -->|POST /order| OS[Order Service]\n  OS --> Gateway[Order Dispatch Gateway]\n  Gateway --> Exchange\n  Exchange -->|trade feed| TP[Trade Processor]\n  TP --> OrderDB[(Orders DB)]\n  OS --> OrderDB"
    },
    deepDives: [
      { topic: "Live Price Scaling", details: "SSE from Symbol Service to clients (unidirectional — prices only flow server→client). Symbol Service tracks Symbol → Set<userId> mapping. Redis Pub/Sub for cross-server price distribution. Symbol Price Processor publishes to Redis channels per symbol. Symbol Service subscribes to Redis channels for symbols its users care about. On user disconnect, clean up subscriptions; if no users on a server care about a symbol, unsubscribe from Redis channel.",
        diagram: "graph LR\n  Exchange[Exchange] --> SPP[Symbol Price Processor]\n  SPP -->|PUBLISH per symbol| Redis[(Redis Pub/Sub)]\n  Redis --> SS1[Symbol Service 1]\n  Redis --> SS2[Symbol Service 2]\n  SS1 -->|SSE: subscribed symbols| C1[Client 1]\n  SS1 --> C2[Client 2]\n  SS1 -->|tracks Symbol → Users| Map[In-Memory Map]" },
      { topic: "Order Tracking & Updates", details: "Order DB partitioned by userId (fast user queries). Problem: Trade Processor gets externalOrderId from exchange but DB is partitioned by userId. Solution: separate key-value store (RocksDB) mapping externalOrderId → (orderId, userId). Order Service populates this on exchange submission. Trade Processor looks up mapping to find correct shard. Order states: pending → submitted → filled/partially_filled/cancelled/failed.",
        diagram: "graph LR\n  Client[Client] --> OS[Order Service]\n  OS -->|1. store pending| OrderDB[(Orders DB: partitioned by userId)]\n  OS -->|2. submit to exchange| Gateway[Order Dispatch Gateway]\n  Gateway --> Exchange[Exchange]\n  Exchange -->|externalOrderId| OS\n  OS -->|3. write mapping| KV[(RocksDB: extId → orderId,userId)]\n  Exchange -->|trade feed| TP[Trade Processor]\n  TP -->|lookup mapping| KV\n  TP -->|update order status| OrderDB" },
      { topic: "Order Consistency", details: "Critical: store order as pending BEFORE submitting to exchange. If we submit first and crash, we have an order on exchange with no record. Create flow: store pending → submit to exchange → get externalOrderId → update to submitted. Cancel flow: update to pending_cancel → cancel on exchange → update to cancelled. Clean-up job scans pending/pending_cancel orders and reconciles with exchange using clientOrderId.",
        diagram: "graph LR\n  OS[Order Service] -->|1. INSERT pending| DB[(Orders DB)]\n  OS -->|2. submit order| Exchange[Exchange]\n  Exchange -->|externalOrderId| OS\n  OS -->|3. UPDATE submitted| DB\n  OS -->|crash between 2 and 3?| Cleanup[Clean-up Job]\n  Cleanup -->|query by clientOrderId| Exchange\n  Cleanup -->|reconcile| DB" }
    ]
  },

  "google-docs": {
    keywords: ["google docs", "collaborative editing", "real-time collaboration", "shared document", "notion", "confluence"],
    category: "collaboration",
    fr: [
      "Create new documents",
      "Multiple users edit same document concurrently",
      "View each other's changes in real-time",
      "See cursor position and presence of other users"
    ],
    nfr: [
      "Low latency for edit propagation",
      "Conflict resolution for concurrent edits",
      "Scale to millions of documents"
    ],
    entities: [
      { name: "Editor", desc: "A user editing a document" },
      { name: "Document", desc: "id, title, documentVersionId — metadata separate from content" },
      { name: "Edit", desc: "A change (insert/delete) made by an editor — stored as operation" },
      { name: "Cursor", desc: "Editor's position + presence in document — ephemeral, in-memory only" }
    ],
    apis: [
      "POST /docs {title} → {docId}",
      "WS /docs/{docId} — SEND: {type: insert/delete/updateCursor, ...}, RECV: {type: update, ...}",
      "GET /docs/:id → document content"
    ],
    hld: {
      components: [
        "Document Metadata Service (CRUD, Postgres for metadata)",
        "Document Service (WebSocket endpoint, OT transform engine, in-memory doc state, cursor/presence broadcast)",
        "Document Operations DB (Cassandra — append-only ops, partitioned by documentId, ordered by timestamp)",
        "Document Metadata DB (Postgres — id, title, documentVersionId)",
        "Zookeeper (consistent hash ring for Document Service instances)"
      ],
      diagram: "graph LR\n  User[User] --> GW[API Gateway]\n  GW -->|POST /docs| MetaS[Doc Metadata Service]\n  MetaS --> MetaDB[(Metadata DB)]\n  GW -->|WebSocket| DocS[Document Service]\n  DocS -->|OT transform + persist| OpsDB[(Operations DB / Cassandra)]\n  DocS -->|query hash ring| ZK[(Zookeeper)]\n  DocS -->|broadcast edits + cursors| User"
    },
    deepDives: [
      { topic: "Scaling WebSocket Connections", details: "Consistent hash ring (via Zookeeper) to distribute Document Service instances. Each doc maps to exactly one server. Client connects to any server → server checks hash ring → redirects to correct server. All editors of same doc on same server = simple broadcast. On scale-up/down: only small fraction of connections redistribute. Challenge: must migrate both connections AND in-memory document state during rebalancing.",
        diagram: "graph LR\n  Client[Client] -->|any server| LB[Load Balancer]\n  LB --> DS1[Doc Service 1]\n  DS1 -->|check hash ring| ZK[(Zookeeper)]\n  DS1 -->|wrong server? redirect| DS2[Doc Service 2]\n  Client -->|reconnect to correct server| DS2\n  DS2 -->|broadcast edits| E1[Editor 1]\n  DS2 --> E2[Editor 2]" },
      { topic: "Storage & Compaction", details: "Operations stored in Cassandra (append-only, partitioned by documentId, ordered by timestamp). Active docs held in Document Service memory. Problem: millions of ops per doc = slow load + high memory. Solution: periodic snapshot/compact when document is idle (last client disconnects). Take all ops → compact → write as new documentVersionId → update Document Metadata DB. Only replay ops since last snapshot on load.",
        diagram: "graph LR\n  Edit[Edit] -->|append| OpsDB[(Cassandra: Operations DB)]\n  Idle[Doc goes idle] --> Compact[Compact Process]\n  Compact -->|all ops → snapshot| OpsDB\n  Compact -->|new documentVersionId| MetaDB[(Metadata DB)]\n  Load[Load Document] --> MetaDB\n  MetaDB -->|latest versionId| OpsDB\n  OpsDB -->|replay ops since snapshot| DocService[Document Service]" },
      { topic: "Collaborative Editing with OT", details: "Send individual edits (INSERT/DELETE with position), not full document. OT transforms concurrent ops so all clients converge to same state regardless of operation arrival order. Server: apply OT transforms, persist to ops DB, broadcast transformed ops to all clients. Client: also apply OT locally for immediate feedback. Both server and client OT ensures convergence even with network delays. Google Docs uses OT (not CRDTs) because it's more memory efficient and works well with centralized server.",
        diagram: "graph LR\n  UA[User A: INSERT at 5] -->|WebSocket| DS[Document Service]\n  UB[User B: DELETE at 3] -->|WebSocket| DS\n  DS -->|OT transform| Transform[Transform Engine]\n  Transform -->|transformed ops| OpsDB[(Operations DB)]\n  Transform -->|broadcast transformed| UA\n  Transform -->|broadcast transformed| UB\n  UA -->|local OT| DocA[Local Doc State]\n  UB -->|local OT| DocB[Local Doc State]" }
    ]
  },

  "distributed-cache": {
    keywords: ["distributed cache", "cache", "memcached", "redis", "caching system", "in-memory cache"],
    category: "infrastructure",
    fr: [
      "Set, get, delete key-value pairs",
      "Configure expiration time",
      "LRU eviction policy"
    ],
    nfr: [
      "Highly available (eventual consistency OK)",
      "Low latency (<10ms for get/set)",
      "1TB data, 100K requests/second"
    ],
    entities: [
      { name: "CacheEntry", desc: "Key, value (up to 1MB), TTL, last access time" },
      { name: "CacheNode", desc: "Server in the cluster, ~20GB memory each" },
      { name: "HashRing", desc: "Consistent hashing with virtual nodes for key distribution" }
    ],
    apis: [
      "SET key value [EX seconds] → OK",
      "GET key → value or null",
      "DELETE key → OK"
    ],
    hld: {
      components: [
        "Cache Client (consistent hashing to route to correct node)",
        "Cache Nodes (in-memory hash table + doubly linked list for LRU)",
        "Consistent Hash Ring (virtual nodes for even distribution)",
        "Replication (async replicas for HA)"
      ],
      diagram: "graph LR\n  App[Application] --> Client[Cache Client]\n  Client --> N1[Cache Node 1]\n  Client --> N2[Cache Node 2]\n  Client --> N3[Cache Node 3]\n  N1 -.->|async replica| N1R[Replica 1]\n  N2 -.->|async replica| N2R[Replica 2]"
    },
    deepDives: [
      { topic: "HA & Fault Tolerance", details: "Async replication to replicas. On node failure, promote replica and accept stale reads. Consistent hashing means only K/N keys remap on failure. ~50 nodes for 1TB, ~8 for 100K RPS",
        subBullets: ["Why not sync replication? Doubles latency for every write", "Failover: client detects timeout, routes to replica", "Data loss window = replication lag (typically ms)"],
        diagram: "graph LR\n  Primary[(Primary)] -->|async replicate| R1[(Replica 1)]\n  Primary --> R2[(Replica 2)]\n  Primary -->|fails!| Down[Node Down]\n  R1 -->|promote| NewPrimary[(New Primary)]\n  Client[Client] -->|stale reads OK during failover| R2" },
      { topic: "Even Key Distribution", details: "Consistent hashing with virtual nodes. Each physical node maps to 100-200 virtual nodes on ring. Adding/removing nodes only remaps K/N keys",
        subBullets: ["Without virtual nodes: uneven distribution from hash clustering", "Virtual nodes spread each server's responsibility across ring", "Rebalancing: only neighbors affected, not full cluster"],
        diagram: "graph LR\n  Key[Key] -->|hash| Ring[Hash Ring]\n  Ring --> VN1[Node A: vnode 1]\n  Ring --> VN2[Node A: vnode 2]\n  Ring --> VN3[Node B: vnode 1]\n  Remove[Remove Node B] -.->|remap only B's keys| VN1" },
      { topic: "Hot Key Reads", details: "Create copies of hot keys with suffixes (user:123#1, user:123#2, user:123#3). Client randomly picks a suffix to spread reads across nodes. Client-side caching for extremely hot keys",
        subBullets: ["Detection: track access frequency per key", "Suffix count tunable per key based on hotness", "Client-side cache: sub-ms reads, short TTL to limit staleness"],
        diagram: "graph LR\n  App[Application] --> Client[Cache Client]\n  Client -->|user:123#1| N1[(Node 1)]\n  Client -->|user:123#2| N2[(Node 2)]\n  Client -->|user:123#3| N3[(Node 3)]\n  App -->|extremely hot| LocalCache[Client-side Cache]" },
      { topic: "Hot Key Writes", details: "Write batching: buffer writes in-memory, flush every N ms. Or shard with suffixes and aggregate on read. Trade write latency for throughput",
        subBullets: ["Batching: collect increments, apply as single SET", "Suffix sharding: write to key#rand, aggregate reads across suffixes", "Connection pooling: reuse connections to reduce overhead"],
        diagram: "graph LR\n  Writes[Many Writes] --> Buffer[Write Buffer]\n  Buffer -->|flush every 50ms| Node[(Cache Node)]\n  AltWrites[Alt: Suffix Sharding] --> S1[key#1]\n  AltWrites --> S2[key#2]\n  Read[Read] -->|aggregate| S1\n  Read --> S2" },
      { topic: "Performance", details: "Connection pooling: reuse TCP connections to nodes. Request batching: pipeline multiple GET/SET into single round trip. Both reduce network overhead significantly",
        subBullets: ["Pipeline: send N requests without waiting for responses", "Connection pool: avoid TCP handshake per request", "Batch GET: single round trip for multiple keys"],
        diagram: "graph LR\n  App[Application] -->|pool of connections| Pool[Connection Pool]\n  Pool -->|pipeline: GET a, GET b, SET c| Node[(Cache Node)]\n  Node -->|batch response| Pool" }
    ]
  },

  "job-scheduler": {
    keywords: ["job scheduler", "task scheduler", "cron", "scheduled jobs", "distributed scheduler", "workflow engine"],
    category: "infrastructure",
    fr: [
      "Schedule jobs: immediately, future date, or recurring (CRON)",
      "Monitor job status and execution history"
    ],
    nfr: [
      "10K jobs/second execution capacity",
      "Execute within 2 seconds of scheduled time",
      "At-least-once execution guarantee"
    ],
    entities: [
      { name: "Job", desc: "Definition: job_id (PK), user_id, task_id, schedule (CRON or DATE), parameters" },
      { name: "Execution", desc: "Instance: time_bucket (PK, hourly), execution_time+job_id (SK), status (PENDING/IN_PROGRESS/COMPLETED/FAILED/RETRYING), attempt count" }
    ],
    apis: [
      "POST /jobs {taskId, schedule, params} → {jobId}",
      "GET /jobs/:id → job status and execution history (via GSI on user_id)"
    ],
    hld: {
      components: [
        "Scheduler Service (CRUD for jobs)",
        "Query Service (user-facing job/execution lookups)",
        "Job Store (DynamoDB: Jobs + Executions tables)",
        "Watcher (polls Executions for jobs due in ~5 min)",
        "Message Queue (SQS with delivery delay until execution_time)",
        "Workers (consume jobs, execute tasks, update status)"
      ],
      diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> Sched[Scheduler Service]\n  GW --> Query[Query Service]\n  Sched --> DB[(Job Store / DynamoDB)]\n  Query --> DB\n  Watcher[Watcher] -->|poll every 5 min| DB\n  Watcher -->|with delay| SQS[SQS]\n  SQS --> W1[Worker]\n  SQS --> W2[Worker]\n  W1 -->|update status| DB\n  W2 -->|update status| DB"
    },
    deepDives: [
      { topic: "Timely Execution (<2s)", details: "Two-layered architecture: Watcher queries Executions table for jobs due in ~5 min, pushes to SQS with DelaySeconds so messages become visible at execution time. Workers poll SQS continuously. New jobs < 5 min away go directly to SQS",
        subBullets: ["Why not just poll DB frequently? 10K jobs/sec = 20K rows per 2s query, too heavy", "SQS DelaySeconds capped at 15 min, fits our 5-min window", "Recurring jobs: on completion, compute next execution_time and insert new Execution row"],
        diagram: "graph LR\n  Watcher[Watcher] -->|query next ~5 min| DB[(Executions Table)]\n  Watcher -->|DelaySeconds until exec time| SQS[SQS]\n  NewJob[New Job < 5 min] -->|direct to SQS| SQS\n  SQS -->|visible at execution time| W[Workers]\n  W -->|execute + update status| DB" },
      { topic: "Scaling to 10K/sec", details: "DynamoDB: Jobs partitioned by job_id, Executions by time_bucket (hourly). Write sharding for hot time_bucket partitions. SQS handles 10K msg/sec natively. Workers are containers with ECS auto-scaling groups",
        subBullets: ["time_bucket = (execution_time // 3600) * 3600 — round to hour", "Hot partition fix: add write sharding suffix to time_bucket", "Workers: containers > Lambda for steady 10K/sec (cost + cold start)", "Old executions: move to S3 after 1 year"],
        diagram: "graph LR\n  Client[Client] --> GW[API Gateway]\n  GW --> Sched[Scheduler Service]\n  GW --> Query[Query Service]\n  Sched --> DB[(DynamoDB)]\n  Watcher[Watcher] -->|poll| DB\n  Watcher --> SQS[SQS]\n  SQS --> W1[Worker 1]\n  SQS --> W2[Worker 2]\n  SQS --> W3[Worker N]" },
      { topic: "At-Least-Once Execution", details: "SQS visibility timeout: message invisible to others while processing. Workers send heartbeat via ChangeMessageVisibility to extend timeout (e.g., every 15s for 30s timeout). On crash, message reappears in ~30s. After 3 retries → dead-letter queue. Tasks must be idempotent",
        subBullets: ["Visible failures: catch error, set status RETRYING, re-enqueue with exponential backoff (5s, 25s, 125s)", "Invisible failures (crash): SQS visibility timeout expires, message redelivered", "Idempotency: design jobs as 'set counter to X' not 'increment counter'"],
        diagram: "graph LR\n  SQS[SQS] -->|deliver| W[Worker]\n  W -->|heartbeat every 15s| SQS\n  W -->|success| Ack[Delete Message]\n  W -->|fail| Retry[Re-enqueue with backoff]\n  W -->|crash: timeout expires| Redeliver[Auto-Redeliver]\n  Retry -->|attempt > 3| DLQ[Dead Letter Queue]\n  Redeliver --> W2[Other Worker]" }
    ]
  },

  "payment-system": {
    keywords: ["payment", "stripe", "payment processing", "payment gateway", "checkout", "transaction", "billing"],
    category: "financial",
    fr: [
      "Merchants initiate payment requests (PaymentIntent)",
      "Users pay with credit/debit cards",
      "Merchants view payment status updates (polling + webhooks)"
    ],
    nfr: [
      "10K TPS at peak (bursty: holiday sales)",
      "Highly secure (PCI DSS compliant)",
      "No transaction data loss (durable + auditable)",
      "Financial integrity despite async payment networks"
    ],
    entities: [
      { name: "Merchant", desc: "Business identity, bank account, API keys" },
      { name: "PaymentIntent", desc: "Merchant's intention to collect amount. State machine: created → authorized → captured / canceled / refunded. Owns idempotency" },
      { name: "Transaction", desc: "Polymorphic money-movement record linked to PaymentIntent. Types: Charge, Refund, Dispute, Payout. One PaymentIntent can have multiple Transactions (retries, partial, refunds)" }
    ],
    apis: [
      "POST /payment-intents {amountInCents, currency, description} → paymentIntentId",
      "POST /payment-intents/:id/transactions {type: charge, card: {number, exp, cvc}} → transaction",
      "GET /payment-intents/:id → PaymentIntent with status (created/processing/succeeded/failed)"
    ],
    hld: {
      components: [
        "API Gateway (auth, rate limiting, routing)",
        "Payment Service (creates/manages PaymentIntents)",
        "Transaction Service (receives card details via iframe, interfaces with external payment networks)",
        "Database (PaymentIntents + Transactions + Merchants)",
        "External Payment Network (Visa, Mastercard — async, not our system)"
      ],
      diagram: "graph LR\n  Customer[Customer] --> Iframe[iFrame on Merchant Site]\n  Merchant[Merchant] --> GW[API Gateway]\n  Iframe -->|encrypted card data| GW\n  GW --> PS[Payment Service]\n  GW --> TS[Transaction Service]\n  PS --> DB[(Database)]\n  TS --> DB\n  TS --> EPN[External Payment Network]"
    },
    deepDives: [
      { topic: "Security", details: "Two concerns: (1) merchant auth — public API key + private secret key for request signing with timestamp + nonce to prevent replay. (2) Card data — iFrame served by our domain, JS SDK encrypts card with our public key before it leaves browser. Private key in HSM. Card data never touches merchant server",
        subBullets: ["Request signing: hash(method, endpoint, body, timestamp, nonce) with secret key", "iFrame isolation: card details never exist in merchant's DOM", "Encryption layers: client-side encrypt → HTTPS → HSM decrypt"],
        diagram: "graph LR\n  Customer[Customer] --> Iframe[iFrame / JS SDK]\n  Iframe -->|encrypt with public key| Encrypted[Encrypted Card Data]\n  Encrypted -->|HTTPS| GW[API Gateway]\n  GW -->|verify signature: pubKey + hash| Auth{Valid?}\n  Auth -->|Yes| TS[Transaction Service]\n  TS -->|decrypt with private key| HSM[HSM]\n  HSM --> EPN[Payment Network]" },
      { topic: "Durability & Auditability", details: "Operational DB for fast API reads + CDC (Change Data Capture) monitoring WAL to capture every state change as event. CDC → Kafka (append-only, keyed by payment_intent_id) → S3 for permanent storage. Consumers: Audit Service, Analytics, Reconciliation, Webhook Delivery",
        subBullets: ["CDC at DB level: no application code can skip audit trail", "Kafka: 3x replication, 7-30 day retention on disk, then flush to S3", "Reconstruct any payment's full history years later for compliance/disputes"],
        diagram: "graph LR\n  PS[Payment Service] --> DB[(Operational DB)]\n  DB -->|CDC / WAL monitoring| Kafka[Kafka Event Stream]\n  Kafka --> Audit[Audit Service]\n  Kafka --> Recon[Reconciliation]\n  Kafka --> Webhook[Webhook Delivery]\n  Kafka --> S3[(S3: permanent archive)]" },
      { topic: "Transaction Safety (Async Networks)", details: "Record attempt BEFORE calling network. Handle 3 outcomes: success (update status), timeout (mark timeout, trigger reconciliation), explicit failure. Reconciliation service queries network by reference ID and processes batch settlement files",
        subBullets: ["Biggest risk: double-charging. Timeout ≠ failure — payment may have succeeded at bank", "Record intention first so we never lose track of an in-flight charge", "Reconciliation: consume CDC timeout events + process daily settlement files"],
        diagram: "graph LR\n  TS[Transaction Service] -->|1. record attempt| DB[(Database)]\n  TS -->|2. call network| EPN[Payment Network]\n  EPN -->|success| Update[Update: succeeded]\n  EPN -->|timeout| Timeout[Mark: timeout]\n  EPN -->|failure| Failed[Mark: failed]\n  Timeout --> Recon[Reconciliation Service]\n  Recon -->|query by ref ID| EPN\n  Recon -->|process settlement files| EPN" },
      { topic: "Scaling to 10K TPS", details: "Stateless services scale horizontally with load balancers. Kafka: 3-5 partitions by payment_intent_id for ordering within PaymentIntent. PostgreSQL: shard by merchant_id, ~500 bytes/row = 5MB/s = 500GB/day = ~180TB/year. Data tiering: hot in DB, cold to S3",
        subBullets: ["Kafka partitioning ensures created → authorized → captured order per PaymentIntent", "DB can handle ~10K writes/sec with proper indexing + read replicas", "Old data (>1 year) to S3 for compliance without bloating operational DB"],
        diagram: "graph LR\n  LB[Load Balancer] --> PS1[Payment Service 1]\n  LB --> PS2[Payment Service N]\n  PS1 --> DB[(PostgreSQL: shard by merchant_id)]\n  DB -->|CDC| Kafka[Kafka: 3-5 partitions]\n  Kafka --> S3[(S3: cold storage)]" }
    ]
  },

  "metrics-monitoring": {
    keywords: ["metrics", "monitoring", "datadog", "prometheus", "grafana", "observability", "alerting", "dashboards"],
    category: "infrastructure",
    fr: [
      "Ingest metrics (CPU, memory, latency, custom counters) from services",
      "Query and visualize on dashboards with filters, aggregations, time ranges",
      "Define alert rules with thresholds over time windows (e.g., 'p99 > 500ms for 5m')",
      "Receive notifications when alerts fire (Slack, PagerDuty, email)"
    ],
    nfr: [
      "5M metrics/second from 500K servers (~1GB/sec raw ingestion)",
      "Dashboard queries return in seconds (even spanning weeks)",
      "Alert latency under 1 minute",
      "Highly available (eventual consistency for dashboards, reliable alerts)",
      "Handle late/out-of-order data gracefully"
    ],
    entities: [
      { name: "Label", desc: "Key-value pair attached to metric for slicing: host='server-1', region='us-east'" },
      { name: "Metric", desc: "Named measurement with labels and value at a point in time: cpu_usage{host='server-1'} = 0.75" },
      { name: "Series", desc: "Full sequence of (timestamp, value) for one specific metric + label combo. 500K servers × labels = millions of series" },
      { name: "AlertRule", desc: "Metric query + threshold + duration + notification channels" },
      { name: "Dashboard", desc: "Collection of metric visualizations/panels" }
    ],
    apis: [
      "POST /metrics/ingest {metrics: [{name, labels, value, timestamp}, ...]} → batch ingest (protobuf preferred at scale)",
      "GET /metrics/query?query=avg(cpu_usage{region='us-east'})&start=A&end=B&step=60 → time series (PromQL-like DSL)",
      "POST /alerts/rules {name, query, for, notifications[]} → create alert rule"
    ],
    hld: {
      components: [
        "Agents (on each server, buffer locally, batch send to Ingestion Service)",
        "Ingestion Service (validate metrics, publish to Kafka)",
        "Kafka (buffer between ingestion and storage, handle spikes)",
        "Ingestion Consumer (consume from Kafka, write to Time-Series DB with multi-resolution rollups)",
        "Time-Series DB (optimized for write-heavy time-series: columnar, time-partitioned)",
        "Query Service (PromQL-like DSL → storage queries, serves dashboards)",
        "Alert Service (poll alert rules from Alerts DB, query Time-Series DB to evaluate)",
        "Notification Service (grouping, dedup, silencing, escalation → Slack/PagerDuty/email)"
      ],
      diagram: "graph LR\n  Servers[500K Servers w/ Agents] --> Ingest[Ingestion Service]\n  Ingest --> Kafka[Kafka]\n  Kafka --> Consumer[Ingestion Consumer]\n  Consumer --> TSDB[(Time-Series DB)]\n  TSDB -->|rollups| TSDB\n  AlertDB[(Alerts DB)] --> AlertSvc[Alert Service]\n  AlertSvc -->|query| TSDB\n  AlertSvc -->|alert fires| NotiSvc[Notification Service]\n  NotiDB[(Noti DB)] --> NotiSvc\n  NotiSvc --> Slack[Slack]\n  NotiSvc --> Pager[PagerDuty]\n  Dashboard[Dashboard] --> QuerySvc[Query Service]\n  QuerySvc --> TSDB"
    },
    deepDives: [
      { topic: "Low-Latency Dashboard Queries", details: "Multi-resolution rollups: raw data at ingestion, pre-compute 1min/1hr/1day aggregations. Redis caching layer with query splitting: break 30-day query into cached historical chunks + fresh last-2-hour chunk. Precompute popular dashboard queries on schedule",
        subBullets: ["Query splitting: 30 days = 28 cached days + 2 hours live from DB", "Result caching: key = query + time range, TTL aligned to freshness needs", "Most dashboards don't need real-time → serve entirely from cache at sub-100ms"],
        diagram: "graph LR\n  Query[Dashboard Query: 30 days] --> Split{Split}\n  Split -->|cached historical| Redis[(Redis Cache)]\n  Split -->|last 2 hours| TSDB[(Time-Series DB)]\n  Redis --> Merge[Merge Results]\n  TSDB --> Merge\n  Rollup[Rollups: 1min→1hr→1day] --> TSDB" },
      { topic: "Alert Latency <1 min", details: "Polling approach (like Prometheus Alertmanager): Alert Service periodically grabs rules from Alerts DB, queries Time-Series DB to evaluate each. Fires event when threshold breached. Simple and battle-tested — 'alerts are just scheduled queries'",
        subBullets: ["Why not streaming? Polling is simpler, sufficient for <1 min, used by Prometheus", "Notification Service handles dedup: track alert state (firing/resolved), only notify on transitions", "Grouping: collect alerts within 30s window, group by labels, one notification per group"],
        diagram: "graph LR\n  AlertDB[(Alerts DB)] --> AlertSvc[Alert Service]\n  AlertSvc -->|every 1 min: evaluate rules| TSDB[(Time-Series DB)]\n  AlertSvc -->|breach!| Event[Alert Event]\n  Event --> NotiSvc[Notification Service]\n  NotiSvc --> Check{Already firing?}\n  Check -->|Yes| Skip[Skip: dedup]\n  Check -->|No| Group[Group + Send]\n  Group --> Slack[Slack]\n  Group --> Pager[PagerDuty]" },
      { topic: "HA During Spikes & Failures", details: "Ingestion: agents buffer locally and retry, Kafka replicates across zones, TSDB writes are idempotent. Alerting: evaluation state checkpointed, alert events written to Kafka before external notification, Notification Service retries delivery and can fail over to secondary channel",
        subBullets: ["Key principle: never let in-flight data disappear. Degrade freshness, not correctness", "Meta-monitoring: monitor the monitoring system with a separate, simple watchdog", "Don't use the same monitoring system to monitor itself — use independent health checks"],
        diagram: "graph LR\n  Agent[Agent] -->|buffer + retry| Ingest[Ingestion Service]\n  Ingest --> Kafka[Kafka: replicated across AZs]\n  Kafka --> Consumer[Consumer: idempotent writes]\n  Consumer --> TSDB[(Time-Series DB)]\n  AlertSvc[Alert Service] -->|checkpoint state| AlertSvc\n  AlertSvc -->|alert event| Kafka2[Kafka]\n  Kafka2 --> NotiSvc[Notification Service]\n  NotiSvc -->|retry + failover| Channels[Slack / PagerDuty]" },
      { topic: "Cardinality Explosion", details: "Every unique metric name + label combo = new series. 1000 hosts × 5 regions × 200 endpoints × 10 status codes = 10M potential series. Kills both write perf (index overhead) and read perf (aggregating millions of series). Solution: policy store maps metric → allowed labels + series cap. Cardinality tracker in Redis checks if new series would exceed cap before accepting",
        subBullets: ["Policy store (Postgres): metric → allowed label keys, max series count, per-label value limits", "Cardinality tracker (Redis): set per metric name, check if label combo already exists", "If new series would exceed cap → reject with error, surface to metric owner"],
        diagram: "graph LR\n  Metric[Incoming Metric] --> Ingest[Ingestion Service]\n  Ingest --> Policy{Check Policy Store}\n  Policy -->|allowed labels?| Card{Check Cardinality Tracker}\n  Card -->|under cap| Accept[Accept + Publish to Kafka]\n  Card -->|over cap| Reject[Reject: cardinality limit]\n  Policy -->|unknown label| Reject" }
    ]
  }
};

const PATTERNS = {
  "real-time-updates": {
    name: "Real-Time Updates",
    keywords: ["real-time", "live updates", "push", "websocket", "sse", "polling", "long polling", "webrtc"],
    paywalled: true,
    summary: "Two-hop problem: (1) source→server, (2) server→client. Defer to SSE unless you have specific need for bidirectional communication.",
    clientProtocolDecision: "Not latency sensitive → Polling. No bidirectional needed → SSE. Frequent bidirectional → WebSocket. Audio/video → WebRTC.",
    approaches: [
      { name: "Simple Polling", desc: "Client repeatedly requests at interval. Simplest but wasteful — most responses empty. Good for: dashboards with 30s+ refresh, not latency sensitive", tradeoff: "Simple to implement but high server load and latency up to poll interval" },
      { name: "Long Polling", desc: "Client sends request, server holds connection until data available or timeout. Reduces empty responses. Good for: moderate real-time needs without WebSocket complexity", tradeoff: "Better than polling but each client holds a connection; doesn't scale well past ~10K concurrent" },
      { name: "SSE (Server-Sent Events)", desc: "One-way server→client over HTTP. Auto-reconnect built in. DEFAULT CHOICE — defer to SSE unless bidirectional needed. Good for: price feeds, notifications, live scores", tradeoff: "Simple, HTTP-compatible, auto-reconnect. But one-way only and limited to ~6 connections per domain in browsers" },
      { name: "WebSocket", desc: "Full-duplex bidirectional over single TCP connection. Good for: chat, collaborative editing, gaming — anything needing frequent client→server messages too", tradeoff: "Most flexible but complex: connection management, load balancer support, reconnection logic" },
      { name: "WebRTC", desc: "Peer-to-peer direct connection. Good for: video/audio calls, screen sharing", tradeoff: "Lowest latency for media but complex NAT traversal (STUN/TURN servers)" }
    ],
    serverSide: [
      { name: "Pull-based polling", desc: "Server periodically checks source for changes. Simplest. Adds latency equal to poll interval" },
      { name: "Push via consistent hashing", desc: "Hash userId % N to route updates to specific server holding that client's connection. ZooKeeper for coordination. Use when connections have expensive server-side state (e.g., Google Docs — each connection has document state in memory)", tradeoff: "No broadcast needed but requires coordination service and rehashing on server changes" },
      { name: "Push via pub/sub", desc: "Redis Pub/Sub — any client connects to any server, 'least connections' load balancer. Source publishes to channel, all servers subscribed for that user receive it. Use when just passing messages (no expensive per-connection state)", tradeoff: "Simplest to scale horizontally but every server gets every message for its subscribed channels" }
    ],
    deepDives: [
      { topic: "Connection failures", details: "Heartbeat mechanism for zombie detection (client or server sends ping every N seconds, no response = dead). Recovery: per-user message queue (store undelivered messages, replay on reconnect) or sequence numbers (client sends last seen seq#, server replays from there)" },
      { topic: "Celebrity fan-out", details: "Millions subscribed to one source. Hierarchical distribution: cache layer → broadcast nodes → end users. Don't fan out from single server — use tree topology" },
      { topic: "Message ordering", details: "Vector clocks or logical timestamps for causal ordering. Or funnel all messages for a conversation/entity to single server/partition to get total ordering cheaply" }
    ],
    usedIn: ["chat", "robinhood", "google-docs", "online-auction", "strava", "uber", "notification-system"]
  },

  "dealing-with-contention": {
    name: "Dealing with Contention",
    keywords: ["contention", "race condition", "locking", "concurrency", "optimistic", "pessimistic", "distributed lock", "saga", "2pc"],
    paywalled: true,
    summary: "Handling concurrent access to shared resources. Decision: Single DB + high contention → pessimistic locking. Single DB + low contention → OCC. Multiple DBs + eventual OK → Saga. Multiple DBs + strong consistency → 2PC.",
    interviewTip: "When in doubt, start with pessimistic locking in a single database. It's simple, predictable, and you can always improve it later.",
    decisionFlowchart: "Data fits in single DB? → Yes → High contention? → Pessimistic. Low contention? → OCC. No (multiple DBs) → Tolerate eventual consistency? → Yes → Saga. No → 2PC.",
    approaches: [
      { name: "Atomicity (Transactions)", desc: "BEGIN, operations, COMMIT/ROLLBACK — all-or-nothing. But doesn't prevent concurrent reads of same data. Foundation that other strategies build on", tradeoff: "Guarantees all-or-nothing but alone doesn't prevent read-then-write races between concurrent transactions" },
      { name: "Pessimistic Locking", desc: "SELECT...FOR UPDATE — lock row before reading. Guard with AND available_seats > 0 to enforce business invariants. Lock as few rows as possible for shortest time", tradeoff: "Simple correctness, predictable under high contention. But reduces throughput and risk of deadlocks if locking multiple resources" },
      { name: "Isolation Levels", desc: "READ UNCOMMITTED → READ COMMITTED (PG default) → REPEATABLE READ (MySQL default — catches conflicts) → SERIALIZABLE (strongest, tracks all reads/writes to detect conflicts). Higher = safer but more expensive", tradeoff: "Higher isolation prevents more anomalies but costs throughput. SERIALIZABLE is safest but often overkill" },
      { name: "Optimistic Concurrency Control (OCC)", desc: "Version column: UPDATE ... SET version=version+1 WHERE version = expected. No locks during processing. Use dedicated version column (not business values) to avoid ABA problem", tradeoff: "Better throughput under low contention. High contention = many retries = worse than pessimistic" },
      { name: "Two-Phase Commit (2PC)", desc: "Prepare phase: each DB does everything except final commit (durable). Commit/abort phase. Coordinator crash = participants blocked — biggest weakness. Preserves consistency at cost of availability", tradeoff: "Strong consistency across services but coordinator is SPOF and participants block during prepare" },
      { name: "Distributed Locks", desc: "Redis SET NX + TTL, Database columns with expiration, ZooKeeper/etcd ephemeral nodes. Fencing tokens: monotonically increasing number to reject stale writes from expired lock holders. Great for reservations (Ticketmaster seat → 'reserved' with 10-min TTL)", tradeoff: "Simple mental model but lock expiry is tricky. Fencing tokens solve stale-holder problem" },
      { name: "Saga Pattern", desc: "Sequence of independent committed steps + compensating actions. No long-running locks. Orchestrator persists progress via Temporal/Cadence/state machine. Temporarily inconsistent — show 'pending' until complete", tradeoff: "Scales well, no global locks. But eventual consistency only and compensating actions can be complex" }
    ],
    deepDives: [
      { topic: "Deadlock prevention", details: "Ordered locking: always sort resources by deterministic key (e.g., user ID). Always lock 123 before 456 regardless of business logic direction. Fallback: transaction timeouts to break deadlocks" },
      { topic: "Coordinator crash in 2PC", details: "Failover + persistent log recovery. Sagas are more resilient — coordinator crash just pauses progress, resume from last completed step" },
      { topic: "ABA problem with OCC", details: "Dedicated version column that increments on every update regardless of business value changes. Don't use business values as version — value could change A→B→A and look unchanged" },
      { topic: "Hot resource (everyone wants same resource)", details: "Queue-based serialization: dedicated queue per hot resource → single worker thread, sequential not concurrent. Trades latency for correctness. Everyone waits in line instead of fighting for locks" }
    ],
    usedIn: ["online-auction", "payment-system", "ticketmaster", "robinhood", "ride-sharing", "flash-sale"],
    usedInDetails: "Online Auction: OCC (current high bid is natural version). Ticketmaster: pessimistic locking + reservations with TTL. Banking: saga with 2PC if interviewer pushes for strong consistency. Ride Sharing: status reservations ('pending_request' prevents multiple simultaneous dispatches). Flash Sale: OCC + distributed lock cart holds."
  },

  "multi-step-processes": {
    name: "Multi-Step Processes",
    keywords: ["workflow", "orchestration", "saga", "state machine", "multi-step", "compensation", "durable execution"],
    paywalled: true,
    summary: "Coordinating operations across multiple services where each step can fail independently. E-commerce example: charge payment → reserve inventory → create shipping label → notify warehouse.",
    approaches: [
      { name: "Single Server Orchestration", desc: "One service coordinates all steps sequentially. Simple but that server is a SPOF", tradeoff: "Easy to reason about but no fault tolerance — server crash loses in-flight state" },
      { name: "Event Sourcing", desc: "Each step emits event, next step reacts. State reconstructable from event log. Kafka as backbone", tradeoff: "Durable and auditable but harder to understand flow — logic spread across consumers" },
      { name: "Durable Execution (Temporal/Step Functions)", desc: "Framework persists workflow state at each step. On crash, resume from last checkpoint. Code looks sequential but is fault-tolerant", tradeoff: "Best developer experience but adds infrastructure dependency" }
    ],
    usedIn: ["payment-system", "uber", "food-delivery"]
  },

  "scaling-reads": {
    name: "Scaling Reads",
    keywords: ["read scaling", "caching", "read replica", "cdn", "denormalization", "cache invalidation", "cache stampede", "hot key"],
    paywalled: true,
    summary: "Three-tier progression: (1) Optimize within DB (indexing, compound index column order, denormalization/materialized views), (2) Scale DB horizontally (read replicas leader-follower, functional sharding, geographic sharding), (3) External caching (Redis/Memcached, CDN edge).",
    interviewTip: "Cache TTL should be driven by non-functional requirements about data staleness.",
    approaches: [
      { name: "Tier 1: Optimize within DB", desc: "Indexing (compound index column order matters!), denormalization, materialized views. First thing to try before adding infrastructure", tradeoff: "Speeds reads dramatically but slows writes (index maintenance). Denormalization adds consistency burden" },
      { name: "Tier 2: Scale DB horizontally", desc: "Read replicas (leader-follower), functional sharding (users DB, posts DB), geographic sharding (EU data in EU region). Route reads to replicas, writes to primary", tradeoff: "Linear read scaling but replication lag means eventual consistency. Functional sharding limits cross-domain queries" },
      { name: "Tier 3: Application Cache (Redis/Memcached)", desc: "Cache query results in-memory. Sub-ms reads for hot data. CDN for static/semi-static content at edge", tradeoff: "Huge speedup but cache invalidation is hard — stale data risk. CDN limited to content that doesn't change per-user" }
    ],
    cacheInvalidation: [
      { name: "TTL", desc: "5-15 min safety net. Simplest — data eventually refreshes. Driven by staleness tolerance from NFRs" },
      { name: "Write-through", desc: "Update cache on every write. Strong consistency but write latency increases" },
      { name: "Write-behind", desc: "Update cache immediately, async write to DB. Fast writes but data loss risk" },
      { name: "Cache versioning (recommended)", desc: "Version number in DB. Construct cache key like event:123:v42. On update, increment version in DB → old cache key simply never gets hit again. Sidesteps entire class of invalidation problems — no race conditions, no guessing which caches to delete" },
      { name: "Deleted items cache", desc: "Small working set of recently deleted IDs. Check before serving cached feeds. Prevents showing deleted content from stale caches" }
    ],
    deepDives: [
      { topic: "Query degradation", details: "Add indexes. Compound index column order matters — put equality conditions first, range conditions last. Partial indexes for common filters" },
      { topic: "Hot key / millions of concurrent reads", details: "Request coalescing: reduces N million backend requests to N (where N = number of app servers) — multiple in-flight requests for same key share one backend fetch. Cache key fanout with random suffix (e.g., feed:taylor-swift:1 through feed:taylor-swift:10) distributes across Redis nodes" },
      { topic: "Cache stampede", details: "All caches expire simultaneously → thundering herd to DB. Solutions: distributed locks (only one fetches, others wait), probabilistic early refresh (randomly refresh before TTL expires), background refresh (separate process keeps cache warm)" },
      { topic: "Cache invalidation for immediate visibility", details: "Cache versioning: version in DB, version key cached separately, construct versioned cache key. On write: increment version → next read constructs new key → cache miss → fresh data. Deleted items cache for feeds/search — small set of recently deleted IDs checked before serving" }
    ],
    usedIn: ["instagram", "twitter", "yelp", "metrics-monitoring", "news-feed", "bitly", "ticketmaster", "youtube"],
    usedInDetails: "Bitly: extreme read/write ratio — perfect for aggressive caching. Ticketmaster: cache event details NOT seat availability (availability needs real-time). News Feed: pre-compute and cache recent posts. YouTube: cache metadata not video bytes.",
    whenNot: "Write-heavy (Uber location updates), small scale (1000 users — just use a single DB), strongly consistent (financial transactions), real-time collaborative (Google Docs)"
  },

  "scaling-writes": {
    name: "Scaling Writes",
    keywords: ["write scaling", "sharding", "partitioning", "batching", "queue", "load shedding", "hierarchical aggregation"],
    paywalled: true,
    summary: "Core principle: reducing throughput per component. Four strategies: (1) Vertical Scaling + DB Choice, (2) Sharding & Partitioning, (3) Queue Buffering + Load Shedding, (4) Batching & Hierarchical Aggregation.",
    interviewTip: "Do back-of-envelope math first — don't employ write scaling when not necessary.",
    approaches: [
      { name: "Vertical Scaling + DB Choice", desc: "Cassandra: append-only, 10K+ writes/sec vs 1K for relational. Time-series DBs (InfluxDB, TimescaleDB): delta encodings. Log-structured (LevelDB): append instead of update-in-place. Column stores (ClickHouse): batch analytics. Also: disable expensive features during high-write periods, tune write-ahead logging, reduce index overhead", tradeoff: "Simple but has ceiling. Choose DB that matches write pattern" },
      { name: "Sharding & Partitioning", desc: "Good partition key = minimize variance in writes per shard. Hash of primary ID (userId, postId) = flat = good. Country = skewed = bad. Vertical partitioning: separate tables for different access patterns (post content vs post metrics vs post analytics — each gets optimized DB)", tradeoff: "Near-linear write scaling but cross-shard queries expensive. Resharding is painful" },
      { name: "Queue Buffering + Load Shedding", desc: "Burst absorption — smooths spikes. But only temporary! Queues mask underlying problem. Use for short-lived bursts, not steady-state overload. Load shedding: drop least useful writes during overload (e.g., Uber: location update within seconds of previous — fresher one coming anyway). Release valves keep bad → disaster", tradeoff: "Smooths spikes but adds latency. Load shedding trades completeness for survival" },
      { name: "Batching", desc: "Application layer: batch writes before sending to DB. Intermediate processing: Like Batcher — 100 likes in 1 min → 1 DB write. Database layer: Redis flush every 100ms. Staff tip: check batching efficacy — if most entities get 1 event/hour, 1-min batch = 0 benefit", tradeoff: "Dramatically reduces DB operations but data loss risk if node dies before flush" },
      { name: "Hierarchical Aggregation", desc: "For extreme fan-in (live comments: millions writing to all viewers). Write processors → Root processor → Broadcast nodes → Users. Reduces write throughput at each layer. Each layer aggregates before passing up", tradeoff: "Handles extreme fan-in but adds latency layers and complexity" }
    ],
    deepDives: [
      { topic: "Resharding", details: "Dual-write migration: write to both old and new sharding scheme, read with preference for new, migrate historical data gradually. No downtime required" },
      { topic: "Hot key writes", details: "Split all keys with fixed k suffix: postLikes-0, postLikes-1... Increases dataset k times, reads must aggregate across all k shards. Or split hot keys dynamically. Works for aggregatable metrics (likes, counts), not atomic data (user profiles)" }
    ],
    usedIn: ["metrics-monitoring", "ad-click-aggregator", "strava", "rate-limiter", "instagram", "news-feed", "search", "live-comments"],
    usedInDetails: "Instagram: shard posts by user ID, vertical partition (content/metrics/analytics). News Feeds: careful tuning write→read balance. Search: preprocessing + partitioning + batching. Live Comments: hierarchical aggregation.",
    whenNot: "Do back-of-envelope math first — don't employ write scaling when not necessary"
  },

  "large-blobs": {
    name: "Handling Large Blobs",
    keywords: ["blob storage", "s3", "presigned url", "cdn", "file upload", "resumable upload", "multipart"],
    paywalled: true,
    summary: "Files >10MB should bypass app servers. Use presigned URLs for direct client↔S3 upload/download. CDN for downloads. Resumable uploads for large files.",
    approaches: [
      { name: "Presigned URLs", desc: "Server generates time-limited signed URL. Client uploads directly to S3, bypassing app server. Server never handles file bytes", tradeoff: "Offloads bandwidth but need to handle metadata sync — file uploaded but metadata update fails" },
      { name: "Resumable/Chunked Upload", desc: "Split large file into chunks. Upload independently. Resume from last successful chunk on failure", tradeoff: "Essential for files >100MB on unreliable networks. More complex client and server logic" },
      { name: "CDN Distribution", desc: "Serve downloads from edge locations. Cache popular files close to users", tradeoff: "Low latency for popular content. Cache invalidation needed for updated files" },
      { name: "Processing Pipeline", desc: "S3 event → Lambda/worker for transcoding, thumbnail generation, virus scanning", tradeoff: "Async processing keeps upload fast but content not immediately available in all formats" }
    ],
    usedIn: ["dropbox", "instagram", "youtube", "google-docs"]
  },

  "long-running-tasks": {
    name: "Managing Long Running Tasks",
    keywords: ["async", "background job", "worker", "queue", "job status", "task queue"],
    paywalled: true,
    summary: "Operations >30s should be async: accept request immediately, return job ID, process in background, client polls for status. Queue + workers pattern.",
    approaches: [
      { name: "Queue + Worker", desc: "API validates and enqueues job, returns job ID. Workers pull from queue, process, update status DB. Client polls status endpoint", tradeoff: "Decouples request from processing. Workers scale independently. But adds queue infrastructure" },
      { name: "Failure Handling", desc: "Retry with exponential backoff. Dead-letter queue for repeated failures. Alert on DLQ growth", tradeoff: "At-least-once delivery means tasks must be idempotent" },
      { name: "Preventing Duplicates", desc: "Idempotency key per job. Check before processing. Dedup at consumer level", tradeoff: "Prevents double-processing but adds lookup overhead" },
      { name: "Backpressure", desc: "Monitor queue depth. Scale workers or reject/delay new jobs when queue grows", tradeoff: "Prevents system overload but may temporarily degrade user experience" }
    ],
    usedIn: ["job-scheduler", "youtube", "dropbox", "notification-system"]
  }
};

const KEY_TECHNOLOGIES = {
  "redis": {
    name: "Redis",
    keywords: ["redis", "cache", "in-memory", "pub/sub", "sorted set", "leaderboard", "rate limit", "distributed lock"],
    summary: "In-memory data structure store. ~100K writes/sec, microsecond reads. Single-threaded.",
    keyPoints: [
      "Data structures: Strings, Hashes, Lists, Sets, Sorted Sets, Streams, Bloom Filters, Geo",
      "Use cases: caching (TTL + LRU), distributed locks (SETNX + Redlock), leaderboards (ZADD/ZRANK), rate limiting (INCR + EXPIRE or Sorted Sets for sliding window), pub/sub (ephemeral, at-most-once)",
      "Persistence: NOT durable by default. AOF minimizes but doesn't eliminate data loss. Use AWS MemoryDB if durability required",
      "Scaling: cluster mode with hash slots. Data for a request should live on one node. Hot key mitigation: client-side cache, multi-key replication, read replicas",
      "Pub/Sub: fire-and-forget, no persistence. Use Streams or Kafka if you need durability/replay",
      "Streams (XADD): append-only log with consumer groups. Like mini-Kafka inside Redis"
    ],
    usedIn: ["distributed-cache", "rate-limiter", "strava", "online-auction", "robinhood", "instagram", "twitter", "chat", "metrics-monitoring", "leaderboard"]
  },

  "elasticsearch": {
    name: "Elasticsearch",
    keywords: ["elasticsearch", "search", "full-text search", "inverted index", "lucene", "elastic"],
    summary: "Distributed search engine built on Lucene. Inverted index for fast full-text search. Eventually consistent — NOT a primary database.",
    keyPoints: [
      "Core: inverted index (word → documents), doc values (columnar for sort/aggregation), immutable segments with periodic merges",
      "Good for: full-text search, geo queries, filtering/sorting/ranking, read-heavy with denormalized data, >100K documents",
      "Bad for: write-heavy (soft deletes), primary DB (eventual consistency), rapidly updating data, <100K documents (overkill)",
      "Pagination: from/size (simple but O(n) deep), search_after (cursor-based, efficient), PIT (consistent snapshot)",
      "Integration: always sync via CDC from authoritative source (Postgres/DynamoDB). Search layer only, not source of truth",
      "Scaling: shards split across nodes, replicas for HA + throughput (X shards × Y replicas = X×Y read TPS)"
    ],
    usedIn: ["yelp", "uber", "google-maps", "web-crawler", "top-k"]
  },

  "kafka": {
    name: "Kafka",
    keywords: ["kafka", "event streaming", "message queue", "pub/sub", "consumer group", "partition", "offset"],
    summary: "Distributed event streaming. Append-only log with partitions. Pull-based consumers with offset tracking. ~1M msg/sec per cluster.",
    keyPoints: [
      "Core: topics → partitions (ordered, immutable). Messages have key, value, timestamp. Offsets track consumer position",
      "Consumer groups: each partition assigned to exactly one consumer in group. Scale consumers ≤ partition count",
      "Delivery: at-least-once by default. Exactly-once possible with idempotent producers + transactional API",
      "Replication: leader-follower per partition. acks=all waits for all ISR. Replication factor 3 is standard",
      "Partitioning: hash(key) % num_partitions. Choose key for ordering needs (e.g., userId, orderId). Bad key = hot partition",
      "Hot partition fixes: no key (lose ordering), random salt, compound key, backpressure",
      "Retention: 7 days default. Keep messages small (<1MB). Large files → S3 + pointer message",
      "Performance: batch sends, compression (Snappy/LZ4), partition parallelism"
    ],
    usedIn: ["online-auction", "payment-system", "metrics-monitoring", "notification-system", "ad-click-aggregator", "robinhood", "google-docs"]
  },

  "api-gateway": {
    name: "API Gateway",
    keywords: ["api gateway", "gateway", "routing", "rate limiting", "authentication", "load balancer"],
    summary: "Single entry point for microservices. Handles routing, auth, rate limiting, SSL termination. Stateless, scales horizontally behind load balancer.",
    keyPoints: [
      "Core: request routing (path/method → service), validation, auth, rate limiting, SSL termination, CORS, logging",
      "Protocol translation: HTTP → gRPC, response format transformation",
      "Scaling: stateless → horizontal behind LB. GeoDNS for global distribution",
      "When to use: microservices with multiple backends. Skip for monoliths or single-service apps",
      "Interview tip: mention it handles routing + middleware, then move on. Don't over-design the gateway",
      "Options: AWS API Gateway, Kong, Tyk (managed); Express Gateway (self-hosted)"
    ],
    usedIn: ["payment-system", "uber", "food-delivery", "notification-system"]
  },

  "cassandra": {
    name: "Cassandra",
    keywords: ["cassandra", "wide column", "nosql", "partition key", "clustering key", "lsm tree", "eventual consistency"],
    summary: "Distributed wide-column NoSQL. Write-optimized (LSM trees). Tunable consistency. Query-driven data modeling — design tables around access patterns.",
    keyPoints: [
      "Data model: keyspace → table → rows. Primary key = partition key + clustering key(s). Partition key determines node, clustering key determines sort order within partition",
      "Write path: commit log → memtable (in-memory) → SSTable (disk). Append-only = fast writes",
      "Consistency: tunable per request (ONE, QUORUM, ALL). QUORUM reads + writes = strong consistency. No ACID transactions (row-level atomicity only)",
      "Scaling: consistent hash ring with virtual nodes. No single point of failure (any node can coordinate). Hinted handoffs for temporary node failures",
      "Data modeling: query-driven, NOT entity-driven. Denormalize across tables. Avoid scatter-gather. Bucket monotonically growing partitions (Discord example: channel_id + time_bucket)",
      "Good for: high write throughput, availability-critical, clear access patterns, horizontal scale. Bad for: ACID needs, complex JOINs, ad-hoc queries"
    ],
    usedIn: ["google-docs", "chat", "instagram", "notification-system", "top-k"]
  },

  "dynamodb": {
    name: "DynamoDB",
    keywords: ["dynamodb", "aws", "nosql", "partition key", "sort key", "gsi", "lsi", "managed"],
    summary: "Fully managed key-value + document store. Single-digit ms latency. Per-partition limits: 3K RCU, 1K WCU. Design around access patterns with GSIs.",
    keyPoints: [
      "Keys: partition key (hash → node) + optional sort key (range queries within partition). Together = unique item. Max 400KB per item",
      "GSI: different partition key, async (eventually consistent only), up to 20 per table. LSI: same partition key, different sort key, must define at creation, supports strong consistency",
      "Consistency: per-request. Eventually consistent = 0.5 RCU/4KB (default). Strongly consistent = 1 RCU/4KB (leader read only). GSIs always eventually consistent",
      "Capacity: on-demand (per-request, unpredictable loads) or provisioned (hourly, predictable). Per-partition: 3K RCU = 12MB/s reads, 1K WCU = 1MB/s writes",
      "Advanced: DAX (in-memory cache, microsecond reads, doesn't cache strong consistent reads). DynamoDB Streams = CDC for Lambda triggers and replication",
      "Sort key IDs: use monotonically increasing IDs (ULID, Snowflake) not timestamps to guarantee uniqueness",
      "Good for: scalable, managed, low-latency, ACID across 100 items. Bad for: complex joins, ad-hoc queries, very high volume (expensive), vendor lock-in"
    ],
    usedIn: ["instagram", "job-scheduler", "notification-system", "chat"]
  },

  "postgresql": {
    name: "PostgreSQL",
    keywords: ["postgres", "postgresql", "sql", "relational", "acid", "transactions"],
    paywalled: true,
    summary: "Battle-tested relational DB. ACID transactions, rich query language, JSONB support. Default choice when you need consistency and complex queries.",
    keyPoints: [
      "ACID transactions: strong consistency guarantees. Default choice for financial, user-facing data",
      "Scaling reads: read replicas, connection pooling (PgBouncer). Scaling writes: vertical first, then shard by key",
      "Handles ~10K writes/sec well-tuned with proper indexing",
      "JSONB: flexible schema within relational model. Best of both worlds for mixed structured/unstructured",
      "WAL (Write-Ahead Log): foundation for replication, CDC, point-in-time recovery",
      "When to shard: ~500GB+ or write throughput exceeds single node. Shard by tenant/user ID for isolation"
    ],
    usedIn: ["payment-system", "online-auction", "ticketmaster", "metrics-monitoring"]
  },

  "flink": {
    name: "Apache Flink",
    keywords: ["flink", "stream processing", "real-time analytics", "windowing", "stateful processing", "checkpointing", "watermarks", "exactly-once"],
    paywalled: true,
    summary: "Dataflow engine for stateful stream processing. Exactly-once via Chandy-Lamport checkpointing. JobManager/TaskManager architecture.",
    keyPoints: [
      "Dataflow graph: Sources (Kafka, Kinesis, files) → Operators (Map, Filter, Reduce, Window, Join, FlatMap, Aggregate) → Sinks (DBs, data warehouses, Kafka, S3)",
      "Streams: unbounded sequence of events. Not append-only like Kafka — durability via checkpoints, not log retention",
      "State types: Value State, List State, Map State, Aggregating State, Reducing State. Backends: Memory (JVM heap, fast), FS, RocksDB (supports state larger than memory — terabytes)",
      "Watermarks: timestamp flowing with data declaring 'all events before this time have arrived'. Bounded out-of-orderness (wait N seconds for late events) or No watermarks (process immediately). Most mission-critical systems add offline true-up process",
      "Windows: Tumbling (fixed, non-overlapping), Sliding (fixed, overlapping), Session (dynamic gap-based), Global (custom logic). Window choice impacts accuracy AND performance",
      "Checkpointing: based on Chandy-Lamport. JobManager sends barrier → operators snapshot state → registered with JobManager. On failure: pause all → restore from checkpoint → rewind sources → resume. Exactly-once for internal state; external systems need idempotent operations",
      "Cluster: JobManager (coordinator — scheduling, checkpoints, failure handling, leader-based with ZooKeeper for HA) + TaskManagers (workers with task slots = unit of parallelism ≈ CPU cores)"
    ],
    interviewTips: [
      "Overkill for simple stream processing — simple Kafka consumer service is sufficient for transform-and-write",
      "Significant operational overhead (deployment, monitoring, scaling the cluster)",
      "State management is superpower AND biggest challenge",
      "Don't model everything as Flink job — many interviewers aren't familiar with all capabilities"
    ],
    lessonsFromFlink: [
      "Separation of processing time vs event time",
      "Watermarks for progress tracking in any streaming system",
      "Local state + checkpointing pattern (applicable beyond Flink)",
      "Exactly-once techniques (idempotent writes + source replay)",
      "Slot-based resource isolation"
    ],
    usedIn: ["metrics-monitoring", "ad-click-aggregator", "top-k"]
  },

  "zookeeper": {
    name: "ZooKeeper",
    keywords: ["zookeeper", "coordination", "leader election", "distributed lock", "configuration", "service discovery"],
    paywalled: true,
    summary: "Distributed coordination service. Consistent key-value store for config, leader election, distributed locks, and service discovery.",
    keyPoints: [
      "Core: hierarchical namespace (like filesystem). Znodes hold data + metadata. Watches notify clients of changes",
      "Leader election: ephemeral sequential znodes. Lowest sequence number = leader. On disconnect, znode disappears → next in line becomes leader",
      "Distributed locks: similar to leader election. Create ephemeral sequential znode, watch predecessor",
      "Consistency: linearizable writes (through leader), sequential reads. CP system — unavailable during leader election",
      "Use cases: Kafka broker coordination, consistent hash ring management, config distribution",
      "Being replaced: Kafka removing ZK dependency (KRaft). Consider etcd as modern alternative"
    ],
    usedIn: ["google-docs", "distributed-cache", "kafka"]
  }
};

const ADVANCED_TOPICS = {
  "time-series-databases": {
    name: "Time Series Databases",
    keywords: ["time series", "tsdb", "influxdb", "timescaledb", "prometheus", "metrics", "temporal"],
    summary: "Specialized for high-volume timestamp-ordered data. 10-100x better than general-purpose DBs for target workload via append-only writes, compression, and time-based partitioning.",
    keyPoints: [
      "Storage: append-only + LSM trees = exceptional write throughput. Sequential I/O, no random writes",
      "Compression: delta encoding for timestamps (1 bit avg with delta-of-delta), XOR for floats. 60%+ storage reduction",
      "Partitioning: time-based windows (daily/weekly). Localizes writes, simplifies retention (drop old partitions), efficient range queries",
      "Read optimization: bloom filters (skip unnecessary disk reads), block-level min/max metadata, inverted tag index for fast filtering",
      "Downsampling/rollups: pre-aggregate old data at reduced resolution. Raw → 1min → 1hr → 1day. Trade precision for storage on historical data",
      "Cardinality trap: tags (indexed) vs fields (not indexed). High-cardinality tags (user IDs) exhaust memory and kill perf. Only index low-cardinality dimensions",
      "When to use: >50K writes/sec, low-cardinality tags, regular intervals. When NOT: mixed workloads, high-cardinality needs — just use Postgres/DynamoDB",
      "Options: InfluxDB, TimescaleDB (Postgres extension), Prometheus (pull-based), Cassandra (general but works)"
    ],
    usedIn: ["metrics-monitoring", "strava", "camelcamelcamel"]
  },

  "data-structures-for-big-data": {
    name: "Data Structures for Big Data",
    keywords: ["bloom filter", "count-min sketch", "hyperloglog", "probabilistic", "approximate"],
    paywalled: true,
    summary: "Probabilistic data structures that trade perfect accuracy for massive space/time savings. Essential when exact counting at scale is impractical.",
    keyPoints: [
      "Bloom Filter: 'is X in the set?' — no false negatives, possible false positives. Used in: Cassandra (skip unnecessary disk reads), web crawler (URL dedup), spell checkers",
      "HyperLogLog: count unique items with ~2% error using ~12KB regardless of cardinality. Used in: unique visitors, distinct value counts",
      "Count-Min Sketch: estimate frequency of items in stream. Used in: top-K tracking, heavy hitters detection",
      "When to use: billions of items where exact counting requires too much memory. Always mention the error rate tradeoff"
    ],
    usedIn: ["web-crawler", "top-k", "ad-click-aggregator", "rate-limiter"]
  },

  "vector-databases": {
    name: "Vector Databases",
    keywords: ["vector", "embedding", "similarity search", "ann", "pinecone", "weaviate", "rag"],
    paywalled: true,
    summary: "Store and search high-dimensional vectors (embeddings). Enable similarity search for AI/ML applications using approximate nearest neighbor (ANN) algorithms.",
    keyPoints: [
      "Core: store embeddings (dense vectors from ML models). Query by similarity not exact match",
      "ANN algorithms: HNSW (graph-based, fast), IVF (cluster-based, memory efficient), PQ (compressed, approximate)",
      "Use cases: semantic search, recommendation systems, RAG (retrieval-augmented generation), image similarity, anomaly detection",
      "Options: Pinecone (managed), Weaviate (open-source), pgvector (Postgres extension), Qdrant",
      "Integration: typically sits alongside traditional DB. Embed content → store vector + metadata → query by similarity"
    ],
    usedIn: []
  }
};

const DESIGN_PATTERN_TAGS = {
  "dropbox": { patterns: ["large-blobs", "long-running-tasks"], technologies: ["redis", "postgresql"] },
  "yelp": { patterns: ["scaling-reads"], technologies: ["elasticsearch", "redis"] },
  "uber": { patterns: ["real-time-updates", "multi-step-processes", "dealing-with-contention"], technologies: ["kafka", "redis", "api-gateway"] },
  "twitter": { patterns: ["scaling-reads", "scaling-writes"], technologies: ["redis", "kafka"] },
  "ticketmaster": { patterns: ["dealing-with-contention", "scaling-reads"], technologies: ["redis", "postgresql", "kafka"] },
  "youtube": { patterns: ["large-blobs", "long-running-tasks", "scaling-reads"], technologies: ["kafka", "redis"] },
  "whatsapp": { patterns: ["real-time-updates"], technologies: ["redis", "kafka"] },
  "chat": { patterns: ["real-time-updates"], technologies: ["redis", "cassandra", "kafka"] },
  "food-delivery": { patterns: ["real-time-updates", "multi-step-processes"], technologies: ["kafka", "redis", "api-gateway"] },
  "google-maps": { patterns: ["scaling-reads"], technologies: ["elasticsearch", "redis"] },
  "notification-system": { patterns: ["long-running-tasks", "scaling-writes"], technologies: ["kafka", "redis", "dynamodb", "cassandra"] },
  "web-crawler": { patterns: ["long-running-tasks", "scaling-writes"], technologies: ["kafka", "elasticsearch"] },
  "rate-limiter": { patterns: ["dealing-with-contention"], technologies: ["redis"] },
  "top-k": { patterns: ["scaling-writes"], technologies: ["kafka", "redis", "elasticsearch"] },
  "ad-click-aggregator": { patterns: ["scaling-writes"], technologies: ["kafka", "redis"] },
  "news-feed": { patterns: ["scaling-reads", "real-time-updates"], technologies: ["redis", "kafka"] },
  "typeahead": { patterns: ["scaling-reads"], technologies: ["redis", "elasticsearch"] },
  "leaderboard": { patterns: ["scaling-reads", "scaling-writes"], technologies: ["redis"] },
  "camelcamelcamel": { patterns: ["long-running-tasks", "scaling-writes"], technologies: ["kafka", "redis"] },
  "instagram": { patterns: ["scaling-reads", "large-blobs"], technologies: ["redis", "dynamodb", "kafka"] },
  "strava": { patterns: ["real-time-updates", "scaling-writes"], technologies: ["redis", "kafka"] },
  "online-auction": { patterns: ["real-time-updates", "dealing-with-contention"], technologies: ["kafka", "redis", "postgresql"] },
  "robinhood": { patterns: ["real-time-updates", "dealing-with-contention"], technologies: ["kafka", "redis"] },
  "google-docs": { patterns: ["real-time-updates"], technologies: ["cassandra", "zookeeper", "kafka"] },
  "distributed-cache": { patterns: ["scaling-reads"], technologies: ["redis", "zookeeper"] },
  "job-scheduler": { patterns: ["long-running-tasks", "dealing-with-contention"], technologies: ["dynamodb"] },
  "payment-system": { patterns: ["multi-step-processes", "dealing-with-contention"], technologies: ["kafka", "postgresql"] },
  "metrics-monitoring": { patterns: ["scaling-writes", "scaling-reads"], technologies: ["kafka", "redis"] }
};

const ENVELOPE_MATH = {
  references: {
    time: {
      "seconds/day": "86,400 → round to 100K",
      "seconds/month": "2.5M → round to 2.5M",
      "seconds/year": "31.5M → round to 30M",
      "1M seconds": "~12 days",
      "1B seconds": "~32 years"
    },
    storage: {
      "1 char": "2 bytes (UTF-8 avg)",
      "1 text record (tweet, message, row)": "~0.5-1 KB",
      "1 image (compressed JPEG)": "~200 KB",
      "1 photo (high-res)": "~2 MB",
      "1 minute video (720p)": "~50 MB",
      "1 minute video (1080p)": "~150 MB"
    },
    storageShortcuts: {
      "1 KB × 1M items": "1 GB",
      "1 KB × 1B items": "1 TB",
      "1 MB × 1M items": "1 TB",
      "1 MB × 1B items": "1 PB",
      "1 GB × 1M items": "1 PB"
    },
    throughput: {
      "1 web server": "~10K-50K req/sec",
      "1 Redis instance": "~100K ops/sec",
      "1 Postgres (tuned)": "~10K writes/sec, ~50K reads/sec",
      "1 Cassandra node": "~10K+ writes/sec",
      "1 DynamoDB (on-demand)": "auto-scales, ~40K RCU/WCU default",
      "1 Kafka cluster": "~1M msg/sec",
      "1 Kafka partition": "~10K msg/sec",
      "1 Elasticsearch node": "~5K-10K writes/sec, ~100+ queries/sec"
    },
    networking: {
      "intra-DC round trip": "~0.5 ms",
      "cross-region": "~50-150 ms",
      "CDN edge to user": "~10-50 ms",
      "DNS lookup": "~20-120 ms",
      "SSD random read": "~0.1 ms",
      "HDD seek": "~5-10 ms"
    }
  },

  calculations: {
    "throughput": {
      name: "Throughput (QPS)",
      description: "How many requests per second the system handles",
      steps: [
        "DAU = total_users × daily_active_pct",
        "Avg QPS = DAU × actions_per_user / 86,400",
        "Peak QPS = Avg QPS × 2-3 (typical) or × 5-10 (spiky traffic like flash sales)",
        "Read QPS vs Write QPS — identify the ratio, it drives your architecture"
      ],
      tips: [
        "86,400 ≈ 100K for quick math — so 1B requests/day ≈ 10K QPS",
        "If read:write > 10:1, cache aggressively",
        "If write-heavy, consider write-optimized DBs or queues"
      ]
    },

    "storage": {
      name: "Storage",
      description: "How much disk space the system needs",
      steps: [
        "Daily storage = events_per_day × size_per_event",
        "Monthly = daily × 30",
        "Yearly = daily × 365",
        "5-year = yearly × 5 (standard planning horizon)",
        "With replication = total × replication_factor (typically 3)"
      ],
      tips: [
        "Use KB/MB/GB shortcuts: 1KB × 1B = 1TB",
        "Text is small (KB), images are medium (hundreds of KB), video is huge (MB per minute)",
        "Factor in metadata overhead — usually 10-20% on top of raw data",
        "Consider retention policy — do you keep everything forever or TTL old data?"
      ]
    },

    "bandwidth": {
      name: "Bandwidth",
      description: "Network throughput required",
      steps: [
        "Inbound = write_QPS × avg_request_size",
        "Outbound = read_QPS × avg_response_size",
        "Convert: 1 MB/sec = 8 Mbps, 1 GB/sec = 8 Gbps"
      ],
      tips: [
        "Outbound is usually much larger than inbound (reads > writes)",
        "CDN offloads most outbound bandwidth for static/cacheable content",
        "Video streaming dominates bandwidth — 720p ≈ 3-5 Mbps per stream"
      ]
    },

    "memory": {
      name: "Memory / Cache Sizing",
      description: "How much RAM for caching or in-memory data",
      steps: [
        "Cache size = number_of_hot_items × size_per_item",
        "Working set = total_data × hot_pct (typically 20% — Pareto principle)",
        "Redis nodes = cache_size / 64GB (per instance, leave headroom)",
        "Connection memory = concurrent_connections × ~10KB per connection"
      ],
      tips: [
        "Cache the 20% most accessed data — covers ~80% of reads",
        "1M entries × 1KB each = 1GB — fits in one Redis instance easily",
        "Don't forget: each WebSocket/TCP connection costs ~10KB of server memory"
      ]
    },

    "servers": {
      name: "Servers / Instances",
      description: "How many machines you need",
      steps: [
        "App servers = peak_QPS / capacity_per_server (10K-50K)",
        "DB servers (write) = write_QPS / DB_write_capacity",
        "DB servers (read) = read_QPS / DB_read_capacity (or use replicas)",
        "Cache nodes = working_set_size / memory_per_node",
        "Workers = jobs_per_sec × avg_duration_sec"
      ],
      tips: [
        "Add 30-50% headroom above calculated need",
        "Minimum 3 nodes for any distributed component (fault tolerance)",
        "Stateless services scale linearly — stateful ones don't"
      ]
    },

    "connections": {
      name: "Concurrent Connections",
      description: "For real-time systems with persistent connections",
      steps: [
        "Concurrent = DAU × online_pct (typically 5-10%)",
        "Connections per server = ~50K-100K (with proper tuning)",
        "WebSocket servers needed = concurrent / connections_per_server",
        "Memory for connections = concurrent × 10KB"
      ],
      tips: [
        "L4 load balancer for WebSocket (not L7 — avoid breaking upgrade)",
        "Isolate WebSocket servers from stateless API servers",
        "Plan for reconnection storms — all clients reconnecting simultaneously after outage"
      ]
    },

    "fan-out": {
      name: "Fan-out / Broadcast",
      description: "When one event triggers many downstream operations",
      steps: [
        "Fan-out writes = events × recipients_per_event",
        "Fan-out QPS = fan-out writes / 86,400",
        "Celebrity problem: top 0.1% of users may have 1M+ followers",
        "Hybrid: fan-out-on-write for normal users, fan-out-on-read for celebrities"
      ],
      tips: [
        "If fan-out > 10K per event, consider pull-based for those cases",
        "Pre-compute feeds for most users, merge celebrity posts at read time",
        "Queue the fan-out — don't do it synchronously in the write path"
      ]
    }
  },

  roundingRules: [
    "Round to nearest power of 10 — 86,400 → 100K, 2.5M → 3M",
    "Peak = 2-3× average (normal), 5× (events), 10× (flash sales)",
    "Plan for 5 years of growth",
    "Identify read:write ratio first — it drives everything",
    "Show your math: state assumption → multiply → convert units → state result",
    "Sanity check: does the number make sense? 1 PB/day of text data = something is wrong"
  ]
};

module.exports = { DESIGN_REFERENCES, PATTERNS, KEY_TECHNOLOGIES, ADVANCED_TOPICS, DESIGN_PATTERN_TAGS, ENVELOPE_MATH };
