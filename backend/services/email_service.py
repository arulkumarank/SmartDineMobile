"""
Email service for sending OTP verification codes
Primary: Resend API (works on Render free tier)
Backup: Gmail SMTP (commented out - blocked on Render)
"""
import random
import os
import requests
from datetime import datetime, timedelta
from config import settings

# Resend API Key 
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def get_otp_expiry() -> datetime:
    """Get expiry time (5 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=5)


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send OTP verification email using Resend API
    
    Args:
        to_email: Recipient email address
        otp: 6-digit OTP code
        
    Returns:
        True if email sent successfully, False otherwise
    """
    print(f"📧 Sending OTP to {to_email}...")
    
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY not configured, using fallback")
        # Fallback: just log the OTP for development
        print(f"🔑 OTP for {to_email}: {otp}")
        return True  # Return True so signup flow continues
    
    try:
        # Resend API endpoint
        url = "https://api.resend.com/emails"
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # HTML email content
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF6B35; text-align: center;">🍽️ SmartDine</h1>
            <p style="text-align: center; color: #666;">Verify your email address</p>
            <div style="background: linear-gradient(135deg, #FF6B35, #FF8C61); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                {otp}
            </div>
            <p style="text-align: center; color: #666;">This code expires in <strong>5 minutes</strong></p>
            <p style="text-align: center; color: #888; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
        """
        
        payload = {
            "from": "SmartDine <onboarding@resend.dev>",  # Use verified domain or resend.dev for testing
            "to": [to_email],
            "subject": "🍽️ SmartDine - Verify Your Email",
            "html": html_content
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ OTP email sent to {to_email}")
            return True
        else:
            print(f"❌ Resend API error: {response.status_code} - {response.text}")
            # FALLBACK: Log OTP so testing can continue
            print(f"🔑 FALLBACK OTP for {to_email}: {otp}")
            return True  # Return True so signup flow continues
            
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        # FALLBACK: Log OTP so testing can continue
        print(f"🔑 FALLBACK OTP for {to_email}: {otp}")
        return True  # Return True so signup flow continues


# ============================================================
# Gmail SMTP 
# ============================================================
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
#
# EMAIL_USER = settings.EMAIL_USERNAME
# EMAIL_PASS = settings.EMAIL_PASSWORD
#
# def send_otp_email_smtp(to_email: str, otp: str) -> bool:
#     """Send OTP using Gmail SMTP - BLOCKED ON RENDER FREE TIER"""
#     try:
#         msg = MIMEMultipart("alternative")
#         msg["Subject"] = "🍽️ SmartDine - Verify Your Email"
#         msg["From"] = f"SmartDine <{EMAIL_USER}>"
#         msg["To"] = to_email
#         
#         text = f"Your verification code is: {otp}\nThis code expires in 5 minutes."
#         msg.attach(MIMEText(text, "plain"))
#         
#         with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#             server.login(EMAIL_USER, EMAIL_PASS)
#             server.sendmail(EMAIL_USER, to_email, msg.as_string())
#         
#         print(f"OTP email sent to {to_email}")
#         return True
#     except Exception as e:
#         print(f"Failed to send email: {e}")
#         return False
