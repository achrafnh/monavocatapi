#!/bin/bash

# Base URL - change this to match your deployment URL
API_URL="http://localhost:3000/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing MonAvocat API endpoints..."

# 1. User Registration
echo -e "\n${GREEN}Testing User Registration:${NC}"
curl -X POST "${API_URL}/users/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User",
    "phoneNumber": "+1234567890"
  }'

# 2. User Login
echo -e "\n\n${GREEN}Testing User Login:${NC}"
curl -X POST "${API_URL}/users/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Store the token from the login response
TOKEN="your_token_here"

# 3. Lawyer Registration
echo -e "\n\n${GREEN}Testing Lawyer Registration:${NC}"
curl -X POST "${API_URL}/lawyers/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "Password123!",
    "fullName": "Test Lawyer",
    "licenseNumber": "LAW123456",
    "specialization": "Corporate Law",
    "yearsOfExperience": 5,
    "phoneNumber": "+1234567890"
  }'

# 4. Lawyer Login
echo -e "\n\n${GREEN}Testing Lawyer Login:${NC}"
curl -X POST "${API_URL}/lawyers/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "Password123!"
  }'

# 5. Protected Route Example (requires authentication)
echo -e "\n\n${GREEN}Testing Protected Route:${NC}"
curl -X GET "${API_URL}/users/profile" \
  -H "Authorization: Bearer ${TOKEN}"