import axios from 'axios'

class AIService {
  constructor () {
    this.apiKey = process.env.DEEPSEEK_API_KEY
    this.baseURL = 'https://api.deepseek.com/v1'
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  async generateProductSuggestions (userBehavior, availableProducts) {
    try {
      const prompt = this.buildSuggestionPrompt(userBehavior, availableProducts)

      const response = await this.client.post('/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ecommerce product recommender. Analyze user behavior and suggest relevant products.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      const suggestions = this.parseAISuggestions(response.data.choices[0].message.content)
      return suggestions
    } catch (error) {
      console.error('AI Service Error:', error)
      // Fallback to basic recommendations if AI fails
      return this.getFallbackSuggestions(userBehavior, availableProducts)
    }
  }

  buildSuggestionPrompt (userBehavior, availableProducts) {
    const { viewedProducts, cartProducts, purchasedProducts, searchHistory } = userBehavior

    let prompt = 'Based on the following user behavior, recommend 5-8 relevant products from the available catalog:\n\n'

    if (viewedProducts.length > 0) {
      prompt += `Recently viewed products: ${viewedProducts.map(p => p.name).join(', ')}\n`
    }

    if (cartProducts.length > 0) {
      prompt += `Products in cart: ${cartProducts.map(p => p.name).join(', ')}\n`
    }

    if (purchasedProducts.length > 0) {
      prompt += `Previously purchased: ${purchasedProducts.map(p => p.name).join(', ')}\n`
    }

    if (searchHistory.length > 0) {
      prompt += `Search history: ${searchHistory.join(', ')}\n`
    }

    prompt += '\nAvailable products:\n'
    availableProducts.slice(0, 20).forEach(product => {
      prompt += `- ${product.name}: ${product.description} (Category: ${product.category?.name})\n`
    })

    prompt += '\nPlease return recommendations as a JSON array of product IDs that would interest this user, with a brief reason for each recommendation. Format: [{"productId": 1, "reason": "brief explanation"}]'

    return prompt
  }

  parseAISuggestions (aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback: extract product IDs from text
      const idMatches = aiResponse.match(/productId["\s:]+(\d+)/gi)
      if (idMatches) {
        return idMatches.map(match => {
          const id = match.match(/(\d+)/)[1]
          return { productId: parseInt(id), reason: 'AI recommended' }
        })
      }

      return []
    } catch (error) {
      console.error('Error parsing AI suggestions:', error)
      return []
    }
  }

  getFallbackSuggestions (userBehavior, availableProducts) {
    // Simple fallback based on categories and recent activity
    const { viewedProducts, cartProducts } = userBehavior

    const userCategories = [...viewedProducts, ...cartProducts]
      .map(p => p.category?.name)
      .filter(Boolean)

    const uniqueCategories = [...new Set(userCategories)]

    return availableProducts
      .filter(product =>
        uniqueCategories.includes(product.category?.name) &&
        !viewedProducts.some(vp => vp.id === product.id) &&
        !cartProducts.some(cp => cp.id === product.id)
      )
      .slice(0, 6)
      .map(product => ({
        productId: product.id,
        reason: `Similar to products you've viewed in ${product.category?.name}`
      }))
  }

  async generateProductDescription (productData) {
    try {
      const prompt = `Generate an engaging product description for: ${productData.name}

Details:
- Price: $${productData.price}
- Category: ${productData.category?.name}
- Current description: ${productData.description || 'None provided'}

Write a compelling, SEO-friendly product description that highlights benefits and features. Keep it under 150 words.`

      const response = await this.client.post('/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional product description writer for ecommerce.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })

      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error('AI Description Generation Error:', error)
      return productData.description || 'Product description not available.'
    }
  }
}

export default new AIService()
