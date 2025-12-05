# EdgeRelay Development Outline

This document provides a comprehensive, step-by-step implementation plan for building EdgeRelay, an AT Protocol relay on Cloudflare Workers with 62-day rolling retention.

## Overview

EdgeRelay will be developed in phases, with each phase building upon the previous one. Each phase includes specific goals, tasks, and acceptance criteria to ensure steady progress toward a fully functional relay.

---

## Phase 1: Foundation and Infrastructure

**Goal**: Establish the foundational infrastructure, build system, and basic worker setup.

### Tasks

1. **Project Initialization** ✅
   - Set up TypeScript configuration with strict mode
   - Configure ESLint and Prettier for code quality
   - Initialize package.json with required dependencies
   - Create .gitignore for Cloudflare Workers

2. **Cloudflare Workers Setup** ✅
   - Create wrangler.toml configuration
   - Define KV namespace bindings for event indices
   - Define R2 bucket bindings for event storage
   - Define Queue bindings for event fan-out
   - Define Durable Object bindings for relay state
   - Configure multiple environments (develop, production)

3. **CI/CD Pipeline** ✅
   - Create GitHub Actions workflow for linting and testing
   - Create GitHub Actions workflow for develop deployments
   - Create GitHub Actions workflow for production deployments
   - Configure GitVersion for semantic versioning
   - Set up Conventional Commits validation

4. **Basic Worker Implementation** ✅
   - Implement main worker entry point with request routing
   - Create health check endpoint
   - Create service info endpoint
   - Add CORS handling for cross-origin requests
   - Implement basic error handling and logging

5. **Durable Object Stub** ✅
   - Create RelayState Durable Object class
   - Implement basic state storage methods
   - Add cursor position tracking
   - Create state query endpoint

### Acceptance Criteria

- [x] Worker deploys successfully to Cloudflare
- [x] Health endpoint returns 200 OK
- [x] Service info endpoint returns correct metadata
- [x] CI/CD pipeline runs successfully on PR
- [x] Develop environment deploys on merge to develop branch
- [x] Production environment deploys on merge to main branch
- [x] All linting and type checking passes

---

## Phase 2: AT Protocol Integration

**Goal**: Implement AT Protocol subscription client and event ingestion.

### Tasks

1. **AT Protocol Client Library**
   - Install and configure @atproto/api and @atproto/xrpc
   - Create AT Protocol client wrapper
   - Implement authentication and session management
   - Add retry logic with exponential backoff

2. **PDS Subscription Client**
   - Implement com.atproto.sync.subscribeRepos subscription
   - Handle WebSocket connection to PDS
   - Parse incoming event frames (CBOR/JSON)
   - Extract and validate event metadata

3. **Cursor Management**
   - Store cursor position in Durable Object storage
   - Implement cursor checkpoint logic
   - Add cursor recovery on reconnection
   - Handle cursor resets and backfilling

4. **Event Validation**
   - Validate event schemas against AT Protocol specs
   - Verify signatures and authenticity
   - Filter invalid or malformed events
   - Log validation errors for debugging

5. **Connection Management**
   - Implement connection state machine
   - Handle disconnections and reconnections
   - Add exponential backoff for failed connections
   - Monitor connection health and lag

### Acceptance Criteria

- [ ] Successfully connects to a PDS firehose
- [ ] Receives and parses AT Protocol events
- [ ] Cursor position persists across restarts
- [ ] Reconnects automatically after disconnection
- [ ] Invalid events are filtered out
- [ ] Connection health metrics are logged

---

## Phase 3: Event Storage and Processing

**Goal**: Implement event storage, compression, and time-based partitioning.

### Tasks

1. **Event Normalization**
   - Normalize event formats to internal schema
   - Extract relevant metadata (timestamp, repo, type)
   - Generate event IDs and sequence numbers
   - Handle different event types (commit, identity, account)

