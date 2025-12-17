import { readFile } from 'fs/promises';

async function testGenerateCaptions() {
  try {
    console.log('🧪 Testing generate-captions API with captions-optimized audio...');

    // Create form data with the path to a captions audio file
    const form = new FormData();
    // Use an existing captions audio file for testing
    form.append('audioPath', '/uploads/extracted-audio-captions-1765757707563.wav');

    console.log('📤 Sending request to generate-captions API...');

    // const res = await fetch('http://localhost:3000/api/generate-captions', {
      method: 'POST',
      body: form,
    });

    const text = await res.text();
    console.log('📊 Response status:', res.status);
    console.log('📄 Response body:', text);

    if (res.ok) {
      console.log('✅ Caption generation test passed!');
    } else {
      console.log('❌ Caption generation test failed!');
    }

  } catch (err) {
    console.error('💥 Test failed with error:', err);
    process.exit(1);
  }
}

testGenerateCaptions();