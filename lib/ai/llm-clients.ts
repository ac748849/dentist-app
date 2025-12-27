// lib/ai/llm-client.ts
export interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
  }
  
  export interface ToolCall {
    name: string
    input: Record<string, any>
  }
  
  export interface LLMResponse {
    content: string
    toolCalls?: ToolCall[]
    stopReason?: string
  }
  
  export interface LLMConfig {
    provider: 'ollama' | 'claude'
    model: string
    baseUrl?: string
  }
  
  export class LLMClient {
    private config: LLMConfig
  
    constructor(config?: Partial<LLMConfig>) {
      this.config = {
        provider: (process.env.LLM_PROVIDER as 'ollama' | 'claude') || 'ollama',
        model: process.env.LLM_MODEL || 'llama3.1:8b',
        baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
        ...config,
      }
    }
  
    async chat(
      messages: Message[],
      tools?: any[],
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<LLMResponse> {
      if (this.config.provider === 'ollama') {
        return this.chatOllama(messages, tools, options)
      }
      throw new Error(`Provider ${this.config.provider} not implemented`)
    }
  
    private async chatOllama(
      messages: Message[],
      tools?: any[],
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<LLMResponse> {
      const url = `${this.config.baseUrl}/api/chat`
  
      const ollamaMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
  
      let systemPrompt = messages.find((m) => m.role === 'system')?.content || ''
      
      if (tools && tools.length > 0) {
        systemPrompt += '\n\nVous avez accès aux outils suivants :\n'
        tools.forEach((tool) => {
          systemPrompt += `\n- ${tool.name}: ${tool.description}\n`
          systemPrompt += `  Paramètres: ${JSON.stringify(tool.input_schema, null, 2)}\n`
        })
        systemPrompt += '\n\nPour utiliser un outil, répondez UNIQUEMENT avec un JSON au format:\n'
        systemPrompt += '{"tool": "nom_outil", "input": {...parametres...}}\n\n'
      }
  
      const payload = {
        model: this.config.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 2000,
        },
      }
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
  
        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status}`)
        }
  
        const data = await response.json()
        const content = data.message?.content || ''
  
        let toolCalls: ToolCall[] | undefined
  
        if (tools && tools.length > 0) {
          const jsonMatch = content.match(/\{[\s\S]*"tool"[\s\S]*"input"[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0])
              if (parsed.tool && parsed.input) {
                toolCalls = [{ name: parsed.tool, input: parsed.input }]
              }
            } catch (e) {}
          }
        }
  
        return {
          content: toolCalls ? '' : content,
          toolCalls,
          stopReason: data.done ? 'end_turn' : 'max_tokens',
        }
      } catch (error) {
        console.error('LLM Error:', error)
        throw error
      }
    }
  
    static formatMessages(
      systemPrompt: string,
      conversationHistory: Array<{ role: string; content: string }>,
      newMessage: string
    ): Message[] {
      const messages: Message[] = [{ role: 'system', content: systemPrompt }]
      conversationHistory.forEach((msg) => {
        messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
      })
      messages.push({ role: 'user', content: newMessage })
      return messages
    }
  }