2. **Compression Pipeline**
   - Implement brotli compression for events
   - Batch events for efficient compression
   - Compare compression ratios (brotli vs gzip)
   - Optimize compression level vs speed tradeoff

3. **Time-based Partitioning**
   - Implement hourly segment generation
   - Create segment manifests with metadata
   - Store segments in R2 buckets
   - Index segments in KV namespace

4. **Queue Integration**
   - Push normalized events to Cloudflare Queue
   - Implement queue consumer for batch processing
   - Handle queue backpressure
   - Add dead letter queue for failed events

5. **Blob Reference Management**
   - Extract CIDs from events
   - Store blob metadata (size, type, PDS URL)
   - Implement optional blob caching strategy
   - Generate presigned URLs for blob access

6. **Storage Lifecycle**
   - Configure R2 lifecycle rules for 62-day TTL
   - Set KV expiration for indices
   - Implement manual cleanup for edge cases
   - Monitor storage utilization

### Acceptance Criteria

- [ ] Events are compressed and stored in R2
- [ ] Segments are partitioned by hour
- [ ] KV indices allow fast lookups by time/cursor
- [ ] Blob references are tracked without storing binaries
- [ ] 62-day TTL is enforced on all data
- [ ] Queue handles backpressure gracefully

---

## Phase 4: Firehose Distribution

**Goal**: Implement real-time firehose streaming endpoint for live events.

### Tasks

1. **WebSocket Server**
   - Implement WebSocket upgrade handling
   - Accept client connections on firehose endpoint
   - Handle client authentication (if required)
   - Track active client connections

2. **Live Event Streaming**
   - Stream events from in-memory Durable Object buffer
   - Broadcast new events to connected clients
   - Implement cursor-based resumption
   - Handle slow clients with buffering

3. **Backpressure Management**
   - Monitor per-client send buffer
   - Throttle or drop slow clients
   - Implement fair queueing for multiple clients
   - Log client disconnect reasons

4. **Event Filtering**
   - Support collection filters (e.g., posts only)
   - Support repo filters (e.g., specific users)
   - Implement server-side filtering logic
   - Optimize filter performance

5. **Protocol Compliance**
   - Follow AT Protocol firehose specification
   - Implement proper frame encoding (CBOR)
   - Handle subscription parameters
   - Return appropriate error codes

### Acceptance Criteria

- [ ] Firehose endpoint accepts WebSocket connections
- [ ] Clients receive real-time events as they arrive
- [ ] Clients can resume from last cursor position
- [ ] Slow clients are throttled or disconnected
- [ ] Endpoint complies with AT Protocol specification
- [ ] Multiple clients can connect simultaneously

---

## Phase 5: Jetstream Historical Replay

**Goal**: Implement cursor-based historical replay for Jetstream clients.

### Tasks

1. **Jetstream Endpoint**
   - Create /jetstream WebSocket endpoint
   - Accept cursor parameter for replay start
   - Parse and validate cursor format
   - Handle invalid cursors gracefully

2. **Segment Replay**
   - Lookup segments by cursor/timestamp
   - Stream events from R2 segments
   - Decompress segments on-the-fly
   - Handle segment boundaries seamlessly

3. **Cursor Translation**
   - Map cursors to segment IDs
   - Implement cursor-to-timestamp conversion
   - Handle cursor ranges and gaps
   - Support both forward and backward seek

4. **Replay Performance**
   - Optimize R2 read patterns
   - Stream large segments without buffering
   - Implement parallel segment fetching
   - Cache hot segments in DO memory

5. **Live Catch-up**
   - Transition from historical to live streaming
   - Merge historical and real-time streams
   - Avoid duplicate events at boundary
   - Handle cursor synchronization

### Acceptance Criteria

- [ ] Jetstream endpoint accepts cursor parameter
- [ ] Historical events are replayed from storage
- [ ] Replay transitions smoothly to live stream
- [ ] Cursors correctly map to event positions
- [ ] Large replays complete without timeout
- [ ] No duplicate events at replay boundaries

