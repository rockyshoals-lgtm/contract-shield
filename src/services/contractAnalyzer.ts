// ContractShield — Claude API Contract Analyzer
// Sends contract text to Claude API and parses structured analysis

import type { ContractAnalysis, ContractClause, ClauseCategory } from '../types';
import type { RiskLevel } from '../theme';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `You are ContractShield, an expert contract analyst for freelancers and independent contractors.

Your job is to analyze contracts and provide:
1. A plain-English explanation of every significant clause
2. Risk assessment for each clause (high, medium, low, info)
3. Specific negotiation tips where relevant
4. Red flags that could harm the freelancer
5. Missing clauses that should be present

IMPORTANT: Always analyze from the FREELANCER'S perspective. Flag anything that:
- Gives the client too much power
- Limits the freelancer's rights unfairly
- Has vague payment terms
- Contains hidden penalties
- Lacks protections the freelancer should have

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short descriptive title for this contract",
  "contractType": "Type of contract (e.g., Freelance Service Agreement, NDA, etc.)",
  "overallRisk": "high" | "medium" | "low",
  "overallSummary": "2-3 sentence plain English summary of the contract and its key implications for the freelancer",
  "clauses": [
    {
      "title": "Clause title",
      "originalText": "Exact text from the contract for this clause",
      "plainEnglish": "What this clause means in simple terms",
      "riskLevel": "high" | "medium" | "low" | "info",
      "riskExplanation": "Why this risk level was assigned",
      "negotiationTip": "How to negotiate this clause (optional, include for medium/high risk)",
      "category": "payment" | "scope" | "termination" | "liability" | "ip" | "confidentiality" | "non_compete" | "indemnification" | "dispute" | "timeline" | "other"
    }
  ],
  "redFlags": ["List of specific red flags found in this contract"],
  "missingClauses": ["Important clauses that are missing from this contract"],
  "negotiationSummary": "Overall negotiation strategy and priority changes to request"
}`;

export interface AnalyzeOptions {
  text: string;
  apiKey: string;
  inputMethod: 'camera' | 'file' | 'paste';
  fileName?: string;
  onProgress?: (status: string) => void;
}

function generateId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function analyzeContract(options: AnalyzeOptions): Promise<ContractAnalysis> {
  const { text, apiKey, inputMethod, fileName, onProgress } = options;

  if (!text.trim()) {
    throw new Error('No contract text provided');
  }
  if (!apiKey.trim()) {
    throw new Error('Claude API key is required. Add it in Settings.');
  }

  onProgress?.('Sending contract to Claude AI...');

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze the following contract and provide your assessment in the JSON format specified:\n\n---\n\n${text}\n\n---\n\nRemember to respond ONLY with valid JSON.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Claude API key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`API error (${response.status}): ${errorBody}`);
  }

  onProgress?.('Parsing analysis results...');

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No response from Claude API');
  }

  // Parse JSON from response (handle possible markdown code blocks)
  let parsed: any;
  try {
    const jsonStr = content.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Failed to parse analysis. The contract may be too short or unclear.');
  }

  onProgress?.('Building your report...');

  // Validate and build analysis
  const analysisId = generateId();
  const clauses: ContractClause[] = (parsed.clauses || []).map((c: any, i: number) => ({
    id: `${analysisId}_clause_${i}`,
    title: c.title || `Clause ${i + 1}`,
    originalText: c.originalText || '',
    plainEnglish: c.plainEnglish || '',
    riskLevel: validateRiskLevel(c.riskLevel),
    riskExplanation: c.riskExplanation || '',
    negotiationTip: c.negotiationTip || undefined,
    category: validateCategory(c.category),
  }));

  const analysis: ContractAnalysis = {
    id: analysisId,
    title: parsed.title || fileName || 'Untitled Contract',
    contractType: parsed.contractType || 'Unknown',
    overallRisk: validateRiskLevel(parsed.overallRisk),
    overallSummary: parsed.overallSummary || 'Analysis complete.',
    clauses,
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    missingClauses: Array.isArray(parsed.missingClauses) ? parsed.missingClauses : [],
    negotiationSummary: parsed.negotiationSummary || '',
    createdAt: new Date().toISOString(),
    rawText: text,
    inputMethod,
    fileName,
  };

  return analysis;
}

function validateRiskLevel(level: any): RiskLevel {
  if (['high', 'medium', 'low', 'info'].includes(level)) return level;
  return 'info';
}

function validateCategory(cat: any): ClauseCategory {
  const valid: ClauseCategory[] = [
    'payment', 'scope', 'termination', 'liability', 'ip',
    'confidentiality', 'non_compete', 'indemnification', 'dispute', 'timeline', 'other',
  ];
  if (valid.includes(cat)) return cat;
  return 'other';
}

