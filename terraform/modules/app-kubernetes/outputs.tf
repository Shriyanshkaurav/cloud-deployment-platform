output "deployment_name" {
  description = "Name of the application Deployment."
  value       = kubernetes_deployment_v1.app.metadata[0].name
}

output "service_name" {
  description = "Name of the application Service."
  value       = kubernetes_service_v1.app.metadata[0].name
}
