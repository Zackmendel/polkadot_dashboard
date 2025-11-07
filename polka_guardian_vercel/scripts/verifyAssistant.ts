import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function verifyAssistantSetup() {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  
  if (!assistantId) {
    console.error('❌ OPENAI_ASSISTANT_ID not set in .env.local');
    console.log('\n💡 Run: npm run setup-assistant');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Verifying assistant setup...\n');
    
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    console.log('✅ Assistant retrieved successfully');
    console.log('📋 Assistant Details:');
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Model: ${assistant.model}`);
    console.log(`   ID: ${assistant.id}`);
    
    // Check tools
    console.log('\n🔧 Tools:');
    if (assistant.tools && assistant.tools.length > 0) {
      assistant.tools.forEach(tool => {
        console.log(`   - ${tool.type}`);
      });
    } else {
      console.warn('   ⚠️  No tools configured');
    }
    
    // Check vector stores
    console.log('\n📚 Vector Stores:');
    if (assistant.tool_resources?.file_search?.vector_store_ids) {
      const vectorStoreIds = assistant.tool_resources.file_search.vector_store_ids;
      
      if (vectorStoreIds.length === 0) {
        console.error('   ❌ No vector stores attached!');
        console.log('\n💡 This means the assistant cannot search files.');
        console.log('   Run: npm run setup-assistant');
        process.exit(1);
      }
      
      for (const vsId of vectorStoreIds) {
        try {
          const vectorStore = await openai.beta.vectorStores.retrieve(vsId);
          console.log(`   ✅ ${vectorStore.name} (${vsId})`);
          console.log(`      Files: ${vectorStore.file_counts.completed} completed, ${vectorStore.file_counts.in_progress} in progress`);
          
          // List files in vector store
          const files = await openai.beta.vectorStores.files.list(vsId);
          console.log(`      File IDs:`);
          for (const file of files.data) {
            const fileDetails = await openai.files.retrieve(file.id);
            console.log(`        - ${fileDetails.filename} (${file.id})`);
          }
        } catch (error) {
          console.error(`   ❌ Error retrieving vector store ${vsId}:`, error);
        }
      }
    } else {
      console.error('   ❌ No vector stores configured!');
      console.log('\n💡 This means the assistant cannot search files.');
      console.log('   Run: npm run setup-assistant');
      process.exit(1);
    }
    
    console.log('\n✅ Assistant is properly configured with file search capabilities!');
    console.log('\n💡 The assistant can now:');
    console.log('   - Search through uploaded CSV files');
    console.log('   - Answer questions about voters and proposals');
    console.log('   - Provide data-driven governance insights');
    
  } catch (error: any) {
    console.error('\n❌ Error verifying assistant:', error.message);
    
    if (error.status === 404) {
      console.log('\n💡 Assistant not found. Run: npm run setup-assistant');
    }
    
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyAssistantSetup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

export default verifyAssistantSetup;
