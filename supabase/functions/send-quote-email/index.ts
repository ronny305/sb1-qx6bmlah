import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('🚀 Quote email function triggered')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    const docRaptorApiKey = Deno.env.get('DOCRAPTOR_API_KEY')!
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'ONESTOPSUPPLIESMIAMI@gmail.com'

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey || !docRaptorApiKey || !adminEmail) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the webhook payload
    const payload = await req.json()
    console.log('📨 Received payload:', payload)

    // Extract quote request data from the webhook
    const record = payload.record || payload
    const quoteRequest: QuoteRequest = {
      id: record.id,
      customer_name: record.customer_name,
      customer_email: record.customer_email,
      job_name: record.job_name,
      start_date: record.start_date,
      end_date: record.end_date,
      items: Array.isArray(record.items) ? record.items : [],
      company: record.company,
      shooting_locations: record.shooting_locations
    }

    console.log('📋 Processing quote request:', quoteRequest.id)

    // Calculate rental days (duration between pickup and return dates)
    const startDate = new Date(quoteRequest.start_date)
    const endDate = new Date(quoteRequest.end_date)
    const timeDiff = endDate.getTime() - startDate.getTime();
    const rentalDays = Math.max(1, Math.floor(timeDiff / (1000 * 3600 * 24)) - 1); // Exclude pickup and drop-off days

    console.log(`📅 Rental duration: ${rentalDays} days between ${quoteRequest.start_date} and ${quoteRequest.end_date}`)

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
    const discountAmount = record.discount_amount || 0
    const isTaxExempt = record.is_tax_exempt || false
    
    // Calculate final totals
    const subtotalAfterDiscount = grandTotal - discountAmount
    const taxAmount = isTaxExempt ? 0 : subtotalAfterDiscount * 0.06 // 6% FL sales tax
    const finalTotal = subtotalAfterDiscount + taxAmount

    console.log(`💰 Final calculations: Subtotal: $${subtotalAfterDiscount.toFixed(2)}, Tax: $${taxAmount.toFixed(2)}, Final: $${finalTotal.toFixed(2)}`)

    // Generate HTML email content
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
        .next-steps {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
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
            <p><strong>Rental Period:</strong> ${new Date(quoteRequest.start_date).toLocaleDateString()} - ${new Date(quoteRequest.end_date).toLocaleDateString()} (${rentalDays} days)</p>
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
                        <td colspan="5"><strong>FL SALES TAX (6%)</strong></td>
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

    // Generate concise customer email body HTML
    const customerEmailBodyHtml = `
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
            max-width: 600px;
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
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .quote-notes {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .next-steps {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .important-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://onestopproductionrentals.com/onestoplogo16-v2.png" alt="One Stop Production Rentals Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;">
        <div class="company-name">One Stop Production Rentals</div>
        <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">Miami's Premier Equipment Rental Provider</div>
    </div>
    <div class="content">
        <h2>Your Equipment Rental Quote</h2>
        <p>Dear ${quoteRequest.customer_name},</p>
        <p>Thank you for submitting your equipment quote request. Attached is your detailed quote and a credit card authorization form for your convenience.</p>
        
        ${discountAmount > 0 || isTaxExempt ? `
        <div class="quote-notes">
            <h3>Quote Notes</h3>
            ${discountAmount > 0 ? `<p><strong>💰 Discount Applied:</strong> A discount of $${discountAmount.toFixed(2)} has been applied to your quote.</p>` : ''}
            ${isTaxExempt ? `<p><strong>🆓 Tax Exempt Status:</strong> This quote is marked as tax-exempt. Please ensure you have your Florida State Exemption Form ready for pickup/delivery.</p>` : ''}
        </div>
        ` : ''}
        
        <div class="next-steps">
            <h3>⏰ Next Steps</h3>
            <ol>
                <li><strong>Review your attached quote</strong> for equipment details and pricing</li>
                <li><strong>Complete the credit card authorization form</strong> (also attached)</li>
                <li><strong>Reply to this email</strong> or call us at (305) 610-4655 to confirm your rental</li>
                <li><strong>Schedule pickup or delivery</strong> with our team</li>
            </ol>
            <p><strong>Response Time:</strong> We'll confirm availability and finalize details within 2 business hours.</p>
        </div>
        
        <div class="important-box">
            <h3>🚨 Important: Complete Your Order</h3>
            <p><strong>This quote is not a confirmed reservation.</strong> Equipment availability is subject to confirmation. To secure your equipment:</p>
            <ul>
                <li>Complete and return the attached credit card authorization form</li>
                <li>Confirm your rental dates and delivery/pickup preferences</li>
                <li>Provide any additional project details or special requirements</li>
            </ul>
            <p><strong>Quote Valid:</strong> This quote is valid for 30 days from today's date.</p>
        </div>
        
        <p>If you have any questions about your quote or need to make changes, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The One Stop Production Rentals Team</p>
    </div>
    <div class="footer">
        <p>6120 NW 6th Ave, Miami, FL 33127 | (305) 610-4655 | ONESTOPSUPPLIESMIAMI@gmail.com</p>
        <p>Mon-Sun: Open 24 Hours</p>
    </div>
</body>
</html>
    `

    // Fetch the CC Auth Form PDF from Supabase Storage
    console.log('📎 Fetching CC Auth Form PDF from storage...')
    let pdfAttachment = null
    
    try {
      const { data: pdfData, error: storageError } = await supabase.storage
        .from('One Stop Order Forms')
        .download('CC Auth Form.pdf')
      
      if (storageError) {
        console.error('⚠️ Error fetching PDF from storage:', storageError)
      } else if (pdfData) {
        // Convert blob to ArrayBuffer then to base64
        const arrayBuffer = await pdfData.arrayBuffer()
        
        // Fix for "RangeError: Maximum call stack size exceeded" for large files
        const chunkSize = 16384; // Process in 16KB chunks
        let binaryString = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const base64Content = btoa(binaryString);
        
        pdfAttachment = {
          filename: 'CC Auth Form.pdf',
          content: base64Content,
          content_type: 'application/pdf'
        }
        console.log('✅ CC Auth Form PDF loaded successfully')
      }
    } catch (pdfError) {
      console.error('❌ Exception while fetching PDF:', pdfError)
    }

    // Generate quote PDF using DocRaptor
    console.log('📄 Generating quote PDF using DocRaptor...')
    let quotePdfAttachment = null
    
    try {
      const docRaptorResponse = await fetch('https://api.docraptor.com/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_credentials: docRaptorApiKey,
          doc: {
            document_content: pdfSourceHtml, // Use the detailed HTML for PDF
            document_type: 'pdf',
            name: `quote-${record.id}.pdf`,
            test: false, // Set to true for testing, false for production
            javascript: false, // PDF generation doesn't need JS
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

      // Convert PDF response to base64 for email attachment
      const pdfArrayBuffer = await docRaptorResponse.arrayBuffer()
      
      // Use same chunking approach for DocRaptor PDF
      const chunkSize = 16384; // Process in 16KB chunks
      let binaryString = '';
      const bytes = new Uint8Array(pdfArrayBuffer);
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
          binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      const quotePdfBase64 = btoa(binaryString);
      
      quotePdfAttachment = {
        filename: `Quote-${quoteRequest.job_name.replace(/[^a-zA-Z0-9]/g, '_')}-${record.id}.pdf`,
        content: quotePdfBase64,
        content_type: 'application/pdf'
      }
      console.log('✅ Quote PDF generated successfully using DocRaptor')
    } catch (docRaptorError) {
      console.error('❌ Error generating quote PDF with DocRaptor:', docRaptorError)
      // Continue without quote PDF - don't fail the entire email process
    }

    // Generate admin notification email
    const adminEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Quote Request - Admin Notification</title>
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
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .alert-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 20px;
        }
        .customer-info {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .quote-summary {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .equipment-list {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .equipment-item {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .equipment-item:last-child {
            border-bottom: none;
        }
        .total-box {
            background-color: #dc2626;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .action-needed {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 NEW QUOTE REQUEST</h1>
        <p>Immediate attention required</p>
    </div>
    
    <div class="content">
        <div class="alert-box">
            <h3>⏰ Response Required Within 2 Business Hours</h3>
            <p>A new quote request has been submitted and the customer expects a response within 2 business hours.</p>
        </div>

        <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${quoteRequest.customer_name}</p>
            <p><strong>Email:</strong> <a href="mailto:${quoteRequest.customer_email}">${quoteRequest.customer_email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${record.customer_phone || 'Not provided'}">${record.customer_phone || 'Not provided'}</a></p>
            ${quoteRequest.company ? `<p><strong>Company:</strong> ${quoteRequest.company}</p>` : ''}
        </div>

        <div class="quote-summary">
            <h3>📋 Project Summary</h3>
            <p><strong>Job Name:</strong> ${quoteRequest.job_name}</p>
            <p><strong>Rental Period:</strong> ${new Date(quoteRequest.start_date).toLocaleDateString()} - ${new Date(quoteRequest.end_date).toLocaleDateString()} (${rentalDays} days)</p>
            <p><strong>Shooting Locations:</strong> ${quoteRequest.shooting_locations}</p>
            <p><strong>Quote ID:</strong> ${quoteRequest.id}</p>
        </div>

        <div class="equipment-list">
            <h3>🎬 Equipment Requested (${quoteItems.length} items)</h3>
            ${quoteItems.map(item => `
                <div class="equipment-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>Qty: ${item.quantity} × ${item.unitsPerItem} = ${item.totalUnits} total units</small>
                    </div>
                    <div style="text-align: right;">
                        <strong>$${item.total.toFixed(2)}</strong><br>
                        <small>$${item.pricePerUnit.toFixed(2)}/unit/day × ${item.days} days</small>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="total-box">
            ${discountAmount > 0 ? `ORIGINAL VALUE: $${grandTotal.toFixed(2)}<br>DISCOUNT APPLIED: -$${discountAmount.toFixed(2)}<br>` : ''}
            BEFORE TAX TOTAL: $${subtotalAfterDiscount.toFixed(2)}<br>
            ${isTaxExempt ? 'FL STATE EXEMPTION APPLIED<br>' : `MIAMI-DADE SALES TAX: $${taxAmount.toFixed(2)}<br>`}
            <span style="font-size: 22px;">FINAL TOTAL: $${finalTotal.toFixed(2)}</span>
        </div>

        <div class="action-needed">
            <h3>🎯 Next Steps</h3>
            <ol>
                <li><strong>Review availability</strong> for the requested dates</li>
                <li><strong>Confirm pricing</strong> and adjust if necessary</li>
                <li><strong>Contact customer</strong> within 2 business hours</li>
                <li><strong>Update quote status</strong> in the admin dashboard</li>
            </ol>
            <p><strong>Admin Dashboard:</strong> <a href="https://onestopproductionrentals.com/admin/quotes/${quoteRequest.id}">View Quote Details</a></p>
        </div>
    </div>
</body>
</html>
    `

    // Prepare attachments array
    const attachments = []
    if (quotePdfAttachment) {
      attachments.push(quotePdfAttachment)
    }
    if (pdfAttachment) {
      attachments.push(pdfAttachment)
    }

    // Send customer email
    const emailData = {
      from: 'One Stop Production Rentals <noreply@onestopproductionrentals.com>',
      to: [quoteRequest.customer_email],
      subject: `Your Equipment Rental Quote Request Confirmation - ${quoteRequest.job_name}`, // Simplified subject
      html: customerEmailBodyHtml, // Use the concise HTML for the email body
      attachments: attachments
    }

    console.log('📧 Sending customer email to:', quoteRequest.customer_email)
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Failed to send customer email:', errorText)
      throw new Error(`Failed to send customer email: ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    console.log('✅ Customer email sent successfully:', emailResult.id)

    // Send admin notification email
    const adminEmailData = {
      from: 'One Stop Production Rentals <noreply@onestopproductionrentals.com>',
      to: [adminEmail],
      subject: `🚨 NEW QUOTE REQUEST - ${quoteRequest.customer_name} - ${finalTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      html: adminEmailHtml,
    }

    console.log('📧 Sending admin notification to:', adminEmail)
    
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminEmailData),
    })

    let adminEmailResult = null;
    if (!adminEmailResponse.ok) {
      const adminErrorText = await adminEmailResponse.text()
      console.error('⚠️ Failed to send admin notification:', adminErrorText)
      // Don't throw error for admin email failure - customer email is more critical
    } else {
      adminEmailResult = await adminEmailResponse.json()
      console.log('✅ Admin notification sent successfully:', adminEmailResult.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: payload.isResend ? 'Quote email resent successfully' : 'Quote email sent successfully',
        customerEmailId: emailResult.id,
        adminEmailId: adminEmailResult ? adminEmailResult.id : null,
        quoteTotal: finalTotal,
        discountApplied: discountAmount,
        quotePdfGenerated: !!quotePdfAttachment,
        ccAuthFormAttached: !!pdfAttachment
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in send-quote-email function:', error)
    
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