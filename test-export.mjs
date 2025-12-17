#!/usr/bin/env node

// Simple test script for video export functionality
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Video Export Setup...\n');

// Check if exports directory exists
const exportsDir = path.join(__dirname, 'public', 'exports');
if (fs.existsSync(exportsDir)) {
  console.log('✅ Exports directory exists:', exportsDir);
} else {
  console.log('❌ Exports directory missing:', exportsDir);
}

// Check if export-video API route exists
const apiRoute = path.join(__dirname, 'app', 'api', 'export-video', 'route.ts');
if (fs.existsSync(apiRoute)) {
  console.log('✅ Export-video API route exists:', apiRoute);
} else {
  console.log('❌ Export-video API route missing:', apiRoute);
}

// Check if FFmpeg is accessible (basic test)
exec('ffmpeg -version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ FFmpeg not accessible from Node.js');
    console.log('   Error:', error.message);
  } else {
    console.log('✅ FFmpeg is accessible from Node.js');
    const version = stdout.split('\n')[0];
    console.log('   Version:', version);
  }

  console.log('\n🎬 Video Export Setup Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Upload a video file');
  console.log('3. Click the "🎬 Export Video" button');
  console.log('4. Check server logs for FFmpeg execution');
  console.log('5. Verify exported file appears in public/exports/');
});