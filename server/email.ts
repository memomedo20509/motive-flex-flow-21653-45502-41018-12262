// Resend email integration for contact form notifications
import { Resend } from 'resend';

async function getUncachableResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then((data: any) => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  
  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email
  };
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
}

export async function sendContactNotificationEmail(
  adminEmail: string,
  contactData: ContactEmailData
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #d4a855; padding-bottom: 10px;">رسالة جديدة من موقع موتفلكس</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>الاسم:</strong> ${contactData.name}</p>
          <p style="margin: 10px 0;"><strong>البريد الإلكتروني:</strong> ${contactData.email}</p>
          ${contactData.phone ? `<p style="margin: 10px 0;"><strong>الهاتف:</strong> ${contactData.phone}</p>` : ''}
          ${contactData.company ? `<p style="margin: 10px 0;"><strong>الشركة:</strong> ${contactData.company}</p>` : ''}
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">الرسالة:</h3>
          <p style="line-height: 1.6; color: #555;">${contactData.message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
          هذه الرسالة تم إرسالها تلقائياً من نموذج التواصل في موقع موتفلكس
        </p>
      </div>
    `;

    await client.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `رسالة جديدة من ${contactData.name} - موتفلكس`,
      html: htmlContent,
    });

    console.log('Contact notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send contact notification email:', error);
    return false;
  }
}
