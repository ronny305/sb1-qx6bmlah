import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to format dates without timezone conversion
function formatDateWithoutTimezone(dateString: string): string {
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

interface QuoteRequestItem {
  equipment: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  job_name: string;
  start_date: string;
  end_date: string;
  items: QuoteRequestItem[];
  company?: string;
  shooting_locations: string;
  discount_amount?: number;
  is_tax_exempt?: boolean;
}

interface Equipment {
  id: number;
  name: string;
  price_per_unit: number;
  category: string;
  description: string;
  units_per_item: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Generate PDF function triggered')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const docRaptorApiKey = Deno.env.get('DOCRAPTOR_API_KEY')!

    if (!supabaseUrl || !supabaseServiceKey || !docRaptorApiKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request payload
    const { quoteRequestId } = await req.json()
    console.log('📋 Generating PDF for quote request ID:', quoteRequestId)

    // Fetch the quote request data
    const { data: record, error: fetchError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteRequestId)
      .single()

    if (fetchError || !record) {
      console.error('❌ Error fetching quote request:', fetchError)
      throw new Error(`Failed to fetch quote request: ${fetchError?.message || 'Not found'}`)
    }

    const quoteRequest: QuoteRequest = {
      id: record.id,
      customer_name: record.customer_name,
      customer_email: record.customer_email,
      job_name: record.job_name,
      start_date: record.start_date,
      end_date: record.end_date,
      items: Array.isArray(record.items) ? record.items : [],
      company: record.company,
      shooting_locations: record.shooting_locations,
      discount_amount: record.discount_amount,
      is_tax_exempt: record.is_tax_exempt
    }

    // Calculate rental days (duration between pickup and return dates)
    const startDate = new Date(quoteRequest.start_date)
    const endDate = new Date(quoteRequest.end_date)
    const timeDiff = endDate.getTime() - startDate.getTime();
    const rentalDays = Math.max(1, Math.floor(timeDiff / (1000 * 3600 * 24)) - 1); // Exclude pickup and drop-off days

    console.log(`📅 Rental duration: ${rentalDays} days`)

    // Get equipment IDs from the items array
    const equipmentIds = quoteRequest.items.map(item => item.equipment.id)

    if (equipmentIds.length === 0) {
      console.log('⚠️ No equipment items found in quote request')
      return new Response('No equipment items found', { status: 400, headers: corsHeaders })
    }

    // Fetch equipment details and prices from the database
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('id, name, price_per_unit, category, description, units_per_item')
      .in('id', equipmentIds)

    if (equipmentError) {
      console.error('❌ Error fetching equipment:', equipmentError)
      throw equipmentError
    }

    const equipmentMap = new Map<number, Equipment>()
    equipmentData?.forEach(equipment => {
      equipmentMap.set(equipment.id, equipment)
    })

    // Calculate quote totals
    let grandTotal = 0
    const quoteItems = []

    for (const item of quoteRequest.items) {
      const equipment = equipmentMap.get(item.equipment.id)
      if (!equipment) {
        console.warn(`⚠️ Equipment not found for ID: ${item.equipment.id}`)
        continue
      }

      const pricePerUnit = equipment.price_per_unit || 0
      const totalUnits = item.quantity * (equipment.units_per_item || 1)
      const itemTotal = totalUnits * pricePerUnit * rentalDays
      grandTotal += itemTotal

      quoteItems.push({
        name: equipment.name,
        quantity: item.quantity,
        totalUnits: totalUnits,
        unitsPerItem: equipment.units_per_item || 1,
        pricePerUnit: pricePerUnit,
        days: rentalDays,
        total: itemTotal,
        category: equipment.category,
        description: equipment.description
      })
    }

    console.log(`💰 Grand total calculated: $${grandTotal.toFixed(2)}`)

    // Get discount and tax exempt status from payload
    const discountAmount = quoteRequest.discount_amount || 0
    const isTaxExempt = quoteRequest.is_tax_exempt || false
    
    // Calculate final totals
    const subtotalAfterDiscount = grandTotal - discountAmount
    const FL_SALES_TAX_RATE = 0.07; // 7% Miami-Dade County sales tax (6% FL state + 1% county surtax)
    const taxAmount = isTaxExempt ? 0 : subtotalAfterDiscount * FL_SALES_TAX_RATE
    const finalTotal = subtotalAfterDiscount + taxAmount

    console.log(`💰 Final calculations: Subtotal: $${subtotalAfterDiscount.toFixed(2)}, Tax: $${taxAmount.toFixed(2)}, Final: $${finalTotal.toFixed(2)}`)

    // Generate HTML for PDF
    const pdfSourceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Equipment Rental Quote</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #000;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
        }
        .tagline {
            font-size: 14px;
            margin-top: 5px;
            opacity: 0.9;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .quote-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .quote-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .quote-table th {
            background-color: #dc2626;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .quote-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .quote-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .total-row {
            background-color: #dc2626 !important;
            color: white;
            font-weight: bold;
        }
        .total-row td {
            border-bottom: none;
        }
        .project-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .contact-info {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .price {
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://onestopproductionrentals.com/onestoplogo16-v2.png" alt="One Stop Production Rentals Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;">
        <div class="company-name">One Stop Production Rentals</div>
        <div class="tagline">Miami's Premier Equipment Rental Provider</div>
    </div>
    
    <div class="content">
        <h2>Your Equipment Rental Quote</h2>
        
        <div class="project-info">
            <h3>Project Details</h3>
            <p><strong>Customer:</strong> ${quoteRequest.customer_name}</p>
            ${quoteRequest.company ? `<p><strong>Company:</strong> ${quoteRequest.company}</p>` : ''}
            <p><strong>Job Name:</strong> ${quoteRequest.job_name}</p>
            <p><strong>Rental Period:</strong> ${formatDateWithoutTimezone(quoteRequest.start_date)} - ${formatDateWithoutTimezone(quoteRequest.end_date)} (${rentalDays} days)</p>
            <p><strong>Shooting Locations:</strong> ${quoteRequest.shooting_locations}</p>
        </div>

        <div class="quote-details">
            <h3>Equipment Quote Breakdown</h3>
            <table class="quote-table">
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Items</th>
                        <th>Total Units</th>
                        <th>Rate/Unit/Day</th>
                        <th>Days</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quoteItems.map(item => `
                    <tr>
                        <td>
                            <strong>${item.name}</strong>
                            <br><small style="color: #666;">${item.description}</small>
                        </td>
                        <td>${item.quantity}</td>
                        <td>${item.totalUnits}${item.unitsPerItem > 1 ? ` (${item.quantity} × ${item.unitsPerItem})` : ''}</td>
                        <td class="price">$${item.pricePerUnit.toFixed(2)}</td>
                        <td>${item.days}</td>
                        <td class="price">$${item.total.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    <tr style="border-top: 2px solid #333;">
                        <td colspan="5"><strong>EQUIPMENT SUBTOTAL</strong></td>
                        <td class="price"><strong>$${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                    ${discountAmount > 0 ? `
                    <tr style="background-color: #fef2f2;">
                        <td colspan="5" style="color: #dc2626;"><strong>DISCOUNT APPLIED</strong></td>
                        <td class="price" style="color: #dc2626;"><strong>-$${discountAmount.toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    <tr style="background-color: #f3f4f6;">
                        <td colspan="5"><strong>BEFORE TAX TOTAL</strong></td>
                        <td class="price"><strong>$${subtotalAfterDiscount.toFixed(2)}</strong></td>
                    </tr>
                    ${isTaxExempt ? `
                    <tr style="background-color: #f0fdf4;">
                        <td colspan="5" style="color: #16a34a;"><strong>TAX STATUS</strong></td>
                        <td class="price" style="color: #16a34a;"><strong>EXEMPT</strong></td>
                    </tr>
                    ` : `
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="5"><strong>FL SALES TAX (7%)</strong></td>
                        <td class="price"><strong>$${taxAmount.toFixed(2)}</strong></td>
                    </tr>
                    `}
                    <tr class="total-row">
                        <td colspan="5"><strong>AFTER TAX TOTAL</strong></td>
                        <td class="price"><strong>$${finalTotal.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="contact-info">
            <h3>Driver Information</h3>
            <p><strong>Driver Name:</strong> _________________________________</p>
            <p><strong>Driver Phone:</strong> _________________________________</p>
            <p><strong>Driver Email:</strong> _________________________________</p>
        </div>

        <div class="contact-info">
            <h3>Production Team Information</h3>
            <p><strong>Producer:</strong> _________________________________</p>
            <p><strong>Production Supervisor:</strong> _________________________________</p>
            <p><strong>Production Coordinator:</strong> _________________________________</p>
            <br>
            <p><strong>Customer Signature:</strong> _________________________________</p>
            <p><strong>Date:</strong> _________________________________</p>
        </div>

        <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> (305) 610-4655</p>
            <p><strong>Email:</strong> ONESTOPSUPPLIESMIAMI@gmail.com</p>
            <p><strong>Address:</strong> 6120 NW 6th Ave, Miami, FL 33127</p>
            <p><strong>Business Hours:</strong><br>
            Mon-Sun: Open 24 Hours</p>
        </div>
    </div>
    
    <div class="footer">
        <p>One Stop Production Rentals - Professional Equipment Rentals in Miami</p>
        <p>This quote is valid for 30 days from the date of issue.</p>
    </div>
</body>
</html>
    `

    // Generate quote PDF using DocRaptor
    console.log('📄 Generating quote PDF using DocRaptor...')
    
    const docRaptorResponse = await fetch('https://api.docraptor.com/docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_credentials: docRaptorApiKey,
        doc: {
          document_content: pdfSourceHtml,
          document_type: 'pdf',
          name: `quote-${record.id}.pdf`,
          test: false,
          javascript: false,
          prince_options: {
            media: 'print',
            baseurl: 'https://onestopproductionrentals.com/',
          }
        }
      })
    })

    if (!docRaptorResponse.ok) {
      const errorText = await docRaptorResponse.text()
      console.error('⚠️ DocRaptor API error:', errorText)
      throw new Error(`DocRaptor API error: ${docRaptorResponse.status} - ${errorText}`)
    }

    // Get PDF as ArrayBuffer and convert to base64
    const pdfArrayBuffer = await docRaptorResponse.arrayBuffer()
    const bytes = new Uint8Array(pdfArrayBuffer);
    let binaryString = '';
    const chunkSize = 16384; // Process in 16KB chunks
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const base64Pdf = btoa(binaryString);
    
    console.log('✅ Quote PDF generated successfully using DocRaptor')

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf: base64Pdf,
        filename: `Quote-${quoteRequest.job_name.replace(/[^a-zA-Z0-9]/g, '_')}-${record.id}.pdf`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in generate-quote-pdf function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})