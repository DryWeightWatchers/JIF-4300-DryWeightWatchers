#!/bin/bash

# Build the project
npm run build

# Upload HTML files
aws s3 sync dist/ s3://viteprovider --delete --exact-timestamps \
    --content-type "text/html" --exclude "*" --include "*.html"

# Upload JavaScript files with correct MIME type
aws s3 sync dist/ s3://viteprovider --delete --exact-timestamps \
    --content-type "application/javascript" --exclude "*" --include "*.js"

# Upload CSS files with correct MIME type
aws s3 sync dist/ s3://viteprovider --delete --exact-timestamps \
    --content-type "text/css" --exclude "*" --include "*.css"

# Upload all other assets (images, fonts, etc.)
aws s3 sync dist/ s3://viteprovider --delete --exact-timestamps

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1HQA5YLR0CVC --paths "/*"

echo "Deployment complete!"
