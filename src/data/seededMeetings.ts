import { Meeting } from '../types';

export const seededMeetings: Meeting[] = [
  {
    id: 'meeting-arch-q4',
    title: 'Q4 Core Architecture & Distributed Cache Strategy',
    category: 'architecture',
    date: '2026-09-29T14:00:00Z',
    durationMinutes: 58,
    status: 'completed',
    location: 'Zoom (Room Alpha)',
    audioUrl: '/audio/q4-core-architecture.wav',
    audioDurationSeconds: 185,
    preview: 'Agreed to adopt Redis Cluster with Raft consensus for the session tier; rejected write-behind caching due to data loss risk.',
    participants: [
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Staff Systems Architect', avatarColor: '#3b82f6', isHost: true },
      { id: 'u2', name: 'Marcus Vance', email: 'marcus.v@fanthom.ai', role: 'Principal Backend Engineer', avatarColor: '#10b981' },
      { id: 'u3', name: 'Sarah Lin', email: 'sarah.lin@fanthom.ai', role: 'VP of Engineering', avatarColor: '#8b5cf6' },
      { id: 'u4', name: 'Dave Kowalski', email: 'dave.k@fanthom.ai', role: 'SRE Infrastructure Lead', avatarColor: '#f59e0b' },
      { id: 'u5', name: 'Elena Rostova', email: 'elena.r@fanthom.ai', role: 'Data Platform Lead', avatarColor: '#ec4899' },
      { id: 'u6', name: 'James Thornton', email: 'james.t@fanthom.ai', role: 'Frontend Architecture Lead', avatarColor: '#06b6d4' },
      { id: 'u7', name: 'Rachel Chen', email: 'rachel.c@fanthom.ai', role: 'Director of Product', avatarColor: '#6366f1' },
      { id: 'u8', name: 'Tom Becker', email: 'tom.b@fanthom.ai', role: 'Security Architect', avatarColor: '#ef4444' }
    ],
    transcript: [
      {
        id: 't1',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 0,
        endTime: 24,
        demoStartTime: 1.5,
        demoEndTime: 18.4,
        text: "Thanks everyone for joining the Q4 core architecture sync. Today we need a definitive decision on our distributed caching layer. Our current Memcached cluster is hitting hot-shard limits during morning spikes.",
        sentiment: 'neutral'
      },
      {
        id: 't2',
        speakerId: 'u2',
        speakerName: 'Marcus Vance',
        startTime: 25,
        endTime: 62,
        demoStartTime: 26.9,
        demoEndTime: 50.5,
        text: "The primary issue is p99 latency climbing past 450 milliseconds whenever three enterprise clients sync their calendar indexes simultaneously. I evaluated two proposals: upgrading our Memcached topology with consistent hashing, versus migrating to a multi-node Redis cluster with active read-replicas.",
        sentiment: 'neutral'
      },
      {
        id: 't3',
        speakerId: 'u4',
        speakerName: 'Dave Kowalski',
        startTime: 63,
        endTime: 104,
        demoStartTime: 60.0,
        demoEndTime: 81.3,
        text: "From an SRE perspective, operating standalone Memcached instances across three AWS availability zones has caused intermittent split-brain scenarios when VPC peering drops. Redis 7 with failover automation would cut our on-call pages by at least forty percent.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Infra Reliability'
      },
      {
        id: 't4',
        speakerId: 'u8',
        speakerName: 'Tom Becker',
        startTime: 105,
        endTime: 142,
        text: "Before we get too excited about Redis, what is our encryption in transit policy? We handle SOC2 Type II and HIPAA data for our healthcare clients. We cannot allow unencrypted TLS payloads between cache nodes.",
        sentiment: 'concern'
      },
      {
        id: 't5',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 143,
        endTime: 185,
        demoStartTime: 89.8,
        demoEndTime: 97.8,
        text: "Given the reliability concerns, I'm leaning toward Redis 7 with Raft consensus for the session tier. The architecture RFC mandates mutual TLS on port 6380 with automated Let's Encrypt certificate rotation via HashiCorp Vault.",
        sentiment: 'positive'
      },
      {
        id: 't6',
        speakerId: 'u5',
        speakerName: 'Elena Rostova',
        startTime: 186,
        endTime: 230,
        text: "How are we invalidating stale meeting metadata? If an organizer deletes a recording, GDPR mandates immediate purging. If we use write-behind caching, there is a risk of a 30-second window where deleted recordings could still be served from cache.",
        sentiment: 'concern'
      },
      {
        id: 't8',
        speakerId: 'u3',
        speakerName: 'Sarah Lin',
        startTime: 276,
        endTime: 318,
        demoStartTime: 105.2,
        demoEndTime: 114.7,
        text: "I agree, but we need to make sure the migration doesn't introduce data consistency problems during the transition. Can we do a zero-downtime blue-green cutover, or will we need a scheduled maintenance window over a weekend?",
        sentiment: 'neutral'
      },
      {
        id: 't7',
        speakerId: 'u2',
        speakerName: 'Marcus Vance',
        startTime: 231,
        endTime: 275,
        demoStartTime: 122.2,
        demoEndTime: 129.5,
        text: "Then we should explicitly reject write-behind caching and use dual-write shadow traffic during the migration, backed by a Kafka dead-letter queue for retries.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Data Integrity'
      },
      {
        id: 't9',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 319,
        endTime: 368,
        demoStartTime: 137.5,
        demoEndTime: 147.7,
        text: "Agreed. We'll start with a 10 percent canary, monitor the failover benchmarks, and expand over two sprints without any user downtime.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Rollout Plan'
      },
      {
        id: 't10',
        speakerId: 'u7',
        speakerName: 'Rachel Chen',
        startTime: 369,
        endTime: 405,
        text: "That timeline aligns well with the enterprise launch we have scheduled for late October. Sales has three Fortune 500 pilots waiting on our 99.99% uptime commitment.",
        sentiment: 'positive'
      },
      {
        id: 't11',
        speakerId: 'u4',
        speakerName: 'Dave Kowalski',
        startTime: 406,
        endTime: 448,
        demoStartTime: 155.2,
        demoEndTime: 162.7,
        text: "That gives SRE a clear rollback path and removes the current single-cluster failure concern.",
        sentiment: 'positive'
      },
      {
        id: 't12',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 449,
        endTime: 495,
        demoStartTime: 170.7,
        demoEndTime: 180.8,
        text: "Let's record the decision: Redis 7 cluster migration, no write-behind caching, and a phased dual-write rollout. Marcus will lead backend implementation, Dave handles Terraform infra, and Tom reviews security certificates.",
        sentiment: 'positive'
      }
    ],
    summaries: {
      general: {
        overview: 'The architecture team approved RFC-204 to replace the legacy Memcached cluster with a fault-tolerant Redis Cluster across 3 AWS Availability Zones. The migration will be conducted using shadow-reads and dual-writes over two sprints to guarantee zero customer downtime.',
        keyTopics: [
          {
            title: 'Latency Spikes & Scalability Limits',
            notes: [
              'Memcached hot-sharding caused p99 response times to exceed 450ms during peak enterprise calendar syncs.',
              'Cross-AZ network blips resulted in intermittent split-brain states.'
            ]
          },
          {
            title: 'Security, Compliance & Invalidation',
            notes: [
              'Mandatory mutual TLS on port 6380 with automatic Vault certificate rotation.',
              'Application-level AES-256-GCM encryption for meeting access tokens before caching.',
              'Rejected write-behind caching in favor of strict write-through with PostgreSQL to enforce immediate GDPR deletion guarantees.'
            ]
          },
          {
            title: 'Phased Zero-Downtime Rollout',
            notes: [
              'Sprint 1: Deploy Redis in shadow-read mode and validate parity.',
              'Sprint 2: Ramp tenant traffic from 10% to 100% while observing Datadog p99 latency.'
            ]
          }
        ],
        decisionsSummary: [
          'Approved RFC-204: Transition from Memcached to Redis 7 Cluster.',
          'Adopted write-through cache invalidation with dual-write to PostgreSQL.',
          'Mandated mutual TLS with HashiCorp Vault certificate auto-rotation.'
        ],
        nextSteps: [
          'Marcus to finalize Redis connection pooling library by Friday.',
          'Dave to provision staging Redis cluster in us-west-2 via Terraform.',
          'Tom to sign off on mTLS cipher suites and compliance posture.'
        ]
      },
      sales: {
        overview: 'Architecture upgrade specifically addresses enterprise readiness requirements, directly unlocking three Fortune 500 sales prospects waiting on 99.99% SLA guarantees.',
        keyTopics: [
          {
            title: 'Customer SLA Impact',
            notes: [
              'Reduces p99 latency from 450ms down to sub-50ms.',
              'Guarantees 99.99% availability during simultaneous high-volume calendar synchronizations.'
            ]
          },
          {
            title: 'Security Certifications',
            notes: [
              'Full compliance with enterprise security requirements (SOC2 Type II, HIPAA, GDPR).',
              'End-to-end data encryption in transit and at rest.'
            ]
          }
        ],
        decisionsSummary: [
          'Infrastructure upgrade committed for completion ahead of late October customer pilots.'
        ],
        nextSteps: [
          'Rachel to update Enterprise Sales collateral with new sub-50ms sync latency figures.'
        ]
      },
      project: {
        overview: 'Sprint planning and milestone allocation for RFC-204 rollout across backend, infra, security, and web client teams.',
        keyTopics: [
          {
            title: 'Sprint 24.1 (Oct 1 - Oct 14)',
            notes: [
              'Terraform staging cluster provisioning (Dave Kowalski).',
              'Client-side connection pooling & dual-write shadow implementation (Marcus Vance).'
            ]
          },
          {
            title: 'Sprint 24.2 (Oct 15 - Oct 28)',
            notes: [
              '10% canary traffic rollout and Datadog p99 validation.',
              'Frontend meeting player simplification (James Thornton).'
            ]
          }
        ],
        decisionsSummary: [
          'No scheduled maintenance windows; zero-downtime blue/green deployment strategy approved.'
        ],
        nextSteps: [
          'Create Jira epic ARCH-204 with 6 subtasks linked to engineering leads.'
        ]
      },
      'one-on-one': {
        overview: 'Architectural leadership review: Pravalika successfully navigated competing stakeholder concerns from Security, SRE, and Product into a unified roadmap.',
        keyTopics: [
          {
            title: 'Technical Leadership',
            notes: [
              'Pravalika synthesized complex caching tradeoffs and resolved GDPR compliance concerns proactively.',
              'Cross-team consensus achieved smoothly between 8 senior engineers and directors.'
            ]
          }
        ],
        decisionsSummary: [
          'Pravalika will serve as executive sponsor for the Q4 infrastructure tier migration.'
        ],
        nextSteps: [
          'Schedule bi-weekly status sync between Sarah Lin and Pravalika to monitor rollout milestones.'
        ]
      }
    },
    actionItems: [
      {
        id: 'act-1',
        description: 'Complete Redis cluster connection pooling PR with circuit-breaker fallback',
        assigneeId: 'u2',
        assigneeName: 'Marcus Vance',
        dueDate: 'Oct 3, 2026',
        completed: false,
        timestampSeconds: 231,
        demoTimestampSeconds: 122,
        meetingId: 'meeting-arch-q4'
      },
      {
        id: 'act-2',
        description: 'Provision staging Redis cluster across 3 availability zones using Terraform',
        assigneeId: 'u4',
        assigneeName: 'Dave Kowalski',
        dueDate: 'Oct 6, 2026',
        completed: false,
        timestampSeconds: 63,
        demoTimestampSeconds: 60,
        meetingId: 'meeting-arch-q4'
      },
      {
        id: 'act-3',
        description: 'Review and approve mutual TLS cipher suites for HashiCorp Vault certificate auto-rotation',
        assigneeId: 'u8',
        assigneeName: 'Tom Becker',
        dueDate: 'Oct 5, 2026',
        completed: true,
        timestampSeconds: 143,
        demoTimestampSeconds: 90,
        meetingId: 'meeting-arch-q4'
      },
      {
        id: 'act-4',
        description: 'Begin 10% canary rollout and monitor failover benchmarks over two sprints',
        assigneeId: 'u1',
        assigneeName: 'Pravalika Palle',
        dueDate: 'Oct 14, 2026',
        completed: false,
        timestampSeconds: 319,
        demoTimestampSeconds: 138,
        meetingId: 'meeting-arch-q4'
      }
    ],
    decisions: [
      {
        id: 'dec-1',
        title: 'Approve RFC-204: Redis 7 Cluster Migration',
        description: 'Replace Memcached with multi-node Redis cluster with automatic failover to eliminate hot-sharding bottlenecks.',
        timestampSeconds: 449,
        demoTimestampSeconds: 171,
        decidedBy: 'Pravalika Palle & Sarah Lin',
        category: 'architecture'
      },
      {
        id: 'dec-2',
        title: 'Mandate Write-Through Invalidation Policy',
        description: 'Rejected write-behind caching to eliminate GDPR deletion latency risks and protect data consistency.',
        timestampSeconds: 231,
        demoTimestampSeconds: 122,
        decidedBy: 'Marcus Vance & Elena Rostova',
        category: 'architecture'
      },
      {
        id: 'dec-3',
        title: 'Enforce Dual-Write Shadow Rollout Strategy',
        description: 'Deploy shadow reads and phased 10% canary traffic ramp over two sprints without user-facing maintenance windows.',
        timestampSeconds: 319,
        demoTimestampSeconds: 138,
        decidedBy: 'Pravalika Palle',
        category: 'timeline'
      }
    ],
    highlights: [
      {
        id: 'hl-1',
        title: 'SRE Reliability Analysis',
        excerpt: 'Redis 7 with failover automation would cut our on-call pages by at least forty percent.',
        speakerName: 'Dave Kowalski',
        timestampSeconds: 63,
        demoTimestampSeconds: 60,
        durationSeconds: 21,
        category: 'breakthrough',
        shareUrl: 'https://fanthom.ai/m/meeting-arch-q4?t=63'
      },
      {
        id: 'hl-2',
        title: 'Write-Through vs Write-Behind Decision',
        excerpt: 'Then we should explicitly reject write-behind caching and use dual-write shadow traffic during the migration.',
        speakerName: 'Marcus Vance',
        timestampSeconds: 231,
        demoTimestampSeconds: 122,
        durationSeconds: 8,
        category: 'decision',
        shareUrl: 'https://fanthom.ai/m/meeting-arch-q4?t=231'
      },
      {
        id: 'hl-3',
        title: 'Zero Downtime Shadow Deployment',
        excerpt: 'Agreed. We\'ll start with a 10 percent canary, monitor the failover benchmarks, and expand over two sprints.',
        speakerName: 'Pravalika Palle',
        timestampSeconds: 319,
        demoTimestampSeconds: 138,
        durationSeconds: 10,
        category: 'decision',
        shareUrl: 'https://fanthom.ai/m/meeting-arch-q4?t=319'
      }
    ],
    brief: {
      previousMeetingDate: 'Sept 15, 2026',
      previousDecisions: [
        'Agreed that Memcached horizontal scaling was reaching physical diminishing returns.',
        'Commissioned Marcus Vance to write RFC-204.'
      ],
      openActionItems: [
        'Marcus: Benchmark Redis 7 throughput on c6i.2xlarge instances (Completed).',
        'Dave: Map cross-AZ latency overhead (Completed).'
      ],
      suggestedTalkingPoints: [
        'Review AWS cost impact of Redis Cluster vs Memcached instances.',
        'Align on client-side retry budgets to prevent thundering herd on cold cache.'
      ],
      historicalContext: 'Core API traffic surged 320% year-over-year following enterprise expansion, causing database thread exhaustion during morning synchronization spikes.'
    },
    stats: {
      wordsSpoken: 1240,
      speakingRatio: {
        u1: 32,
        u2: 24,
        u3: 10,
        u4: 12,
        u5: 8,
        u6: 6,
        u7: 4,
        u8: 4
      },
      sentimentScore: 88
    }
  },
  {
    id: 'meeting-sales-acme',
    title: 'Acme Corp — Enterprise Contract & Custom SLA Review',
    category: 'sales',
    date: '2026-09-28T16:30:00Z',
    durationMinutes: 35,
    status: 'completed',
    location: 'Google Meet',
    preview: 'Negotiated 99.99% custom SLA terms, agreed on 500-seat volume tier at $28/seat/mo, and committed to HIPAA BAA execution.',
    participants: [
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Solutions Architect', avatarColor: '#3b82f6', isHost: true },
      { id: 'u9', name: 'Alex Morgan', email: 'alex.m@fanthom.ai', role: 'Enterprise Account Executive', avatarColor: '#f97316' },
      { id: 'u10', name: 'Jordan Reed', email: 'jreed@acmecorp.com', role: 'VP of Procurement, Acme Corp', avatarColor: '#84cc16' },
      { id: 'u11', name: 'Priya Sharma', email: 'psharma@acmecorp.com', role: 'Director of IT Security, Acme Corp', avatarColor: '#a855f7' }
    ],
    transcript: [
      {
        id: 'st1',
        speakerId: 'u9',
        speakerName: 'Alex Morgan',
        startTime: 0,
        endTime: 22,
        text: "Thanks Jordan and Priya for taking the time today. We wanted to walk through the redlines on the enterprise agreement and answer any technical questions on our security infrastructure.",
        sentiment: 'neutral'
      },
      {
        id: 'st2',
        speakerId: 'u10',
        speakerName: 'Jordan Reed',
        startTime: 23,
        endTime: 58,
        text: "Thanks Alex. Our chief concern is the financial penalty clause on the 99.99% SLA. If our 500 customer success managers cannot record critical quarterly business reviews, we need service credits calculated hourly rather than monthly.",
        sentiment: 'concern',
        highlighted: true,
        highlightTag: 'Pricing Objection'
      },
      {
        id: 'st3',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 59,
        endTime: 102,
        text: "Jordan, that is completely reasonable. Our active-active multi-region deployment across US-East and US-West maintains a sub-second health-check failover. We are confident agreeing to hourly service credit calculations up to 30% of monthly contract value.",
        sentiment: 'positive'
      },
      {
        id: 'st4',
        speakerId: 'u11',
        speakerName: 'Priya Sharma',
        startTime: 103,
        endTime: 145,
        text: "That addresses our operational reliability risk. Regarding our security audit: can you confirm that audio and transcript recordings are encrypted using tenant-specific KMS keys?",
        sentiment: 'neutral'
      },
      {
        id: 'st5',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 146,
        endTime: 190,
        text: "Yes, Priya. In our Enterprise tier, we support Customer Managed Encryption Keys (CMEK) via AWS KMS or HashiCorp Vault. If your security team revokes the key in your KMS console, all data immediately becomes unreadable by our systems.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'CMEK Security'
      },
      {
        id: 'st6',
        speakerId: 'u10',
        speakerName: 'Jordan Reed',
        startTime: 191,
        endTime: 228,
        text: "Excellent. If we can finalize the pricing at $28 per user per month for the initial 500 seats on a two-year commitment, we are ready to sign before the end of the quarter.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Deal Terms'
      }
    ],
    summaries: {
      general: {
        overview: 'Successful commercial and security negotiation with Acme Corp for 500 enterprise seats. Both parties aligned on hourly SLA service credit penalties and CMEK encryption.',
        keyTopics: [
          {
            title: 'SLA & Reliability Agreement',
            notes: [
              'Agreed to 99.99% uptime with hourly service credit penalties capped at 30% monthly recurring revenue.',
              'Demonstrated active-active multi-region failover between us-east-1 and us-west-2.'
            ]
          },
          {
            title: 'Security & CMEK Compliance',
            notes: [
              'Confirmed support for Customer Managed Encryption Keys (CMEK) via AWS KMS.',
              'Instant cryptographic wipe upon tenant KMS revocation.'
            ]
          }
        ],
        decisionsSummary: [
          'Accepted hourly service credits penalty for SLA breaches.',
          'Agreed to $28/seat/month on a 500-seat 2-year commitment ($336,000 ARR).'
        ],
        nextSteps: [
          'Alex to issue updated master services agreement with CMEK appendix by Wednesday.',
          'Jordan Reed to route to Acme Corp legal for signature before Friday.'
        ]
      },
      sales: {
        overview: 'Deal closing call: 500 enterprise seats secured at $28/seat/mo ($336k ARR, $672k TCV) on a 2-year contract.',
        keyTopics: [
          {
            title: 'Commercial Terms',
            notes: [
              'Seats: 500 users initially with expansion rights at same unit price.',
              'Payment terms: Net-30 annual in advance.'
            ]
          },
          {
            title: 'Key Buying Triggers',
            notes: [
              'CMEK tenant encryption was a non-negotiable blocker resolved by Pravalika.',
              'Fathom meeting summaries will integrate directly into Acme Corp Salesforce instance.'
            ]
          }
        ],
        decisionsSummary: [
          'Closed win pending final signature on updated order form.'
        ],
        nextSteps: [
          'Send signature packet via DocuSign today.'
        ]
      },
      project: {
        overview: 'Onboarding roadmap for Acme Corp: 500 customer success users to be provisioned by November 1.',
        keyTopics: [
          {
            title: 'Integration Milestones',
            notes: [
              'Week 1: AWS KMS CMEK key integration & testing.',
              'Week 2: Okta SAML 2.0 Single Sign-On configuration.',
              'Week 3: CSM team training and Zoom app rollout.'
            ]
          }
        ],
        decisionsSummary: [
          'Dedicated enterprise onboarding engineer assigned to Acme Corp account.'
        ],
        nextSteps: [
          'Schedule kickoff call with Priya Sharma for next Tuesday.'
        ]
      },
      'one-on-one': {
        overview: 'Partner sync between Sales and Architecture on enterprise client technical objection handling.',
        keyTopics: [
          {
            title: 'Sales Engineering Collaboration',
            notes: [
              "Pravalika's quick technical clarification on CMEK encryption prevented deal delay.",
              'Template for hourly SLA penalty language can be reused for upcoming global bank prospects.'
            ]
          }
        ],
        decisionsSummary: [
          'Standardize CMEK technical whitepaper for enterprise AE distribution.'
        ],
        nextSteps: [
          'Publish CMEK architecture diagram on internal Notion knowledgebase.'
        ]
      }
    },
    actionItems: [
      {
        id: 'act-sales-1',
        description: 'Send updated MSA with 99.99% hourly SLA credits and CMEK appendix to Jordan Reed',
        assigneeId: 'u9',
        assigneeName: 'Alex Morgan',
        dueDate: 'Oct 1, 2026',
        completed: false,
        timestampSeconds: 191,
        meetingId: 'meeting-sales-acme'
      },
      {
        id: 'act-sales-2',
        description: 'Provide AWS KMS policy template and IAM role ARN to Priya Sharma',
        assigneeId: 'u1',
        assigneeName: 'Pravalika Palle',
        dueDate: 'Oct 2, 2026',
        completed: false,
        timestampSeconds: 146,
        meetingId: 'meeting-sales-acme'
      }
    ],
    decisions: [
      {
        id: 'dec-sales-1',
        title: 'Approve $28/seat/mo on 2-Year Contract',
        description: 'Closed 500-seat enterprise deal at $28 per user per month with 2-year commitment.',
        timestampSeconds: 191,
        decidedBy: 'Jordan Reed & Alex Morgan',
        category: 'pricing'
      },
      {
        id: 'dec-sales-2',
        title: 'Enable CMEK KMS Support for Tenant',
        description: 'Commit to Customer Managed Encryption Keys (CMEK) deployment ahead of production onboarding.',
        timestampSeconds: 146,
        decidedBy: 'Pravalika Palle',
        category: 'product'
      }
    ],
    highlights: [
      {
        id: 'hl-sales-1',
        title: 'SLA Credit Negotiation',
        excerpt: 'If our 500 customer success managers cannot record critical QBRs, we need service credits calculated hourly.',
        speakerName: 'Jordan Reed',
        timestampSeconds: 23,
        durationSeconds: 35,
        category: 'objection',
        shareUrl: 'https://fanthom.ai/m/meeting-sales-acme?t=23'
      },
      {
        id: 'hl-sales-2',
        title: 'Deal Terms Finalized',
        excerpt: 'If we can finalize the pricing at $28 per user per month for the initial 500 seats on a two-year commitment, we are ready to sign.',
        speakerName: 'Jordan Reed',
        timestampSeconds: 191,
        durationSeconds: 37,
        category: 'decision',
        shareUrl: 'https://fanthom.ai/m/meeting-sales-acme?t=191'
      }
    ],
    brief: {
      previousMeetingDate: 'Sept 14, 2026',
      previousDecisions: [
        'Acme Corp completed a 14-day technical proof-of-concept with 25 pilot users.',
        'Achieved 96% positive user sentiment among pilot team.'
      ],
      openActionItems: [
        'Alex Morgan: Deliver SOC2 Type II compliance package (Completed).'
      ],
      suggestedTalkingPoints: [
        'Address procurement terms regarding hourly SLA downtime credits.',
        'Confirm timeline for CMEK key sharing and enterprise SAML rollout.'
      ],
      historicalContext: 'Acme Corp is evaluating replacing their fragmented Zoom AI notetaker with Fanthom AI for centralized meeting records and automated CRM syncing.'
    },
    stats: {
      wordsSpoken: 890,
      speakingRatio: {
        u1: 35,
        u9: 20,
        u10: 25,
        u11: 20
      },
      sentimentScore: 92
    }
  },
  {
    id: 'meeting-eng-mobile',
    title: 'Weekly Mobile App Sprint & Performance Regression',
    category: 'engineering',
    date: '2026-09-27T10:00:00Z',
    durationMinutes: 25,
    status: 'completed',
    location: 'Huddle',
    preview: 'Triaged iOS 18 cold start regression caused by redundant SQLite schema migrations; rolled back prefetch hook to restore 180ms startup.',
    participants: [
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Staff Systems Architect', avatarColor: '#3b82f6', isHost: true },
      { id: 'u12', name: 'Carlos Mendez', email: 'carlos.m@fanthom.ai', role: 'Lead iOS Engineer', avatarColor: '#eab308' },
      { id: 'u13', name: 'Nina Patel', email: 'nina.p@fanthom.ai', role: 'Staff QA Engineer', avatarColor: '#14b8a6' },
      { id: 'u7', name: 'Rachel Chen', email: 'rachel.c@fanthom.ai', role: 'Director of Product', avatarColor: '#6366f1' }
    ],
    transcript: [
      {
        id: 'mt1',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 0,
        endTime: 20,
        text: "Let's dive right into the iOS crash and latency telemetry. Our Sentry dashboard showed app launch times jumping from 190ms to 840ms after v4.2.1 shipped.",
        sentiment: 'concern'
      },
      {
        id: 'mt2',
        speakerId: 'u12',
        speakerName: 'Carlos Mendez',
        startTime: 21,
        endTime: 55,
        text: "I tracked it down this morning. In v4.2.1, we added an eager SQLite schema check inside AppDelegate before UI rendering. On devices with more than 50 local cached transcripts, the WAL file checkpoint blocks the main run loop.",
        sentiment: 'neutral',
        highlighted: true,
        highlightTag: 'Root Cause'
      },
      {
        id: 'mt3',
        speakerId: 'u13',
        speakerName: 'Nina Patel',
        startTime: 56,
        endTime: 88,
        text: "That explains why our clean test simulators were passing QA, but our beta testers with extensive historical data experienced severe launch lag and watchdog timeouts.",
        sentiment: 'neutral'
      },
      {
        id: 'mt4',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 89,
        endTime: 125,
        text: "Let's decouple the schema check from app launch. We can move database integrity checks and WAL checkpointing to a background dispatch queue with a 2-second delay after initial view appearance.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Fix Strategy'
      }
    ],
    summaries: {
      general: {
        overview: 'Identified and remediated an iOS 18 cold start performance regression caused by synchronous SQLite database checks on the main thread during app initialization.',
        keyTopics: [
          {
            title: 'Telemetry & Root Cause Analysis',
            notes: [
              'App startup time regressed from 190ms to 840ms on devices with large historical transcript caches.',
              'Synchronous SQLite WAL checkpointing blocked the main UI thread during AppDelegate launch.'
            ]
          },
          {
            title: 'Fix & Deployment Plan',
            notes: [
              'Move database integrity checks to a background GCD queue.',
              'Deploy hotfix build v4.2.2 to TestFlight today for QA verification.'
            ]
          }
        ],
        decisionsSummary: [
          'Approve background dispatch architecture for all mobile database migrations.',
          'Release hotfix v4.2.2 immediately.'
        ],
        nextSteps: [
          'Carlos to submit PR with asynchronous database loader by 2 PM.',
          'Nina to run regression suite on high-density test devices.'
        ]
      },
      sales: {
        overview: 'Mobile app reliability hotfix ensures smooth mobile recording for executives on the go.',
        keyTopics: [
          {
            title: 'Customer Experience Impact',
            notes: [
              'Eliminates app launch freezing for power users with 100+ recorded meetings.'
            ]
          }
        ],
        decisionsSummary: [
          'Priority hotfix deployed before customer business hours tomorrow.'
        ],
        nextSteps: [
          'Notify customer support team that fix is in flight.'
        ]
      },
      project: {
        overview: 'Sprint adjustment: shifting 1 engineering day to deploy hotfix v4.2.2.',
        keyTopics: [
          {
            title: 'Sprint Capacity',
            notes: [
              'Carlos will postpone the Apple Watch widget task until Sprint 25 to prioritize the launch regression.'
            ]
          }
        ],
        decisionsSummary: [
          'Watch widget deferred by one sprint.'
        ],
        nextSteps: [
          'Update sprint board in Linear.'
        ]
      },
      'one-on-one': {
        overview: 'Debugging review: Excellent root-cause turnaround by Carlos Mendez.',
        keyTopics: [
          {
            title: 'Engineering Quality',
            notes: [
              'Commend Carlos for isolating the WAL checkpoint bottleneck within 3 hours.'
            ]
          }
        ],
        decisionsSummary: [
          'Add automated cold-start benchmark with 200 mock transcripts to mobile CI pipeline.'
        ],
        nextSteps: [
          'Setup synthetic database benchmark in GitHub Actions.'
        ]
      }
    },
    actionItems: [
      {
        id: 'act-mob-1',
        description: 'Move SQLite WAL checkpointing to background queue in AppDelegate.swift',
        assigneeId: 'u12',
        assigneeName: 'Carlos Mendez',
        dueDate: 'Today, 2:00 PM',
        completed: false,
        timestampSeconds: 89,
        meetingId: 'meeting-eng-mobile'
      },
      {
        id: 'act-mob-2',
        description: 'Execute stress test on iPhone 15 Pro with 250 cached meetings',
        assigneeId: 'u13',
        assigneeName: 'Nina Patel',
        dueDate: 'Today, 5:00 PM',
        completed: false,
        timestampSeconds: 56,
        meetingId: 'meeting-eng-mobile'
      }
    ],
    decisions: [
      {
        id: 'dec-mob-1',
        title: 'Asynchronous Mobile Database Initialization',
        description: 'Ban synchronous SQLite schema queries on the main thread; enforce async background queue dispatch.',
        timestampSeconds: 89,
        decidedBy: 'Pravalika Palle & Carlos Mendez',
        category: 'architecture'
      }
    ],
    highlights: [
      {
        id: 'hl-mob-1',
        title: 'Launch Regression Root Cause',
        excerpt: 'On devices with more than 50 local cached transcripts, the WAL file checkpoint blocks the main run loop.',
        speakerName: 'Carlos Mendez',
        timestampSeconds: 21,
        durationSeconds: 34,
        category: 'breakthrough',
        shareUrl: 'https://fanthom.ai/m/meeting-eng-mobile?t=21'
      }
    ],
    brief: {
      previousMeetingDate: 'Sept 20, 2026',
      previousDecisions: [
        'Shipped v4.2.0 featuring offline transcript search.'
      ],
      openActionItems: [
        'Carlos: Integrate offline whisper model for local voice notes (In progress).'
      ],
      suggestedTalkingPoints: [
        'Review Sentry crash rates for v4.2.1.',
        'Address memory footprint when streaming audio over cellular.'
      ],
      historicalContext: 'Mobile app downloads grew 85% this month as distributed field sales representatives adopted mobile recording.'
    },
    stats: {
      wordsSpoken: 450,
      speakingRatio: {
        u1: 40,
        u12: 35,
        u13: 20,
        u7: 5
      },
      sentimentScore: 78
    }
  },
  {
    id: 'meeting-1on1-sarah',
    title: 'Bi-Weekly 1:1: Career Progression & Staff Level Scope',
    category: 'one-on-one',
    date: '2026-09-25T11:00:00Z',
    durationMinutes: 30,
    status: 'completed',
    location: '1:1 Private Sync',
    preview: 'Discussed expanding architectural leadership scope to cover cross-team real-time streaming infrastructure and mentoring mid-level engineers.',
    participants: [
      { id: 'u3', name: 'Sarah Lin', email: 'sarah.lin@fanthom.ai', role: 'VP of Engineering', avatarColor: '#8b5cf6', isHost: true },
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Staff Systems Architect', avatarColor: '#3b82f6' }
    ],
    transcript: [
      {
        id: 'ot1',
        speakerId: 'u3',
        speakerName: 'Sarah Lin',
        startTime: 0,
        endTime: 28,
        text: "Pravalika, really glad we have this time today. First off, phenomenal job steering the distributed caching RFC through the architecture guild. The clarity in your technical documentation received praise from Marcus and Dave alike.",
        sentiment: 'positive'
      },
      {
        id: 'ot2',
        speakerId: 'u1',
        speakerName: 'Pravalika Palle',
        startTime: 29,
        endTime: 64,
        text: "Thank you Sarah! I really enjoyed working through the tradeoffs with Elena and Tom on the GDPR and mutual TLS requirements. I feel like we got everyone aligned around the right long-term architecture rather than a quick patch.",
        sentiment: 'positive'
      },
      {
        id: 'ot3',
        speakerId: 'u3',
        speakerName: 'Sarah Lin',
        startTime: 65,
        endTime: 105,
        text: "Looking forward to next half, I want to formally sponsor you for Principal Architect. To solidify the promotion packet, I'd like you to take ownership of our cross-team streaming ingestion pipeline and mentor Marcus on multi-region reliability.",
        sentiment: 'positive',
        highlighted: true,
        highlightTag: 'Career Milestone'
      }
    ],
    summaries: {
      general: {
        overview: '1:1 sync between Sarah Lin and Pravalika Palle reviewing performance and mapping out the promotion trajectory toward Principal Architect.',
        keyTopics: [
          {
            title: 'Guild Leadership Feedback',
            notes: [
              'High praise for RFC-204 consensus-building and thorough documentation.',
              'Commended for cross-functional diplomacy between Security and SRE teams.'
            ]
          },
          {
            title: 'Principal Promotion Roadmap',
            notes: [
              'Expand scope to lead the real-time audio/video streaming ingestion platform.',
              'Formalize technical mentorship with backend senior engineers.'
            ]
          }
        ],
        decisionsSummary: [
          'Sarah Lin to submit Principal Architect promotion packet for Q1 executive review.'
        ],
        nextSteps: [
          'Pravalika to draft H1 real-time streaming charter by end of next week.'
        ]
      },
      sales: {
        overview: 'Internal leadership and career development sync.',
        keyTopics: [{ title: 'Internal', notes: ['Not applicable to external sales workflows.'] }],
        decisionsSummary: ['Internal promotion roadmap established.'],
        nextSteps: ['Complete internal technical charter.']
      },
      project: {
        overview: 'Roadmap alignment on H1 engineering priorities.',
        keyTopics: [
          {
            title: 'H1 Architectural Initiatives',
            notes: ['Streaming ingestion pipeline will become the top Q1 infrastructure initiative.']
          }
        ],
        decisionsSummary: ['Prioritize streaming charter draft.'],
        nextSteps: ['Review draft with VP Eng.']
      },
      'one-on-one': {
        overview: 'Dedicated career development review. Pravalika is on track for Principal Architect nomination with broad executive endorsement.',
        keyTopics: [
          {
            title: 'Scope Expansion',
            notes: [
              'Lead cross-cutting streaming protocol design (WebRTC -> Kafka -> Chunked Storage).',
              'Sponsor engineering excellence across distributed systems guild.'
            ]
          }
        ],
        decisionsSummary: [
          'Promotion packet submission confirmed for Q1 cycle.'
        ],
        nextSteps: [
          'Schedule bi-weekly leadership mentoring sessions.'
        ]
      }
    },
    actionItems: [
      {
        id: 'act-1on1-1',
        description: 'Draft technical charter for H1 real-time streaming audio ingestion pipeline',
        assigneeId: 'u1',
        assigneeName: 'Pravalika Palle',
        dueDate: 'Oct 10, 2026',
        completed: false,
        timestampSeconds: 65,
        meetingId: 'meeting-1on1-sarah'
      }
    ],
    decisions: [
      {
        id: 'dec-1on1-1',
        title: 'Nomination for Principal Architect Role',
        description: "Sarah Lin confirmed sponsorship for Pravalika's promotion packet in Q1 cycle.",
        timestampSeconds: 65,
        decidedBy: 'Sarah Lin',
        category: 'process'
      }
    ],
    highlights: [
      {
        id: 'hl-1on1-1',
        title: 'Promotion Sponsorship',
        excerpt: 'I want to formally sponsor you for Principal Architect. I would like you to take ownership of our streaming pipeline.',
        speakerName: 'Sarah Lin',
        timestampSeconds: 65,
        durationSeconds: 40,
        category: 'breakthrough',
        shareUrl: 'https://fanthom.ai/m/meeting-1on1-sarah?t=65'
      }
    ],
    brief: {
      previousMeetingDate: 'Sept 11, 2026',
      previousDecisions: [
        'Agreed on taking lead for the distributed cache architecture guild review.'
      ],
      openActionItems: [
        'Prepare RFC-204 slides and benchmark charts (Completed).'
      ],
      suggestedTalkingPoints: [
        'Review feedback from guild members on RFC-204.',
        'Discuss bandwidth and capacity for H1 platform initiatives.'
      ],
      historicalContext: 'Regular bi-weekly leadership sync focusing on technical strategy, organizational impact, and career development.'
    },
    stats: {
      wordsSpoken: 320,
      speakingRatio: {
        u1: 45,
        u3: 55
      },
      sentimentScore: 98
    }
  },
  {
    id: 'meeting-arch-rollout',
    title: 'Q4 Architecture Rollout & Ownership Review',
    category: 'architecture',
    date: '2026-10-02T10:00:00Z',
    durationMinutes: 45,
    status: 'upcoming',
    location: 'Zoom (Room Alpha)',
    preview: 'Pre-meeting preparation: align on Redis 7 Raft cluster deployment ownership, review staging failover benchmarks, and sign off on dual-write cutover.',
    relatedMeetingId: 'meeting-arch-q4',
    participants: [
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Staff Systems Architect', avatarColor: '#3b82f6', isHost: true },
      { id: 'u2', name: 'Marcus Vance', email: 'marcus.v@fanthom.ai', role: 'Principal Backend Engineer', avatarColor: '#10b981' },
      { id: 'u3', name: 'Sarah Lin', email: 'sarah.lin@fanthom.ai', role: 'VP of Engineering', avatarColor: '#8b5cf6' },
      { id: 'u4', name: 'Dave Kowalski', email: 'dave.k@fanthom.ai', role: 'SRE Infrastructure Lead', avatarColor: '#f59e0b' },
      { id: 'u5', name: 'Elena Rostova', email: 'elena.r@fanthom.ai', role: 'Data Platform Lead', avatarColor: '#ec4899' },
      { id: 'u6', name: 'James Thornton', email: 'james.t@fanthom.ai', role: 'Frontend Architecture Lead', avatarColor: '#06b6d4' },
      { id: 'u7', name: 'Rachel Chen', email: 'rachel.c@fanthom.ai', role: 'Director of Product', avatarColor: '#6366f1' },
      { id: 'u8', name: 'Tom Becker', email: 'tom.b@fanthom.ai', role: 'Security Architect', avatarColor: '#ef4444' }
    ],
    transcript: [],
    summaries: {
      general: { overview: 'Upcoming review to finalize deployment dates and proxy ownership.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      sales: { overview: 'Technical rollout sync.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      project: { overview: 'Technical rollout sync.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      'one-on-one': { overview: 'Technical rollout sync.', keyTopics: [], decisionsSummary: [], nextSteps: [] }
    },
    actionItems: [],
    decisions: [],
    highlights: [],
    preMeetingBrief: {
      id: 'brief-arch-rollout',
      upcomingMeetingId: 'meeting-arch-rollout',
      heroHeadline: 'Three key commitments evolved since your last architecture sync.',
      keyContextDeltas: [
        'Marcus Vance completed the Redis 7 Raft staging benchmarks, dropping simulated failover p99 to 28ms without data loss.',
        'Tom Becker confirmed Vault-automated mutual TLS rotation satisfies SOC2 Type II and HIPAA transit controls.',
        'Elena Rostova flagged that write-through cache eviction still requires a dedicated backend engineer before the canary window opens.'
      ],
      relatedPreviousMeeting: {
        id: 'meeting-arch-q4',
        title: 'Q4 Core Architecture & Distributed Cache Strategy',
        date: '2026-09-29T14:00:00Z',
        durationMinutes: 58,
        unresolvedCount: 2,
        commitmentsCount: 3
      },
      openCommitments: [
        {
          id: 'comm-1',
          actionItemId: 'a-1',
          assigneeName: 'Marcus Vance',
          description: 'Run benchmark comparing Redis 7 Raft cluster failover latency vs current Memcached p99',
          dueDate: '2026-10-02',
          completed: false,
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 38
        },
        {
          id: 'comm-2',
          actionItemId: 'a-2',
          assigneeName: 'Pravalika Palle',
          description: 'Draft zero-downtime shadow rollout plan with automatic rollback thresholds',
          dueDate: '2026-10-03',
          completed: false,
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 432
        },
        {
          id: 'comm-3',
          actionItemId: 'a-3',
          assigneeName: 'Dave Kowalski',
          description: 'Audit AWS availability zone network peering quotas for Redis cluster topology',
          dueDate: '2026-10-04',
          completed: true,
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 63
        }
      ],
      carriedDecisions: [
        {
          id: 'dec-1',
          title: 'Approve RFC-204: Redis 7 Cluster Migration',
          category: 'architecture',
          decidedBy: 'Sarah Lin (VP of Engineering)',
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 320,
          contextSummary: 'Replaces standalone Memcached instances with multi-node Redis cluster featuring active read-replicas.'
        },
        {
          id: 'dec-2',
          title: 'Mandate Write-Through Invalidation Policy',
          category: 'architecture',
          decidedBy: 'Elena Rostova (Data Platform Lead)',
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 231,
          contextSummary: 'Prohibits write-behind caching to eliminate data loss and comply with GDPR deletion purging requirements.'
        }
      ],
      unresolvedQuestions: [
        {
          id: 'unres-1',
          question: 'Who owns maintaining dual-write synchronization between Memcached and Redis during the 2-week canary phase?',
          raisedBy: 'Dave Kowalski (SRE Lead)',
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 432
        },
        {
          id: 'unres-2',
          question: 'Can the mobile API client handle automatic re-auth if TLS session tickets are refreshed mid-call?',
          raisedBy: 'James Thornton (Frontend Lead)',
          sourceMeetingId: 'meeting-arch-q4',
          sourceMeetingTitle: 'Q4 Core Architecture & Distributed Cache Strategy',
          sourceTimestampSeconds: 143
        }
      ],
      talkingPoints: [
        {
          id: 'tp-1',
          text: 'Confirm engineering ownership for the Memcached-to-Redis dual-write proxy',
          checked: false,
          sourceLabel: 'Q4 Core Architecture · 07:12',
          sourceMeetingId: 'meeting-arch-q4',
          sourceTimestampSeconds: 432
        },
        {
          id: 'tp-2',
          text: 'Review Marcus Vance’s staging failover latency benchmark results',
          checked: false,
          sourceLabel: 'Q4 Core Architecture · 00:38',
          sourceMeetingId: 'meeting-arch-q4',
          sourceTimestampSeconds: 38
        },
        {
          id: 'tp-3',
          text: 'Sign off on automated Let’s Encrypt rotation policy with Vault before production cutover',
          checked: false,
          sourceLabel: 'Q4 Core Architecture · 02:23',
          sourceMeetingId: 'meeting-arch-q4',
          sourceTimestampSeconds: 143
        },
        {
          id: 'tp-4',
          text: 'Lock down Canary deployment date with SRE on-call rotation',
          checked: false
        }
      ]
    },
    stats: {
      wordsSpoken: 0,
      speakingRatio: {},
      sentimentScore: 0
    }
  },
  {
    id: 'meeting-sales-kickoff',
    title: 'Acme Corp — Security & CMEK Implementation Kickoff',
    category: 'sales',
    date: '2026-10-03T15:00:00Z',
    durationMinutes: 30,
    status: 'upcoming',
    location: 'Google Meet',
    preview: 'Pre-meeting preparation: verify signed $28/seat 2-year contract, review AWS KMS key policy for tenant CMEK, and introduce dedicated onboarding engineer.',
    relatedMeetingId: 'meeting-sales-acme',
    participants: [
      { id: 'u1', name: 'Pravalika Palle', email: 'pravalika@fanthom.ai', role: 'Staff Systems Architect', avatarColor: '#3b82f6', isHost: true },
      { id: 'u7', name: 'Rachel Chen', email: 'rachel.c@fanthom.ai', role: 'Director of Product', avatarColor: '#6366f1' },
      { id: 'u10', name: 'Jordan Reed', email: 'jreed@acmecorp.com', role: 'VP of Procurement, Acme Corp', avatarColor: '#84cc16' },
      { id: 'u11', name: 'Priya Sharma', email: 'psharma@acmecorp.com', role: 'Director of IT Security, Acme Corp', avatarColor: '#a855f7' },
      { id: 'u2', name: 'Marcus Vance', email: 'marcus.v@fanthom.ai', role: 'Principal Backend Engineer', avatarColor: '#10b981' }
    ],
    transcript: [],
    summaries: {
      general: { overview: 'Kickoff meeting for CMEK configuration.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      sales: { overview: 'Kickoff meeting for CMEK configuration.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      project: { overview: 'Kickoff meeting for CMEK configuration.', keyTopics: [], decisionsSummary: [], nextSteps: [] },
      'one-on-one': { overview: 'Kickoff meeting for CMEK configuration.', keyTopics: [], decisionsSummary: [], nextSteps: [] }
    },
    actionItems: [],
    decisions: [],
    highlights: [],
    preMeetingBrief: {
      id: 'brief-sales-kickoff',
      upcomingMeetingId: 'meeting-sales-kickoff',
      heroHeadline: 'Legal approved the $28/seat 2-year contract; CMEK KMS policy requires final review.',
      keyContextDeltas: [
        'Jordan Reed routed the 500-seat contract to Acme Corp General Counsel with agreed 99.95% SLA credits.',
        'Priya Sharma generated the AWS KMS Customer Managed Key ARN for testing in tenant sandbox.',
        'Sales Engineering provisioned 25 test seats for the IT Security auditing group.'
      ],
      relatedPreviousMeeting: {
        id: 'meeting-sales-acme',
        title: 'Acme Corp — Enterprise Contract & Custom SLA Review',
        date: '2026-09-28T16:30:00Z',
        durationMinutes: 35,
        unresolvedCount: 1,
        commitmentsCount: 2
      },
      openCommitments: [
        {
          id: 'comm-acme-1',
          assigneeName: 'Priya Sharma',
          description: 'Provide AWS KMS Key ARN with IAM trust policy allowing Fanthom AI tenant role',
          dueDate: '2026-10-03',
          completed: false,
          sourceMeetingId: 'meeting-sales-acme',
          sourceMeetingTitle: 'Acme Corp — Enterprise Contract & Custom SLA Review',
          sourceTimestampSeconds: 120
        },
        {
          id: 'comm-acme-2',
          assigneeName: 'Rachel Chen',
          description: 'Deliver countersigned HIPAA Business Associate Agreement (BAA)',
          dueDate: '2026-10-02',
          completed: true,
          sourceMeetingId: 'meeting-sales-acme',
          sourceMeetingTitle: 'Acme Corp — Enterprise Contract & Custom SLA Review',
          sourceTimestampSeconds: 240
        }
      ],
      carriedDecisions: [
        {
          id: 'dec-acme-1',
          title: 'Approve $28/seat/mo on 2-Year Contract',
          category: 'pricing',
          decidedBy: 'Jordan Reed & Rachel Chen',
          sourceMeetingId: 'meeting-sales-acme',
          sourceMeetingTitle: 'Acme Corp — Enterprise Contract & Custom SLA Review',
          sourceTimestampSeconds: 310,
          contextSummary: 'Locked in 500 enterprise seats with annual upfront billing and 99.95% availability guarantee.'
        }
      ],
      unresolvedQuestions: [
        {
          id: 'unres-acme-1',
          question: 'Does Acme Corp require KMS key rotation to trigger an automatic re-encryption of past recording transcripts?',
          raisedBy: 'Priya Sharma (IT Security Director)',
          sourceMeetingId: 'meeting-sales-acme',
          sourceMeetingTitle: 'Acme Corp — Enterprise Contract & Custom SLA Review',
          sourceTimestampSeconds: 195
        }
      ],
      talkingPoints: [
        {
          id: 'tp-acme-1',
          text: 'Confirm receipt of signed 500-seat enterprise order form from Acme Corp Legal',
          checked: false,
          sourceLabel: 'Acme Contract Review · 05:10',
          sourceMeetingId: 'meeting-sales-acme',
          sourceTimestampSeconds: 310
        },
        {
          id: 'tp-acme-2',
          text: 'Review KMS encryption policy and verify tenant sandbox connectivity',
          checked: false,
          sourceLabel: 'Acme Contract Review · 02:00',
          sourceMeetingId: 'meeting-sales-acme',
          sourceTimestampSeconds: 120
        }
      ]
    },
    stats: {
      wordsSpoken: 0,
      speakingRatio: {},
      sentimentScore: 0
    }
  }
];

