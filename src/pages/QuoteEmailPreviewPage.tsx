import React from 'react';
import { formatDateWithoutTimezone } from '../lib/dateUtils';

const QuoteEmailPreviewPage: React.FC = () => {
  // Mock Data for Preview
  const mockQuoteRequest = {
    id: 'mock-quote-123',
    customer_name: 'John Doe',
    customer_email: 'john.doe@example.com',
    job_name: 'Miami Commercial Shoot',
    start_date: '2025-02-15',
    end_date: '2025-02-22',
    company: 'Acme Productions',
    shooting_locations: 'Studio A Downtown Miami, South Beach Location, Wynwood Arts District',
    customer_phone: '(305) 555-1234',
  };

  const mockQuoteItems = [
    {
      name: 'Sony FX6 Cinema Camera',
      quantity: 1,
      totalUnits: 1,
      unitsPerItem: 1,
      pricePerUnit: 250.00,
      days: 7,
      total: 1750.00,
      category: 'video',
      description: 'Professional full-frame cinema camera with dual base ISO',
    },
    {
      name: 'ARRI SkyPanel S60-C',
      quantity: 2,
      totalUnits: 2,
      unitsPerItem: 1,
      pricePerUnit: 150.00,
      days: 7,
      total: 2100.00,
      category: 'lighting',
      description: 'Color-tunable LED softlight panel',
    },
    {
      name: 'KitchenAid Stand Mixer',
      quantity: 1,
      totalUnits: 1,
      unitsPerItem: 1,
      pricePerUnit: 50.00,
      days: 7,
      total: 350.00,
      category: 'home-ec',
      description: 'Professional 6-quart stand mixer with accessories',
    },
    {
      name: 'Stackable Chairs',
      quantity: 5,
      totalUnits: 50,
      unitsPerItem: 10,
      pricePerUnit: 2.00,
      days: 7,
      total: 700.00,
      category: 'general',
      description: 'Comfortable stackable chairs for events',
    },
  ];

  const mockGrandTotal = mockQuoteItems.reduce((sum, item) => sum + item.total, 0);
  const mockDiscountAmount = 200.00; // Example discount
  const mockIsTaxExempt = false; // Example tax status
  const mockSubtotalAfterDiscount = mockGrandTotal - mockDiscountAmount;
  const mockTaxAmount = mockIsTaxExempt ? 0 : mockSubtotalAfterDiscount * 0.06; // 6% FL sales tax
  const mockFinalTotal = mockSubtotalAfterDiscount + mockTaxAmount;
  const mockRentalDays = 7; // Based on mock start/end dates

  // Email HTML Template (matching the one in supabase/functions/send-quote-email/index.ts)
  const emailHtmlTemplate = `
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
        <img src="/onestoplogo16.png" alt="One Stop Production Rentals Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;">
        <div class="company-name">One Stop Production Rentals</div>
        <div class="tagline">Miami's Premier Equipment Rental Provider</div>
    </div>
    
    <div class="content">
        <h2>Your Equipment Rental Quote</h2>
        
        <div class="project-info">
            <h3>Project Details</h3>
            <p><strong>Customer:</strong> ${mockQuoteRequest.customer_name}</p>
            ${mockQuoteRequest.company ? `<p><strong>Company:</strong> ${mockQuoteRequest.company}</p>` : ''}
            <p><strong>Job Name:</strong> ${mockQuoteRequest.job_name}</p>
            <p><strong>Rental Period:</strong> ${formatDateWithoutTimezone(mockQuoteRequest.start_date)} - ${formatDateWithoutTimezone(mockQuoteRequest.end_date)} (${mockRentalDays} days)</p>
            <p><strong>Shooting Locations:</strong> ${mockQuoteRequest.shooting_locations}</p>
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
                    ${mockQuoteItems.map(item => `
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
                        <td class="price"><strong>$${mockGrandTotal.toFixed(2)}</strong></td>
                    </tr>
                    ${mockDiscountAmount > 0 ? `
                    <tr style="background-color: #fef2f2;">
                        <td colspan="5" style="color: #dc2626;"><strong>DISCOUNT APPLIED</strong></td>
                        <td class="price" style="color: #dc2626;"><strong>-$${mockDiscountAmount.toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    <tr style="background-color: #f3f4f6;">
                        <td colspan="5"><strong>BEFORE TAX TOTAL</strong></td>
                        <td class="price"><strong>$${mockSubtotalAfterDiscount.toFixed(2)}</strong></td>
                    </tr>
                    ${mockIsTaxExempt ? `
                    <tr style="background-color: #f0fdf4;">
                        <td colspan="5" style="color: #16a34a;"><strong>TAX STATUS</strong></td>
                        <td class="price" style="color: #16a34a;"><strong>EXEMPT</strong></td>
                    </tr>
                    ` : `
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="5"><strong>FL SALES TAX (6%)</strong></td>
                        <td class="price"><strong>$${mockTaxAmount.toFixed(2)}</strong></td>
                    </tr>
                    `}
                    <tr class="total-row">
                        <td colspan="5"><strong>AFTER TAX TOTAL</strong></td>
                        <td class="price"><strong>$${mockFinalTotal.toFixed(2)}</strong></td>
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
            Mon-Fri: 7:00 AM - 7:00 PM<br>
            Saturday: 8:00 AM - 6:00 PM<br>
            Sunday: 10:00 AM - 4:00 PM</p>
        </div>
    </div>
    
    <div class="footer">
        <p>One Stop Production Rentals - Professional Equipment Rentals in Miami</p>
        <p>This quote is valid for 30 days from the date of issue.</p>
    </div>
</body>
</html>
  `;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Email Preview</h1>
          <p className="text-gray-600">Preview of the quote email that customers receive</p>
        </div>
      </div>

      {/* Email Preview */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden border">
          <div dangerouslySetInnerHTML={{ __html: emailHtmlTemplate }} />
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Preview Information</h3>
          <p className="text-blue-800 text-sm">
            This is a preview of what customers see in their quote email. The actual email includes PDF attachments 
            and may look slightly different in email clients.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteEmailPreviewPage;