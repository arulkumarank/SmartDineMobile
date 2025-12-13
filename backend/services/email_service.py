"""
Email service for sending OTP verification codes via Gmail SMTP
"""
import smtplib
import random
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def get_otp_expiry() -> datetime:
    """Get expiry time (5 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=5)


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send OTP verification email using Gmail SMTP
    
    Args:
        to_email: Recipient email address
        otp: 6-digit OTP code
        
    Returns:
        True if email sent successfully, False otherwise
    """
    print(f"DEBUG: EMAIL_USER = '{EMAIL_USER}'")
    print(f"DEBUG: EMAIL_PASS = '{EMAIL_PASS[:4] if EMAIL_PASS else 'None'}...' (length: {len(EMAIL_PASS) if EMAIL_PASS else 0})")
    
    if not EMAIL_USER or not EMAIL_PASS:
        print("ERROR: Email credentials not configured in .env file")
        print("Required: EMAIL_USER and EMAIL_PASS")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🍽️ SmartDine - Verify Your Email"
        msg["From"] = f"SmartDine <{EMAIL_USER}>"
        msg["To"] = to_email
        
        # Plain text version
        text = f"""
SmartDine Email Verification

Your verification code is: {otp}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

- SmartDine Team
"""
        
        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .otp-box {{ background: linear-gradient(135deg, #FF6B35, #FF8C61); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ SmartDine</h1>
            <p>Verify your email address</p>
        </div>
        <div class="otp-box">{otp}</div>
        <p style="text-align: center; color: #666;">This code expires in <strong>5 minutes</strong></p>
        <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
"""
        
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        # Send email via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        
        print(f"OTP email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
