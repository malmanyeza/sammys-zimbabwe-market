
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('No search query provided');
    }

    console.log('Received search query:', query);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get all products from the database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        stock,
        categories (
          name
        )
      `);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Failed to fetch products from database');
    }

    console.log('Fetched products:', products?.length);

    // Create a formatted list of products for the AI
    const productList = products?.map(product => {
      const categoryName = product.categories ? product.categories.name : 'No category';
      return `ID: ${product.id}, Name: ${product.name}, Description: ${product.description || 'No description'}, Price: $${product.price}, Category: ${categoryName}, Stock: ${product.stock}`;
    }).join('\n') || '';

    // Use OpenAI to find matching products
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful shopping assistant for Sammy's Market, a Zimbabwe marketplace. Your job is to help customers find products that match their needs.

Here is the current product inventory:
${productList}

When a user asks for product recommendations:
1. Analyze their request carefully
2. Find products that match their description (look for keywords, cultural references, occasions, etc.)
3. Return the product IDs of ALL matching items as a JSON array (not just one product)
4. If multiple products could work, include them all (up to 5 most relevant)
5. If no products match, return an empty array
6. Consider synonyms, cultural context, and related terms (e.g., "soko" relates to elephant/traditional items, "jewellery" could match necklaces or beaded items, "traditional" could match sculptures or cultural items)
7. Look at both product names AND descriptions for matches

Respond with ONLY a JSON object in this format:
{
  "product_ids": ["id1", "id2", "id3"],
  "explanation": "Brief explanation of why these products match the request and how many options were found"
}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${await openAIResponse.text()}`);
    }

    const aiResult = await openAIResponse.json();
    const aiContent = aiResult.choices[0].message.content;
    
    console.log('AI response:', aiContent);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid response from AI');
    }

    // Get the full product details for the recommended products
    const recommendedProducts = products?.filter(product => 
      parsedResponse.product_ids.includes(product.id)
    ) || [];

    return new Response(
      JSON.stringify({
        products: recommendedProducts,
        explanation: parsedResponse.explanation,
        query: query
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in product-search-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        products: [],
        explanation: 'Sorry, I encountered an error while searching for products. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
