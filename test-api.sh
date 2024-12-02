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




#!/bin/bash

# Base URL
API_URL="http://172.173.137.254:3000/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Testing MonAvocat API Endpoints${NC}\n"

# Store tokens
ACCESS_TOKEN=""
LAWYER_ID=""

# 1. User Registration
echo -e "${GREEN}1. Testing User Registration:${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/users/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "Password123!",
    "fullName": "Test User",
    "phoneNumber": "+1234567890"
  }')
echo $REGISTER_RESPONSE

# 2. User Login
echo -e "\n${GREEN}2. Testing User Login:${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/users/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "Password123!"
  }')
echo $LOGIN_RESPONSE

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 3. Get All Lawyers
echo -e "\n${GREEN}3. Testing Get All Lawyers:${NC}"
curl -s "${API_URL}/lawyers?page=1&limit=10&sortBy=rating&sortOrder=desc" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 4. Search Lawyers
echo -e "\n${GREEN}4. Testing Search Lawyers:${NC}"
curl -s "${API_URL}/lawyers/search?specialization=Corporate%20Law&minRating=4&maxPrice=300&page=1&limit=10" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 5. Get Lawyer Specializations
echo -e "\n${GREEN}5. Testing Get Specializations:${NC}"
curl -s "${API_URL}/lawyers/specializations" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 6. Get Nearby Lawyers
echo -e "\n${GREEN}6. Testing Get Nearby Lawyers:${NC}"
curl -s "${API_URL}/lawyers/nearby?latitude=48.8566&longitude=2.3522&radius=10&specialization=Corporate%20Law" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 7. Get Top Rated Lawyers
echo -e "\n${GREEN}7. Testing Get Top Rated Lawyers:${NC}"
curl -s "${API_URL}/lawyers/top-rated?limit=5&specialization=Corporate%20Law" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 8. Get Single Lawyer Details
echo -e "\n${GREEN}8. Testing Get Lawyer Details:${NC}"
curl -s "${API_URL}/lawyers/${LAWYER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# 9. User Signout
echo -e "\n${GREEN}9. Testing User Signout:${NC}"
curl -s -X POST "${API_URL}/users/signout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here"
  }'
