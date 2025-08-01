# Database Migration Script for Production
# This script should be run after deployment to set up the database

echo "Setting up production database..."

# Generate Prisma client
npx prisma generate

# Push schema to database (for production)
npx prisma db push

# Run seed script if needed
# node seed.js

echo "Database setup complete!"