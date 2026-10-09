// Creates all 7 TCC agents in Bolna and writes their ids to src/config/agent-ids.json.
// Run once (or after editing prompts):  npm run create-agents
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS } from '../agents/agents.js';
import { createAgent, isDryRun } from '../integrations/bolna.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'config', 'agent-ids.json');

function buildAgentBody(agent) {
  const provider = process.env.BOLNA_LLM_PROVIDER || 'openai';
  const model = process.env.BOLNA_LLM_MODEL || 'gpt-4.1-mini';
  const telephony = process.env.BOLNA_TELEPHONY_PROVIDER || 'plivo';
  const base = process.env.PUBLIC_BASE_URL || 'https://voice.theconsultingcrew.in';
  const token = process.env.BOLNA_WEBHOOK_TOKEN ? `&token=${encodeURIComponent(process.env.BOLNA_WEBHOOK_TOKEN)}` : '';
  const webhook = `${base}/webhooks/bolna?client_id=tcc&agent=${agent.key}${token}`;
  return {
    agent_config: {
      agent_name: agent.name,
      agent_welcome_message: agent.welcome,
      webhook_url: webhook,
      telephony_provider: telephony,
      tasks: [{
        task_type: 'conversation',
        toolchain: { execution: 'sequential', pipelines: [['transcriber', 'llm', 'synthesizer']] },
        tools_config: {
          llm_agent: { agent_type: 'simple_llm_agent', agent_flow_type: 'streaming', llm_config: { provider, model, max_tokens: 150, temperature: 0.2 } },
          // Sarvam = best Hindi/Hinglish. Your Sarvam key is stored account-level in Bolna's Providers vault (BYOK).
          synthesizer: { provider: 'sarvam', provider_config: { voice_id: 'anushka', model: 'bulbul:v3', language: 'hi' }, stream: true, buffer_size: 250, audio_format: 'wav' },
          transcriber: { provider: 'sarvam', model: 'saaras:v3', language: 'hi', stream: true, encoding: 'linear16', sampling_rate: 16000, endpointing: 250 },
          input: { provider: telephony, format: 'wav' },
          output: { provider: telephony, format: 'wav' },
        },
        task_config: { call_terminate: agent.callTerminate || 120, hangup_after_silence: 10 },
      }],
    },
    agent_prompts: { task_1: { system_prompt: agent.systemPrompt } },
  };
}

async function main() {
  console.log(`Creating ${Object.keys(AGENTS).length} agents in Bolna (DRY_RUN=${isDryRun})...\n`);
  const ids = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  for (const agent of Object.values(AGENTS)) {
    try {
      const r = await createAgent(buildAgentBody(agent));
      ids[agent.key] = r.agent_id;
      console.log(`  ✓ ${agent.key.padEnd(16)} -> ${r.agent_id}`);
    } catch (e) {
      console.error(`  ✗ ${agent.key}: ${e.message}`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(ids, null, 2));
  console.log(`\nWrote ${OUT}`);
  console.log('Next: in the Bolna dashboard, attach your +91 number to the "receptionist" agent for inbound calls.');
}
main();
