import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function setupGovernanceAssistant() {
  try {
    console.log('🚀 Polka Guardian Governance Assistant Setup\n');
    
    // Step 1: Upload CSV files
    console.log('📁 Uploading governance data files...\n');
    
    const dataDir = path.join(process.cwd(), 'public/data');
    
    if (!fs.existsSync(dataDir)) {
      console.error('❌ Data directory not found:', dataDir);
      process.exit(1);
    }
    
    const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    console.log(`Found CSV files: [${csvFiles.map(f => `'${f}'`).join(', ')}]\n`);
    
    const uploadedFileIds: string[] = [];
    
    for (const csvFile of csvFiles) {
      const filePath = path.join(dataDir, csvFile);
      console.log(`Uploading ${csvFile}...`);
      
      try {
        const file = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: 'assistants',
        });
        
        console.log(`✅ ${csvFile} uploaded: ${file.id}\n`);
        uploadedFileIds.push(file.id);
      } catch (error) {
        console.error(`❌ Failed to upload ${csvFile}:`, error);
        throw error;
      }
    }
    
    if (uploadedFileIds.length === 0) {
      console.error('❌ No CSV files were uploaded');
      process.exit(1);
    }
    
    // Step 2: Create Assistant with uploaded files
    console.log('\n🤖 Creating Polkadot Governance Assistant...\n');
    
    const systemInstructions = `You are an expert Polkadot and Kusama governance analyst with access to comprehensive governance datasets.

CRITICAL: You have access to CSV files containing complete governance data:
- polkadot_voters.csv - Voter addresses, voting history, token amounts, voting patterns
- proposals.csv - All referenda, proposal details, status, voting results  
- polkadot_ecosystem_metrics_raw_data.csv - Network-wide governance statistics
- monthly_voters_voting_power_by_type.csv - Monthly voter activity metrics
- polkadot_treasury_flow.csv - Treasury funding and allocation data
- polkadot_number_of_referenda_by_outcome_opengov.csv - Referenda outcome statistics

When users ask about:
- Recent proposals: ALWAYS search proposals.csv first. Return actual proposal IDs, titles, status, vote counts from the file
- Top voters: ALWAYS search polkadot_voters.csv. Identify voters by voting frequency and token amounts with real data
- Voter details: Search by exact address in polkadot_voters.csv to find complete voting history
- Governance statistics: Search ecosystem_metrics_raw_data.csv for real network statistics
- Voting trends: Search monthly_voters_voting_power_by_type.csv for temporal patterns

IMPORTANT RULES:
1. ALWAYS use the retrieval tool to search the attached files
2. CITE specific data from files with actual numbers, not general information
3. NEVER say "I don't have access" if data is in the files
4. Format responses with clear sections: Summary, Key Data, Insights, Recommendations
5. Include specific proposal IDs, voter addresses (shortened), and vote counts from actual data

Be helpful, accurate, and provide concrete data from the governance files.`;
    
    try {
      // Create vector store and add files
      console.log('📚 Creating vector store and adding files...');
      const vectorStore = await openai.vectorStores.create({
        name: 'Polkadot Governance Data',
        file_ids: uploadedFileIds
      });
      
      // Wait for vector store to be processed
      console.log('⏳ Waiting for vector store processing...');
      let vectorStoreReady = false;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 30 seconds
      
      while (!vectorStoreReady && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const status = await openai.vectorStores.retrieve(vectorStore.id);
        console.log(`   Status: ${status.status} (${attempts + 1}/${maxAttempts})`);
        
        if (status.status === 'completed') {
          vectorStoreReady = true;
        } else if (status.status === 'expired') {
          throw new Error('Vector store processing expired');
        }
        
        attempts++;
      }
      
      if (!vectorStoreReady) {
        console.warn('⚠️ Vector store still processing, continuing anyway...');
      }
      
      // Create assistant with vector store
      const assistant = await openai.beta.assistants.create({
        name: 'Polkadot Governance Expert',
        description: 'Expert analyst for Polkadot governance data and voting patterns',
        instructions: systemInstructions,
        model: 'gpt-4-turbo-preview',
        tools: [
          { 
            type: 'file_search' 
          }
        ],
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id]
          }
        }
      });
      
      console.log('✅ Assistant created successfully!\n');
      console.log('='.repeat(60));
      console.log('Assistant Information:');
      console.log('='.repeat(60));
      console.log(`\n📌 Assistant ID: ${assistant.id}`);
      console.log(`📌 Name: ${assistant.name}`);
      console.log(`📌 Model: ${assistant.model}`);
      console.log(`📌 Files Attached: ${uploadedFileIds.length}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('📝 ADD TO YOUR .env.local FILE:');
      console.log('='.repeat(60));
      console.log(`\nOPENAI_ASSISTANT_ID=${assistant.id}\n`);
      
      console.log('🎉 Setup complete!\n');
      console.log('Next steps:');
      console.log('1. Copy the OPENAI_ASSISTANT_ID above');
      console.log('2. Add it to your .env.local file');
      console.log('3. Restart your development server');
      console.log('4. Test the governance chatbot\n');
      
      return assistant;
      
    } catch (error) {
      console.error('❌ Error creating assistant:');
      if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
      } else {
        console.error(error);
      }
      throw error;
    }
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('💥 Setup failed');
    console.error('='.repeat(60));
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Error:', error);
    }
    
    console.error('\n❓ Troubleshooting:');
    console.error('1. Verify OPENAI_API_KEY is set in .env.local');
    console.error('2. Check that your API key is valid');
    console.error('3. Ensure CSV files exist in public/data/');
    console.error('4. Check OpenAI account has sufficient credits');
    console.error('5. Try running: npm run setup-assistant again\n');
    
    process.exit(1);
  }
}

// Run setup
console.log('Starting setup...\n');
setupGovernanceAssistant();