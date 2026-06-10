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

if (!targetBucket) {
    console.error('Error: Please provide a target S3 bucket URI.');
    console.error('Usage: node scripts/sync_to_s3.js s3://your-bucket-name/path/');
    process.exit(1);
}

const publicFolderPath = path.join(__dirname, '..', 'public');

console.log(`Syncing ${publicFolderPath} to ${targetBucket} using AWS CLI...`);

try {
    // --delete: Remove files in destination that don't exist in source
    // --acl public-read: Make files publicly readable (optional, remove if not needed)
    const command = `aws s3 sync "${publicFolderPath}/" "${targetBucket}" --delete --acl public-read`;

    console.log(`Running: ${command}`);

    execSync(command, { stdio: 'inherit' });

    console.log('Sync completed successfully!');
} catch (error) {
    console.error('Error during sync:', error.message);
    process.exit(1);
}
