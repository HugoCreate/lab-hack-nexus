#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Lab Hack Nexus API (Go) Setup${NC}"
echo "=================================="

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go 1.21 or higher${NC}"
    echo "Visit: https://golang.org/dl/"
    exit 1
fi

GO_VERSION=$(go version | grep -o 'go[0-9]\+\.[0-9]\+')
echo -e "${GREEN}✅ Go version: $GO_VERSION${NC}"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env with your Supabase credentials${NC}"
fi

# Download dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
go mod tidy

# Build the application
echo -e "${GREEN}🔨 Building application...${NC}"
go build -o bin/api-go main.go

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "To run the application:"
    echo -e "${YELLOW}  ./bin/api-go${NC}"
    echo ""
    echo "Or use go run:"
    echo -e "${YELLOW}  go run main.go${NC}"
    echo ""
    echo "API will be available at: http://localhost:8000"
    echo -e "${GREEN}Health check: http://localhost:8000/health${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
