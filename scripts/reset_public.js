const { execSync } = require('child_process');
const path = require('path');
const game_name = "Jungle Vines";

/**
 * Syncs the public folder to an S3 bucket using AWS CLI (aws s3 sync).
 * Usage: node scripts/sync_to_s3.js s3://your-bucket-name/path/
 *
 * Prerequisites:
 *   - AWS CLI installed and configured (aws configure)
 *   - Proper permissions to write to the target S3 bucket
 */

// const targetBucket = process.argv[2];
const targetBucket = `s3://articles-website/games/${game_name}/public/`
const cloudFrontDistributionId = 'E2HYD6HGNMLWBQ';
const invalidationPath = `/games/${game_name}/public/*`;

if (!targetBucket) {
    console.error('Error: Please provide a target S3 bucket URI.');
    console.error('Usage: node scripts/sync_to_s3.js s3://your-bucket-name/path/');
    process.exit(1);
}

console.log(`Deleting all existing files in ${targetBucket} and invalidating...`);

try {
    // 1. Delete all existing files in the target S3 path
    const deleteCommand = `aws s3 rm "${targetBucket}" --recursive`;
    console.log(`Running: ${deleteCommand}`);
    execSync(deleteCommand, { stdio: 'inherit' });

    // 2. Invalidate CloudFront cache
    console.log(`Invalidating CloudFront cache for: ${invalidationPath}...`);
    const invalidateCommand = `aws cloudfront create-invalidation --distribution-id ${cloudFrontDistributionId} --paths "${invalidationPath}"`;
    
    console.log(`Running: ${invalidateCommand}`);
    execSync(invalidateCommand, { stdio: 'inherit' });

    console.log('Cleanup and Invalidation completed successfully!');
} catch (error) {
    console.error('Error during sync:', error.message);
    process.exit(1);
}
