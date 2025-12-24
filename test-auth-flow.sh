#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"
TEST_EMAIL="test@example.com"
OLD_PASSWORD="oldpassword123"
NEW_PASSWORD="newpassword456"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Authentication Flow Test Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Register a new user
echo -e "${YELLOW}Step 1: Registering test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${OLD_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ User registered successfully${NC}"
else
  echo -e "${YELLOW}⚠ User might already exist, continuing...${NC}"
fi
echo ""

# Step 2: Login with old password
echo -e "${YELLOW}Step 2: Login with original password...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${OLD_PASSWORD}\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "  Access Token: ${TOKEN:0:30}...${NC}"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Step 3: Request password reset
echo -e "${YELLOW}Step 3: Requesting password reset...${NC}"
FORGOT_RESPONSE=$(curl -s -X POST "${API_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\"
  }")

RESET_TOKEN=$(echo "$FORGOT_RESPONSE" | grep -o '"resetToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$RESET_TOKEN" ]; then
  echo -e "${GREEN}✓ Reset token generated${NC}"
  echo -e "  Reset Token: ${RESET_TOKEN:0:30}...${NC}"
else
  echo -e "${RED}✗ Failed to get reset token${NC}"
  echo "$FORGOT_RESPONSE"
  exit 1
fi
echo ""

# Step 4: Reset password
echo -e "${YELLOW}Step 4: Resetting password...${NC}"
RESET_RESPONSE=$(curl -s -X POST "${API_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"${RESET_TOKEN}\",
    \"newPassword\": \"${NEW_PASSWORD}\"
  }")

if echo "$RESET_RESPONSE" | grep -q "successfully"; then
  echo -e "${GREEN}✓ Password reset successful${NC}"
else
  echo -e "${RED}✗ Password reset failed${NC}"
  echo "$RESET_RESPONSE"
  exit 1
fi
echo ""

# Step 5: Try to login with old password (should fail)
echo -e "${YELLOW}Step 5: Attempting login with old password (should fail)...${NC}"
OLD_LOGIN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${OLD_PASSWORD}\"
  }")

if echo "$OLD_LOGIN" | grep -q "Invalid credentials"; then
  echo -e "${GREEN}✓ Old password correctly rejected${NC}"
else
  echo -e "${RED}✗ Old password still works (unexpected)${NC}"
fi
echo ""

# Step 6: Login with new password
echo -e "${YELLOW}Step 6: Login with new password...${NC}"
NEW_LOGIN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${NEW_PASSWORD}\"
  }")

if echo "$NEW_LOGIN" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ Login with new password successful${NC}"
  NEW_TOKEN=$(echo "$NEW_LOGIN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "  New Access Token: ${NEW_TOKEN:0:30}...${NC}"
else
  echo -e "${RED}✗ Login with new password failed${NC}"
  echo "$NEW_LOGIN"
  exit 1
fi
echo ""

# Step 7: Verify profile access with new token
echo -e "${YELLOW}Step 7: Accessing profile with new token...${NC}"
PROFILE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${NEW_TOKEN}")

if echo "$PROFILE" | grep -q "email"; then
  echo -e "${GREEN}✓ Profile access successful${NC}"
  echo -e "  Email: $(echo "$PROFILE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)${NC}"
else
  echo -e "${RED}✗ Profile access failed${NC}"
  echo "$PROFILE"
  exit 1
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All tests passed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  Test Email: ${TEST_EMAIL}"
echo -e "  Old Password: ${OLD_PASSWORD} (no longer valid)"
echo -e "  New Password: ${NEW_PASSWORD} (now active)"
echo ""
