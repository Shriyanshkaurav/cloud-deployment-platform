# Roadmap and Cost Model

## 90-day roadmap

| Period | Deliverables | Exit criteria |
|---|---|---|
| Days 1–30 | Terraform provider/platform/app modules; remote state and locking; registry, identity, secret manager; CI test/scan/publish | Repeatable non-production provisioning and documented destroy/recreate test |
| Days 31–60 | Dev/staging/production promotion by immutable digest; rollout gates; autoscaling; dashboards, alerts, and tenant tagging | Demonstrated failed-release rollback and load-test report |
| Days 61–90 | Backup restore exercise; tenant onboarding automation; dedicated-stack path; residency controls; cross-cloud recovery design/test | Measured restore objectives, tenant isolation evidence, and approved disaster-recovery exercise |

## Monthly budget envelope

The assignment budget targets are $9,000 steady state and $16,000 peak. These are planning ceilings, not verified cloud quotes.

| Cost category | Steady-state planning | Peak planning | Cost controls |
|---|---:|---:|---|
| Kubernetes compute and system nodes | $2,500 | $4,000 | Requests/limits, autoscaling bounds, scheduled non-production shutdown |
| Database and cache | $2,000 | $3,500 | Right-sizing, connection pooling, storage and IOPS review |
| Network, ingress, and data transfer | $1,000 | $2,000 | Egress monitoring, regional design, caching |
| Logs, metrics, traces, and security | $1,000 | $1,500 | Retention tiers, sampling, cardinality controls |
| Backup and disaster recovery | $750 | $1,250 | Lifecycle policies, restore drills, replication scope |
| Registries, CI/CD, DNS, and supporting services | $500 | $750 | Retention policies, pipeline efficiency |
| Reserved capacity and contingency | $1,250 | $3,000 | Monthly review and budget alerts |
| **Total planning envelope** | **$9,000** | **$16,000** | **Validate against the selected provider and region** |

Amounts are illustrative allocations of the assignment's budget ceiling, not provider pricing. Actual costs depend on region, service tiers, traffic, storage, egress, logs, support, discounts, and dedicated-tenant count. Obtain current pricing estimates and validate with a cost calculator before provisioning.

## Operating controls

- Configure budget alerts at 50%, 75%, 90%, and 100%.
- Tag resources by environment, owner, tenant, and cost center.
- Review idle resources and log retention monthly.
- Keep autoscaling maximums within approved database and budget limits.
- Compare actual unit costs per request, job, and tenant monthly.