// Demo analysis for testing without API key
export function getDemoAnalysis(): ContractAnalysis {
  const id = generateId();
  return {
    id,
    title: 'Sample Freelance Web Development Agreement',
    contractType: 'Freelance Service Agreement',
    overallRisk: 'medium',
    overallSummary:
      'This is a standard freelance agreement with some concerning clauses around payment terms and IP ownership. The 60-day payment window and broad IP transfer clause should be negotiated before signing.',
    clauses: [
      {
        id: `${id}_clause_0`,
        title: 'Payment Terms — Net 60',
        originalText:
          'Contractor shall submit invoices upon completion of each milestone. Client shall pay within sixty (60) business days of receipt of invoice.',
        plainEnglish:
          'You have to wait up to 60 business days (about 3 months) after sending your invoice before the client is required to pay you.',
        riskLevel: 'high',
        riskExplanation:
          'Net 60 business days is excessively long for freelance work. Industry standard is Net 15 or Net 30 calendar days. This creates cash flow problems.',
        negotiationTip:
          'Request Net 15 or Net 30 calendar days. Add a late payment fee of 1.5% per month for overdue invoices.',
        category: 'payment',
      },
      {
        id: `${id}_clause_1`,
        title: 'Intellectual Property Assignment',
        originalText:
          'All work product, including but not limited to code, designs, documentation, and related materials created by Contractor shall be considered work-for-hire and shall be the exclusive property of Client.',
        plainEnglish:
          'Everything you create for this project belongs entirely to the client, including code, designs, and documentation. You cannot reuse any of it.',
        riskLevel: 'medium',
        riskExplanation:
          'Total IP transfer is common but overly broad. It could prevent you from reusing generic code patterns or frameworks you developed.',
        negotiationTip:
          'Add an exception for pre-existing tools, frameworks, and generic code. Request a license-back clause allowing you to reuse non-client-specific components.',
        category: 'ip',
      },
      {
        id: `${id}_clause_2`,
        title: 'Scope of Work',
        originalText:
          'Contractor shall perform web development services as directed by Client, including but not limited to front-end development, back-end development, and testing.',
        plainEnglish:
          'You will do web development as the client directs, with no specific limits on what that includes.',
        riskLevel: 'high',
        riskExplanation:
          'The phrase "including but not limited to" and "as directed by Client" creates unlimited scope. The client could demand any type of work under this contract.',
        negotiationTip:
          'Replace with a specific deliverables list and add a change order process for work outside the original scope.',
        category: 'scope',
      },
      {
        id: `${id}_clause_3`,
        title: 'Termination Clause',
        originalText:
          'Either party may terminate this Agreement with thirty (30) days written notice. Upon termination, Client shall pay for all completed milestones.',
        plainEnglish:
          'Either side can end the contract with 30 days notice. You only get paid for milestones already finished.',
        riskLevel: 'low',
        riskExplanation:
          'This is a fair termination clause. 30-day notice is standard and you are guaranteed payment for completed work.',
        category: 'termination',
      },
      {
        id: `${id}_clause_4`,
        title: 'Non-Compete Restriction',
        originalText:
          'For a period of twelve (12) months following termination, Contractor shall not provide similar services to any of Client\'s direct competitors.',
        plainEnglish:
          'After this contract ends, you cannot work for any of the client\'s competitors for a full year.',
        riskLevel: 'high',
        riskExplanation:
          'A 12-month non-compete is extremely restrictive for a freelancer. It could block a significant portion of your potential income.',
        negotiationTip:
          'Reduce to 3 months maximum, or remove entirely. Non-competes are rarely enforceable for contractors. At minimum, define "direct competitors" narrowly.',
        category: 'non_compete',
      },
      {
        id: `${id}_clause_5`,
        title: 'Confidentiality',
        originalText:
          'Contractor agrees to maintain confidentiality of all Client information for a period of five (5) years following termination of this Agreement.',
        plainEnglish:
          'You must keep the client\'s information secret for 5 years after the contract ends.',
        riskLevel: 'info',
        riskExplanation:
          '5-year confidentiality is standard and reasonable. This protects both parties.',
        category: 'confidentiality',
      },
    ],
    redFlags: [
      'Net 60 business days payment terms — industry standard is Net 15-30 calendar days',
      'Unlimited scope clause with "including but not limited to" language',
      '12-month non-compete restriction is excessive for freelance work',
      'No late payment penalty clause to protect the freelancer',
      'No dispute resolution mechanism specified',
    ],
    missingClauses: [
      'Late Payment Fee — Should include automatic penalty for overdue payments',
      'Revision Limits — No cap on revision rounds, risking unlimited rework',
      'Force Majeure — No protection for circumstances beyond either party\'s control',
      'Dispute Resolution — No mediation or arbitration clause',
      'Kill Fee — No compensation specified if project is cancelled mid-milestone',
    ],
    negotiationSummary:
      'Priority changes: (1) Reduce payment terms to Net 15-30 calendar days with late fees, (2) Add specific deliverables list with change order process, (3) Remove or drastically reduce the non-compete to 3 months with narrow definition, (4) Add license-back clause for pre-existing code and tools. These four changes would significantly reduce your risk.',
    createdAt: new Date().toISOString(),
    rawText: '[Demo contract text]',
    inputMethod: 'paste',
  };
}
