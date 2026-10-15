# Change Request: Second Dedicated Stack and Regional Failover

**Requested change:** After the initial platform has operated for 24 hours, provision a second dedicated stack in another cloud, located in US-West, with US-East failover.

**Status:** Proposed; not provisioned or tested.

## Scope

- Select a second cloud provider and approved US-West region.
- Provision isolated networking, workload identity, registry access, Kubernetes, observability, and secret management.
- Define the US-East recovery target and traffic failover mechanism.
- Design data replication, consistency, backup, and failback.
- Test failover and failback, including application and dependency health.
- Document cost, security, operational ownership, and recovery objectives.

## Preconditions

- Approval for cross-cloud data transfer and US regional residency.
- Documented RPO/RTO and authoritative data-store design.
- Image promotion by the same immutable digest across both providers.
- Equivalent policy, monitoring, and access controls in both stacks.
- Defined DNS/traffic management TTLs and health-check criteria.
- Tested backup restoration and database recovery procedure.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Data divergence or split brain | Define a single-writer or consensus/replication strategy before enabling failover |
| Provider-specific configuration drift | Keep shared platform interfaces and provider modules versioned and reviewed |
| Secrets unavailable during outage | Replicate secret references securely and test access in recovery region |
| Failover creates excess cost | Set budget alerts and capacity bounds for standby resources |
| Failback causes data loss | Use a documented reconciliation and controlled failback procedure |

## Acceptance criteria

- Both stacks deploy the same image digest.
- Health-based failover works in a controlled exercise.
- Recovery meets approved RPO and RTO.
- No unauthorized cross-region data movement occurs.
- Observability and alerting work in both locations.
- Failback is tested and documented.
- Actual monthly cost is reviewed against the approved budget.

The 24-hour interval is a change-request trigger, not proof that the initial platform is production-ready. Execution requires approved cloud accounts, access, and a maintenance plan.
