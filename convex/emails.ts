import { components, internal } from "./_generated/api";
import { Resend, vEmailId, vEmailEvent } from "@convex-dev/resend";
import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";

// Initialize Resend with email event handling
export const resend: Resend = new Resend(components.resend, {
  onEmailEvent: internal.emails.handleEmailEvent,
  testMode: false, // Set to false for production emails
  apiKey: process.env.RESEND_API_KEY!,
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
});

// Handle email events from Resend webhook
export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event received:", args.id, args.event.type);
    
    // You can add custom logic here to handle different email events
    // For example, update user notifications, track email analytics, etc.
    
    if (args.event.type === "email.delivered") {
      console.log(`Email ${args.id} was successfully delivered`);
    } else if (args.event.type === "email.bounced") {
      console.log(`Email ${args.id} bounced:`, args.event.data);
    } else if (args.event.type === "email.complained") {
      console.log(`Email ${args.id} received spam complaint`);
    }
  },
});

// Send content generation completion notification
export const sendContentGenerationNotification = internalAction({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    contentType: v.string(),
    topic: v.string(),
    contentId: v.string(),
  },
  handler: async (ctx, args) => {
    const emailId = await resend.sendEmail(ctx, {
      from: "PolicyFrame <onboarding@resend.dev>",
      to: args.userEmail,
      subject: `✅ Your ${args.contentType} is ready: "${args.topic}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Content Ready!</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin-top: 0;">Hi ${args.userName}!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Your AI-generated content is ready for review. We've applied George Lakoff's cognitive framing principles to create compelling policy advocacy material.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1e40af;">Content Details:</h3>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${args.contentType}</p>
              <p style="margin: 5px 0;"><strong>Topic:</strong> ${args.topic}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ✅ Generated & Ready</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://your-app-url.com/content/${args.contentId}" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Your Content →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>This email was sent by PolicyFrame - AI-Powered Policy Content Generation</p>
            <p>Built with ❤️ for the AI Safety and Effective Altruism communities</p>
          </div>
        </div>
      `,
      text: `
Hi ${args.userName}!

Your AI-generated content is ready for review.

Content Details:
- Type: ${args.contentType}
- Topic: ${args.topic}
- Status: Generated & Ready

View your content: https://your-app-url.com/content/${args.contentId}

This email was sent by PolicyFrame - AI-Powered Policy Content Generation
      `,
    });
    
    console.log(`Content notification email sent: ${emailId}`);
    return emailId;
  },
});

// Send welcome email for new users
export const sendWelcomeEmail = internalAction({
  args: {
    userEmail: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const emailId = await resend.sendEmail(ctx, {
      from: "PolicyFrame <onboarding@resend.dev>",
      to: args.userEmail,
      subject: "🌟 Welcome to PolicyFrame - Transform Your AI Policy Advocacy",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to PolicyFrame!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">AI-Powered Policy Content Generation</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1e40af;">Hi ${args.userName}! 👋</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Welcome to PolicyFrame, where cutting-edge AI meets George Lakoff's proven cognitive framing methodology. 
              You're now equipped to create policy content that builds bridges instead of walls.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">🚀 Get Started in 3 Steps:</h3>
            
            <div style="margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">1</div>
                <span style="color: #475569;">Add your Google Gemini API key in Settings</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">2</div>
                <span style="color: #475569;">Choose your topic and regional context</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px;">3</div>
                <span style="color: #475569;">Generate your first piece of framed content</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">🧠 What Makes PolicyFrame Special:</h3>
            <ul style="color: #475569; line-height: 1.6;">
              <li><strong>Lakoff Cognitive Framing:</strong> Avoid reinforcing opposition narratives</li>
              <li><strong>Multi-Model AI:</strong> Choose from Gemini 2.5 Pro, Flash, or Gemma 3</li>
              <li><strong>Global Context:</strong> Adapt content for USA, Europe, Australia, or Morocco</li>
              <li><strong>Professional Export:</strong> Download as HTML, PDF, or plain text</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://your-app-url.com/dashboard" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin-right: 15px;">
              Start Creating Content →
            </a>
            <a href="https://your-app-url.com/settings" 
               style="background: transparent; color: #3b82f6; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; border: 2px solid #3b82f6;">
              Configure API Key
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p><strong>Need Help?</strong> Check out our documentation or reach out to our community.</p>
            <p>Built with ❤️ for the AI Safety and Effective Altruism communities</p>
          </div>
        </div>
      `,
      text: `
Welcome to PolicyFrame, ${args.userName}!

You're now equipped to create AI policy content using George Lakoff's cognitive framing methodology.

Get Started in 3 Steps:
1. Add your Google Gemini API key in Settings
2. Choose your topic and regional context  
3. Generate your first piece of framed content

What Makes PolicyFrame Special:
- Lakoff Cognitive Framing: Avoid reinforcing opposition narratives
- Multi-Model AI: Choose from Gemini 2.5 Pro, Flash, or Gemma 3
- Global Context: Adapt content for USA, Europe, Australia, or Morocco
- Professional Export: Download as HTML, PDF, or plain text

Start creating: https://your-app-url.com/dashboard
Configure API: https://your-app-url.com/settings

Built with ❤️ for the AI Safety and Effective Altruism communities
      `,
    });
    
    console.log(`Welcome email sent: ${emailId}`);
    return emailId;
  },
});

// Send content sharing email
export const sendContentShare = internalAction({
  args: {
    fromEmail: v.string(),
    fromName: v.string(),
    toEmail: v.string(),
    contentType: v.string(),
    topic: v.string(),
    contentPreview: v.string(),
    contentId: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailId = await resend.sendEmail(ctx, {
      from: "PolicyFrame <onboarding@resend.dev>",
      to: args.toEmail,
      replyTo: [args.fromEmail],
      subject: `📄 ${args.fromName} shared PolicyFrame content: "${args.topic}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📄 Shared Content</h1>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              <strong>${args.fromName}</strong> has shared AI-generated policy content with you, created using PolicyFrame's cognitive framing methodology.
            </p>
            
            ${args.message ? `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="margin: 0; color: #475569; font-style: italic;">"${args.message}"</p>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">Content Details:</h3>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${args.contentType}</p>
            <p style="margin: 5px 0;"><strong>Topic:</strong> ${args.topic}</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <h4 style="margin-top: 0; color: #475569;">Preview:</h4>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">${args.contentPreview.substring(0, 200)}...</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://your-app-url.com/content/${args.contentId}" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Full Content →
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #1e40af; margin-top: 0;">About PolicyFrame:</h4>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
              PolicyFrame combines AI technology with George Lakoff's cognitive framing principles to create more effective policy advocacy content.
            </p>
            <a href="https://your-app-url.com" 
               style="color: #3b82f6; text-decoration: none; font-weight: 600;">
              Try PolicyFrame yourself →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p>This content was shared via PolicyFrame - AI-Powered Policy Content Generation</p>
          </div>
        </div>
      `,
      text: `
${args.fromName} has shared PolicyFrame content with you: "${args.topic}"

${args.message ? `Message: "${args.message}"` : ''}

Content Details:
- Type: ${args.contentType}
- Topic: ${args.topic}

Preview: ${args.contentPreview.substring(0, 200)}...

View full content: https://your-app-url.com/content/${args.contentId}

About PolicyFrame:
PolicyFrame combines AI technology with George Lakoff's cognitive framing principles to create more effective policy advocacy content.

Try PolicyFrame: https://your-app-url.com
      `,
    });
    
    console.log(`Content sharing email sent: ${emailId}`);
    return emailId;
  },
});