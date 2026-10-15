# Terraform structure

This directory separates application resources from provider-specific infrastructure. The application module uses the Kubernetes provider and expects a configured Kubernetes context. Cloud networking, cluster, identity, registry, remote state, and managed secrets belong in provider-specific modules/environments and must be reviewed before use.

## Structure

- `modules/app-kubernetes`: Kubernetes Deployment and Service.
- `environments/dev`: example variable values for a development deployment.
- `backend.tf.example`: remote-state backend example; replace placeholders before use.

## Safety and workflow

1. Configure provider authentication through workload identity or environment-based credentials.
2. Configure a remote backend with encryption, locking, versioning, and restricted access.
3. Pin Terraform and provider versions in the actual deployment repository.
4. Run `terraform fmt -check`, `terraform init`, and `terraform validate`.
5. Review `terraform plan` and obtain approval before applying.
6. Run scheduled plans to detect drift; do not automatically overwrite manual changes without review.

Do not commit `.tfstate`, `.tfstate.backup`, `.terraform/`, credentials, or secret values. Terraform state can contain sensitive data.

The module has not been applied to a cloud account as part of the local demonstration.
