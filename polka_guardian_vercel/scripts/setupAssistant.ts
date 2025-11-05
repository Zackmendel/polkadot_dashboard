import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function setupGovernanceAssistant() {
  try {
    console.log('📁 Uploading governance data files...');
    
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      console.error('❌ Data directory not found:', dataDir);
      process.exit(1);
    }
    
    const files = fs.readdirSync(dataDir);
    const csvFiles = files.filter(f => f.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      console.error('❌ No CSV files found in data directory');
      process.exit(1);
    }
    
    console.log('Found CSV files:', csvFiles);
    
    const uploadedFiles: any[] = [];
    
    // Upload each CSV file
    for (const file of csvFiles) {
      const filePath = path.join(dataDir, file);
      console.log(`Uploading ${file}...`);
      
      const uploadedFile = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants',
      });
      
      console.log(`✅ ${file} uploaded:`, uploadedFile.id);
      uploadedFiles.push({ name: file, id: uploadedFile.id });
    }
    
    // Create Assistant
    console.log('\n🤖 Creating Polkadot Governance Assistant...');
    const assistant = await openai.beta.assistants.create({
      name: 'Polkadot Governance Expert',
      instructions: `You are an expert on Polkadot and Kusama governance. You help users understand governance data, voting patterns, proposals, and ecosystem metrics.

When users ask about governance:
- Provide insights based on available data
- Explain voting patterns and trends
- Summarize proposals clearly
- Compare different voters or proposals when asked
- Be helpful, accurate, and concise

Note: The governance data files have been uploaded for your reference.`,
      model: 'gpt-4-turbo-preview',
    });

    console.log('✅ Assistant created:', assistant.id);
    console.log('\n📝 Add these to your .env.local file:');
    console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`);
    
    uploadedFiles.forEach(file => {
      const envVar = `OPENAI_${file.name.replace('.csv', '').toUpperCase()}_FILE_ID`;
      console.log(`${envVar}=${file.id}`);
    });
    
    // Save to .env.local if it exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Update or add the assistant ID
      if (envContent.includes('OPENAI_ASSISTANT_ID=')) {
        envContent = envContent.replace(/OPENAI_ASSISTANT_ID=.*/, `OPENAI_ASSISTANT_ID=${assistant.id}`);
      } else {
        envContent += `\nOPENAI_ASSISTANT_ID=${assistant.id}`;
      }
      
      // Update or add file IDs
      uploadedFiles.forEach(file => {
        const envVar = `OPENAI_${file.name.replace('.csv', '').toUpperCase()}_FILE_ID`;
        if (envContent.includes(`${envVar}=`)) {
          envContent = envContent.replace(new RegExp(`${envVar}=.*`), `${envVar}=${file.id}`);
        } else {
          envContent += `\n${envVar}=${file.id}`;
        }
      });
      
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Updated .env.local file');
    }
    
    return assistant;
    
  } catch (error) {
    console.error('❌ Error setting up assistant:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupGovernanceAssistant()
    .then(() => {
      console.log('\n🎉 Setup completed successfully!');
      console.log('\n⚠️  Note: This simplified version creates a basic assistant.');
      console.log('For advanced file search capabilities, you may need to manually configure vector stores.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

export default setupGovernanceAssistant;