---

## Phase 6: Monitoring and Observability

**Goal**: Implement comprehensive monitoring, metrics, and operational tooling.

### Tasks

1. **Metrics Collection**
   - Track event ingestion rate
   - Monitor cursor lag and drift
   - Measure storage utilization (KV/R2)
   - Count active client connections

2. **Health Endpoints**
   - Expand /health with detailed status
   - Add /metrics endpoint for Prometheus
   - Create /state endpoint for cursor info
   - Implement /admin endpoints for debugging

3. **Structured Logging**
   - Implement structured log format (JSON)
   - Add contextual logging (request IDs)
   - Configure log levels per environment
   - Send logs to Cloudflare Logpush

4. **Alerting**
   - Set up alerts for cursor lag exceeding threshold
   - Alert on high error rates
   - Monitor storage approaching limits
   - Track abnormal client disconnect rates

5. **Dashboards**
   - Create Grafana dashboard for key metrics
   - Visualize event throughput over time
   - Show cursor position and lag graphs
   - Display storage utilization trends

6. **Debugging Tools**
   - Implement debug mode with verbose logging
   - Add request tracing and correlation IDs
   - Create admin endpoint to inspect state
   - Build cursor inspection tool

### Acceptance Criteria

- [ ] Metrics are exported to monitoring system
- [ ] Health endpoint shows detailed relay status
- [ ] Alerts fire when thresholds are exceeded
- [ ] Dashboards visualize relay performance
- [ ] Logs are structured and searchable
- [ ] Debug tools aid in troubleshooting

---

## Phase 7: Scalability and Reliability

**Goal**: Optimize for scale, implement fault tolerance, and ensure high availability.

### Tasks

1. **Horizontal Scaling**
   - Validate stateless worker architecture
   - Test multiple worker instances
   - Ensure Durable Object handles fan-out
   - Benchmark request distribution

2. **Durable Object Optimization**
   - Implement efficient in-memory buffer
   - Use Durable Object alarms for periodic tasks
   - Optimize storage access patterns
   - Add checkpointing for state recovery

3. **Failure Scenarios**
   - Handle PDS outages gracefully
   - Recover from Durable Object resets
   - Deal with storage service failures
   - Test queue overflow scenarios

4. **Rate Limiting**
   - Implement global rate limits
   - Add per-client connection limits
   - Throttle excessive requests
   - Return appropriate 429 responses

5. **Load Testing**
   - Simulate high client connection load
   - Test with realistic event throughput
   - Measure latency under stress
   - Identify bottlenecks and optimize

6. **High Availability**
   - Ensure zero single points of failure
   - Implement graceful degradation
   - Add circuit breakers for upstream calls
   - Design for regional outages

### Acceptance Criteria

- [ ] Relay handles 1000+ concurrent clients
- [ ] Worker scales horizontally under load
- [ ] Durable Object remains responsive
- [ ] Failures are handled without data loss
- [ ] Rate limits prevent abuse
- [ ] Load tests meet performance targets

---

## Phase 8: Documentation and Developer Experience

**Goal**: Provide comprehensive documentation and tools for operators and consumers.

### Tasks

1. **API Documentation**
   - Document all endpoints with examples
   - Create OpenAPI/Swagger spec
   - Provide curl examples for each endpoint
   - Document error codes and responses

2. **Deployment Guide**
   - Write step-by-step deployment instructions
   - Document Cloudflare resource setup
   - Explain environment configuration
   - Provide troubleshooting tips

3. **Consumer Examples**
   - Create WebSocket client examples (JavaScript, Python, Go)
   - Show how to consume firehose endpoint
   - Demonstrate cursor-based replay
   - Provide filtering examples

4. **Operator Runbook**
   - Document common operational tasks
   - Provide incident response procedures
   - Explain cursor recovery process
   - List key metrics to monitor

5. **Architecture Documentation**
   - Create detailed architecture diagrams
   - Document data flow through components
   - Explain design decisions and tradeoffs
   - Provide system boundaries and interfaces

