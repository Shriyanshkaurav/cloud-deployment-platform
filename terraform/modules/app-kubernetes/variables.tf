variable "name" {
  description = "Kubernetes application and resource name."
  type        = string
  default     = "deployment-platform-demo"
}

variable "namespace" {
  description = "Target Kubernetes namespace."
  type        = string
  default     = "default"
}

variable "image" {
  description = "Immutable container image reference; prefer registry digest."
  type        = string
}

variable "replicas" {
  description = "Desired API replica count."
  type        = number
  default     = 2
}

variable "app_version" {
  description = "Application version displayed by the version endpoint."
  type        = string
}

variable "environment" {
  description = "Environment label, such as dev or staging."
  type        = string
  default     = "dev"
}
