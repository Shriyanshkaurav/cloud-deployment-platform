# Cloud-Agnostic Automated Deployment Platform

A reference implementation of a deployment platform focused on repeatable releases, Kubernetes health checks, rolling updates, rollback, observability, and scalable multi-tenant architecture.

## Current implementation

- Node.js/Express application with health, readiness, version, and metrics endpoints.
- Docker image built using a multi-stage-friendly, non-root runtime pattern.
- Kubernetes Deployment with two replicas and a rolling-update strategy.
- Readiness and liveness probes, resource requests/limits, and graceful termination.
- Azure Pipelines definition for tests, container build, vulnerability scanning, and registry push.
- Scripts for HTTP load testing and Kubernetes rollback.

## Repository layout

```text
app/                         Application and tests
deploy/kubernetes/           Kubernetes Deployment and Service
scripts/                     Load test and rollback helpers
azure-pipelines.yml          CI pipeline
terraform/                   Terraform module and environment examples
docs/                        Architecture, operations, roadmap and change request
kind-config.yaml             Local kind cluster configuration
```

## Run locally

Requirements: Docker Desktop, kubectl, kind, Node.js 22+, and npm.

```bash
cd app
npm ci
npm test
cd ..
docker build -t deployment-platform-demo:1.1.0 ./app
kind load docker-image deployment-platform-demo:1.1.0 --name deployment-platform
kubectl apply -f deploy/kubernetes/
kubectl rollout status deployment/deployment-platform-demo
kubectl get pods,svc
```

If the kind cluster has a different name, replace `deployment-platform` with the actual name from `kind get clusters`.

Access the service in one terminal:

```bash
kubectl port-forward service/deployment-platform-demo 8080:8080
```

In another terminal:

```bash
curl -i http://localhost:8080/health
curl -i http://localhost:8080/ready
curl -i http://localhost:8080/version
curl -i http://localhost:8080/metrics
```

## Test and rollback

```bash
npm --prefix app test
bash scripts/load-test.sh http://localhost:8080/ 1000 50
bash scripts/rollback.sh default deployment-platform-demo
```

Run the load test while the port-forward is active. The script reports request outcomes and approximate throughput; it is not a substitute for a production load test.

## CI configuration

Before enabling `azure-pipelines.yml`, configure an Azure Container Registry service connection and replace the registry placeholders in the pipeline. Protect production credentials with Azure DevOps secret variables or a secrets manager. Do not commit credentials or production secrets.

## Status and evidence

The local kind environment is the executable demonstration target. Cloud-provider provisioning, managed secrets, remote Terraform state, production-scale load, disaster recovery, and a second cloud deployment are design targets until provisioned and evidenced in a real account. See [Architecture](docs/architecture.md), [Runbook](docs/runbook.md), and [Roadmap and cost model](docs/roadmap-and-costs.md).

## Safety

Do not run Terraform apply or deploy to production without reviewing provider configuration, state backend, identity permissions, network rules, resource costs, and environment-specific variables.