6. **Contributing Guide**
   - Write CONTRIBUTING.md with guidelines
   - Document code review process
   - Explain testing requirements
   - Provide development setup instructions

### Acceptance Criteria

- [ ] API documentation is complete and accurate
- [ ] Deployment guide enables self-service setup
- [ ] Consumer examples work out-of-box
- [ ] Operator runbook covers common scenarios
- [ ] Architecture is clearly documented
- [ ] Contributing guide lowers barrier to entry

---

## Phase 9: Validation and Interoperability

**Goal**: Ensure compliance with AT Protocol and validate against reference implementations.

### Tasks

1. **Protocol Conformance**
   - Review AT Protocol relay specifications
   - Validate against protocol test suite
   - Ensure frame encoding matches spec
   - Test cursor format compatibility

2. **Interoperability Testing**
   - Test with multiple PDS implementations
   - Compare output with Indigo relay
   - Verify compatibility with Bluesky clients
   - Test with Microcosm Constellation relay

3. **Edge Case Handling**
   - Test with malformed events
   - Handle missing or invalid cursors
   - Deal with out-of-order events
   - Process very large events

4. **Security Validation**
   - Audit for injection vulnerabilities
   - Validate all input parameters
   - Test authentication and authorization
   - Ensure secure storage of secrets

5. **Performance Benchmarks**
   - Compare latency with reference relays
   - Measure throughput vs Indigo
   - Benchmark storage efficiency
   - Evaluate cost per event

6. **Compatibility Matrix**
   - Document compatible PDS versions
   - Test with different client libraries
   - Validate cross-platform compatibility
   - Maintain version compatibility table

### Acceptance Criteria

- [ ] Passes AT Protocol conformance tests
- [ ] Works with multiple PDS implementations
- [ ] Compatible with reference relay behavior
- [ ] Handles all edge cases gracefully
- [ ] Security audit finds no critical issues
- [ ] Performance meets or exceeds targets

---

## Phase 10: Optimization and Hardening

**Goal**: Optimize performance, reduce costs, and harden for production use.

### Tasks

1. **Cost Optimization**
   - Analyze Cloudflare usage costs
   - Optimize KV read/write patterns
   - Reduce R2 API calls
   - Minimize worker CPU time

2. **Storage Optimization**
   - Tune compression parameters
   - Adjust segment size for efficiency
   - Optimize KV key structure
   - Reduce metadata overhead

3. **Network Optimization**
   - Minimize round trips
   - Batch KV/R2 operations
   - Use streaming where possible
   - Optimize WebSocket frame sizes

4. **Memory Management**
   - Profile Durable Object memory usage
   - Optimize in-memory buffer size
   - Reduce object allocations
   - Implement memory limits

5. **Error Recovery**
   - Improve error messages
   - Add detailed error context
   - Implement retry strategies
   - Create error recovery guides

6. **Production Hardening**
   - Add input validation everywhere
   - Implement defense in depth
   - Add redundant health checks
   - Prepare for security incidents

### Acceptance Criteria

- [ ] Monthly costs are within budget targets
- [ ] Storage efficiency is maximized
- [ ] Network bandwidth is optimized
- [ ] Memory usage is stable and bounded
- [ ] Errors provide actionable information
- [ ] System is hardened for production

---

## Phase 11: Beta Release

**Goal**: Prepare for beta release and onboard early users.

### Tasks

1. **Beta Environment**
   - Set up dedicated beta environment
   - Configure beta.edgerelay.at domain
   - Deploy beta version with feature flags
   - Set up separate monitoring

2. **Beta Documentation**
   - Write beta user guide
   - Document known limitations
   - Create quickstart tutorial
   - Prepare FAQ document

3. **User Onboarding**
   - Create sign-up process (if needed)
   - Develop onboarding emails
   - Prepare support channels
   - Build feedback collection system

