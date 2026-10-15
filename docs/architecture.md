# Deployment Platform Architecture

## 1. Goals and design principles

The platform aims to provide repeatable infrastructure, safe application delivery, horizontal scaling, tenant isolation, observable operations, and provider portability. Application artifacts are built once and promoted by immutable digest; environments must not rebuild different binaries from the same source revision.

The local Kubernetes cluster is the practical demonstration target. Managed cloud services and cross-cloud recovery are proposed architecture, not claims of completed deployment.

## 2. Logical architecture

```text
Developer pull request
        |
        v
CI: unit tests -> build image -> vulnerability scan -> publish image
        |                                      |
        |                              immutable image digest
        v                                      v
Review / quality gates ----------------> dev -> staging -> production
                                              |
                                     progressive rollout
                                              |
                         metrics + health + error-rate gates
                                              |
                                 rollback on failed release

IaC layers:
  Provider layer: network, identity, registry, managed cluster, state
  Platform layer: ingress, DNS/TLS, autoscaling, metrics, secrets, policies
  Application layer: Deployment, Service, probes, resources, app config
```

## 3. Infrastructure-as-code layers

**Provider layer:** separate modules per cloud provision networking, IAM/workload identity, container registry, managed Kubernetes, database services, key management, and remote state storage. Keep provider-specific details behind documented module inputs and outputs.

**Platform layer:** install ingress, certificate management, external secrets integration, metrics collection, policy enforcement, autoscaling, and centralized logging. Pin module and chart versions.

**Application layer:** deploy versioned application images, Services, probes, resource requests and limits, disruption budgets, autoscaling rules, and environment-specific configuration.

Terraform state must be stored remotely with encryption, locking, access control, and versioning. Do not store credentials in state or tfvars. Detect drift with scheduled plans and alert on unexpected changes; apply reviewed changes through the pipeline.

## 4. Release and rollback strategy

1. Run unit tests and static checks on every pull request.
2. Build the container once and scan it for vulnerabilities.
3. Publish the image and record its immutable registry digest, source commit, build ID, and scan result.
4. Promote the same digest through development, staging, and production.
5. Use a rolling update with readiness checks and `maxUnavailable: 0` where capacity permits.
6. Observe request errors, latency, readiness, saturation, and application metrics during rollout.
7. Halt promotion and roll back to the previous known-good digest when release gates fail.

A rolling update is not automatically zero-downtime: sufficient spare capacity, functioning readiness checks, compatible application behavior, and correct load-balancer draining are required.

## 5. API and worker safety

**API:** readiness controls whether a pod receives traffic; liveness detects a stuck process. On SIGTERM, stop accepting new connections and allow in-flight requests to finish within the termination grace period. Ingress/load-balancer draining must be configured and tested.

**Workers:** stop accepting new jobs during shutdown, finish or safely release in-progress jobs, and use visibility timeouts, idempotency, retries, and dead-letter handling. Track queue age and depth, not just CPU.

**Database migrations:** use expand-and-contract changes. First add backward-compatible schema, then deploy code that supports old and new forms, backfill, and only remove old schema after all consumers have migrated. A rollback of application code must not require an unsafe destructive schema rollback.

## 6. Scale and capacity strategy

The design target is scaling from 150 to 2,250 requests/second within five minutes, then scaling down safely, plus processing 20,000 jobs/hour. Validate with a repeatable load generator, realistic payloads, warm-up, steady-state windows, and failure scenarios.

Scale API replicas on CPU and request/latency signals. Scale workers on queue depth and oldest-message age, while enforcing maximum concurrency and database connection budgets. Use connection pooling and explicit database limits so adding pods cannot exhaust the database. Set minimum and maximum replica counts based on measured capacity.

The target traffic increase is 15x. Passing a small local HTTP test does not prove this capacity target; it requires a representative environment and documented results.

## 7. Tenant isolation and residency

Offer shared and dedicated deployment models.

- **Shared:** namespace-level isolation, tenant-aware authorization, resource quotas, network policies, per-tenant rate limits, and tenant-tagged telemetry.
- **Dedicated:** separate cluster or equivalent strong isolation boundary for tenants with stricter availability, security, or compliance requirements.
- **EU residency:** pin application, database, backups, logs, and relevant processing to approved EU regions; verify service-specific data location and cross-region replication settings.
- **Onboarding:** automate tenant configuration, namespace or stack provisioning, policies, secrets references, DNS, dashboards, and a smoke test. The goal is under 30 minutes, to be measured.

## 8. Reliability and disaster recovery

Proposed SLOs: 99.9% availability for shared tenants and 99.95% for dedicated tenants. Define the measurement window, eligible requests, exclusions, and error-budget policy before enforcing release gates.

Backups must be encrypted and access-controlled. Run scheduled restore tests into an isolated target and record restore duration, data integrity, RPO, and RTO. A backup job marked successful is not proof of recoverability.

The requested future change is a second dedicated stack in another cloud, located in US-West with US-East failover. That requires explicit data-residency approval, replication design, DNS or traffic failover, secret replication, database consistency planning, and a tested recovery procedure.

## 9. Security and observability

Use least-privilege workload identity, short-lived credentials, secret-manager integration, image scanning, dependency updates, signed artifacts, and admission policy where available. Never place secrets in source control, image layers, logs, or unprotected pipeline variables.

Collect request rate, error rate, latency percentiles, saturation, restarts, rollout status, queue depth/age, database connection usage, and per-tenant usage. Alerts should link to actionable runbooks.

## 10. Validation status

Locally demonstrable: application tests, container build, kind deployment, readiness/liveness behavior, version endpoint, rolling update, rollback, and basic HTTP load testing.

Not yet proven without cloud accounts and test evidence: managed-cloud provisioning, remote state/drift workflow, signed digest promotion, production autoscaling targets, SLO attainment, multi-tenant isolation, EU residency, restore objectives, and cross-cloud failover.
