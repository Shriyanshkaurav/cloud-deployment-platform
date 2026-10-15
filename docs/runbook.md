# Operations Runbook

## Deployment pre-checks

- Confirm the pull request is reviewed and tests pass.
- Confirm the container scan has no release-blocking findings.
- Confirm the exact image digest and source commit.
- Confirm database migrations are backward-compatible.
- Confirm enough capacity exists for surge pods.
- Confirm dashboards and rollback access are available.

## Local deployment

```bash
kubectl get nodes
kubectl get deployment,replicaset,pods,service
kubectl apply -f deploy/kubernetes/
kubectl rollout status deployment/deployment-platform-demo
kubectl rollout history deployment/deployment-platform-demo
```

## Verify the application

```bash
kubectl get pods -o wide
kubectl describe deployment deployment-platform-demo
kubectl logs deployment/deployment-platform-demo --tail=100
kubectl port-forward service/deployment-platform-demo 8080:8080
```

In another terminal:

```bash
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/ready
curl -fsS http://localhost:8080/version
curl -fsS http://localhost:8080/metrics
```

## Rollback

```bash
kubectl rollout history deployment/deployment-platform-demo
bash scripts/rollback.sh default deployment-platform-demo
kubectl get pods
curl -fsS http://localhost:8080/version
```

Rollback only after confirming the previous revision is healthy and compatible with the current database schema. Preserve the failed revision's logs and events for investigation.

## Incident: rollout is stuck

1. Run `kubectl rollout status deployment/deployment-platform-demo`.
2. Run `kubectl describe deployment deployment-platform-demo`.
3. Inspect pod events with `kubectl describe pod <pod-name>`.
4. Inspect logs with `kubectl logs <pod-name> --previous` if a container restarted.
5. Check image pull errors, failed probes, resource limits, scheduling, and capacity.
6. Stop further promotion. Roll back if user-facing health or error rates are degraded.

## Incident: elevated errors or latency

1. Check request rate, error rate, latency percentiles, saturation, pod restarts, and dependency health.
2. Compare the change timestamp with the incident start.
3. If correlated with a release, halt rollout and roll back to the last known-good version.
4. Check database connections, pool saturation, queue depth/age, and downstream timeouts.
5. Verify recovery using synthetic requests and dashboards before resolving the incident.

## Incident: queue backlog

- Check oldest-message age, enqueue/dequeue rates, worker failures, and dead-letter volume.
- Scale workers only within the database and downstream connection budget.
- Check for poison messages and retry storms.
- Confirm idempotency before replaying jobs.
- Reduce producer rate or pause low-priority work if downstream services are overloaded.

## Backup and restore procedure (cloud implementation required)

1. Identify the approved backup and target recovery point.
2. Restore into an isolated environment; do not overwrite production.
3. Validate schema, record counts or checksums, and representative application queries.
4. Record actual RPO and elapsed restore time against objectives.
5. Obtain service-owner approval before any production cutover.
6. Preserve the restore evidence and update the recovery runbook.

## Evidence to capture

Record UTC timestamp, commit, image digest, environment, deployment revision, test command, test duration, HTTP status counts, latency results if available, dashboard screenshots, rollback revision, and any failures. Never include credentials or personal data.