4. **Beta Testing Plan**
   - Define beta test scenarios
   - Recruit beta testers
   - Collect feedback systematically
   - Track beta issues separately

5. **Stability Monitoring**
   - Enhanced monitoring for beta
   - Set up error reporting
   - Track user-reported issues
   - Monitor performance metrics

6. **Iteration Process**
   - Weekly beta releases
   - Rapid bug fixes
   - Feature refinements based on feedback
   - Regular communication with testers

### Acceptance Criteria

- [ ] Beta environment is stable and accessible
- [ ] Beta users can successfully connect
- [ ] Feedback is collected and tracked
- [ ] Critical issues are resolved quickly
- [ ] Beta documentation is comprehensive
- [ ] Beta test goals are met

---

## Phase 12: Production Launch

**Goal**: Launch production service and establish operational excellence.

### Tasks

1. **Production Readiness**
   - Complete pre-launch checklist
   - Conduct final security review
   - Perform load testing at scale
   - Validate disaster recovery procedures

2. **Launch Preparation**
   - Schedule launch date and time
   - Prepare launch communications
   - Coordinate with stakeholders
   - Set up launch monitoring

3. **Production Deployment**
   - Deploy to production environment
   - Configure edgerelay.at domain
   - Enable production monitoring
   - Activate alerting rules

4. **Launch Monitoring**
   - Monitor launch metrics closely
   - Be ready for rapid response
   - Track user adoption
   - Collect feedback immediately

5. **Post-Launch Support**
   - Provide 24/7 on-call coverage
   - Respond to issues promptly
   - Communicate status updates
   - Iterate based on production feedback

6. **Documentation Updates**
   - Update README with production URLs
   - Revise documentation based on launch learnings
   - Create production runbook
   - Publish case studies and blog posts

### Acceptance Criteria

- [ ] Production service is live and stable
- [ ] Users can successfully connect
- [ ] All production metrics are green
- [ ] Support channels are active
- [ ] Launch goals are achieved
- [ ] Documentation reflects production reality

---

## Implementation Notes

### General Guidelines

1. **Iterative Development**: Each phase should be completed iteratively with frequent testing and validation.

2. **Code Reviews**: All code changes must go through PR review process with at least one approval.

3. **Testing**: Each phase must include appropriate unit tests, integration tests, and manual testing.

4. **Documentation**: Update documentation continuously as features are implemented.

5. **Rollback Plan**: Every deployment must have a clear rollback strategy.

6. **Performance**: Monitor performance continuously and optimize proactively.

### Dependencies

- Some phases have dependencies on previous phases
- Phase 1 must be complete before starting Phase 2
- Phases 4 and 5 can be developed in parallel after Phase 3
- Phase 6 should run concurrently with later phases
- Optimization (Phase 10) is ongoing throughout all phases

### Risk Management

- **Technical Risks**: Cloudflare service limits, AT Protocol changes, PDS availability
- **Mitigation**: Thorough testing, monitoring, graceful degradation, clear documentation
- **Performance Risks**: High load, storage costs, worker CPU limits
- **Mitigation**: Load testing, cost monitoring, optimization, rate limiting

### Success Criteria

The EdgeRelay project will be considered successful when:

1. The relay successfully ingests events from at least one PDS
2. Clients can connect and receive real-time firehose streams
3. Historical replay works correctly with cursor-based seeking
4. 62-day retention is enforced automatically
5. The system scales to handle 1000+ concurrent clients
6. Operational costs are sustainable
7. Documentation enables self-service deployment
8. The relay is compatible with standard AT Protocol clients

---

## Conclusion

This development outline provides a structured approach to building EdgeRelay from foundation to production. Each phase builds upon previous work, with clear goals and acceptance criteria. The modular design allows for parallel development of independent components while maintaining a cohesive architecture.

The timeline for completion will depend on team size, resources, and priorities, but this outline ensures that progress is measurable and the project moves steadily toward a production-ready AT Protocol relay on Cloudflare Workers.