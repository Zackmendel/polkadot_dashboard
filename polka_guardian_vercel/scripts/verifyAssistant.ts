import OpenAI from 'openai';
import 'dotenv/config';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function verifyAssistant() {
  try {
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    
    if (!assistantId) {
      console.error('❌ OPENAI_ASSISTANT_ID not set in .env.local');
      process.exit(1);
    }
    
    console.log('🔍 Verifying Polka Guardian Assistant...\n');
    
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    console.log('✅ Assistant found!\n');
    console.log('='.repeat(60));
    console.log('Assistant Details:');
    console.log('='.repeat(60));
    console.log(`Name: ${assistant.name}`);
    console.log(`ID: ${assistant.id}`);
    console.log(`Model: ${assistant.model}`);
    console.log(`Description: ${assistant.description || 'N/A'}`);
    
    // Check for vector stores with file search
    if (assistant.tool_resources?.file_search?.vector_store_ids) {
      const vectorStoreIds = assistant.tool_resources.file_search.vector_store_ids;
      console.log(`\n📚 Vector Stores (${vectorStoreIds.length}):`);
      
      for (const vsId of vectorStoreIds) {
        try {
          const vectorStore = await openai.vectorStores.retrieve(vsId);
          console.log(`  ✅ ${vectorStore.name} (${vsId})`);
          console.log(`     Files: ${vectorStore.file_counts?.completed || 0} completed, ${vectorStore.file_counts?.in_progress || 0} in progress`);
          
          // List files in vector store
          const files = await openai.vectorStores.files.list(vsId);
          if (files.data.length > 0) {
            console.log(`     Files in store:`);
            for (const file of files.data) {
              try {
                const fileDetails = await openai.files.retrieve(file.id);
                console.log(`       - ${fileDetails.filename}`);
              } catch (error) {
                console.log(`       - File ${file.id} (unable to retrieve details)`);
              }
            }
          }
        } catch (error) {
          console.log(`  ❌ Vector Store ${vsId} (unable to retrieve details)`);
        }
      }
    } else {
      console.log('\n⚠️  No vector stores attached to assistant');
    }
    
    console.log('\n✅ Assistant is ready to use!\n');
    
  } catch (error) {
    console.error('❌ Error verifying assistant:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

verifyAssistant();
