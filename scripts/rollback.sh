#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-default}"
DEPLOYMENT="${2:-deployment-platform-demo}"

echo "Deployment: $DEPLOYMENT"
echo "Namespace:  $NAMESPACE"

kubectl rollout history "deployment/$DEPLOYMENT" -n "$NAMESPACE"
kubectl rollout undo "deployment/$DEPLOYMENT" -n "$NAMESPACE"
kubectl rollout status "deployment/$DEPLOYMENT" -n "$NAMESPACE"

echo "Rollback completed successfully."
kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE"
