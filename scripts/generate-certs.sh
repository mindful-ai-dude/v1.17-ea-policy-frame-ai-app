#!/bin/bash

# Script to generate self-signed certificates for local development
# This should only be used for development, never for production

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate a self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Self-signed certificates generated successfully!"
echo "These certificates are for development use only and should not be used in production."