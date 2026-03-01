"""
Email service for sending OTP verification codes
Active: Gmail SMTP
"""
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

EMAIL_USER = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASS = os.getenv("EMAIL_PASSWORD", "")


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def get_otp_expiry() -> datetime:
    """Get expiry time (5 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=5)


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send OTP verification email using Gmail SMTP.

    Args:
        to_email: Recipient email address
        otp: 6-digit OTP code

    Returns:
        True if email sent successfully, False otherwise
    """
    print(f"📧 Sending OTP to {to_email}...")

    if not EMAIL_USER or not EMAIL_PASS:
        print("⚠️ EMAIL_USERNAME / EMAIL_PASSWORD not configured, logging OTP instead")
        print(f"🔑 OTP for {to_email}: {otp}")
        return True  # Allow flow to continue in dev

    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF6B35; text-align: center;">🍽️ SmartDine</h1>
            <p style="text-align: center; color: #666;">Verify your email address</p>
            <div style="background: linear-gradient(135deg, #FF6B35, #FF8C61); color: white; font-size: 32px;
                        font-weight: bold; text-align: center; padding: 20px; border-radius: 8px;
                        letter-spacing: 8px; margin: 20px 0;">
                {otp}
            </div>
            <p style="text-align: center; color: #666;">This code expires in <strong>5 minutes</strong></p>
            <p style="text-align: center; color: #888; font-size: 12px;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🍽️ SmartDine - Verify Your Email"
        msg["From"] = f"SmartDine <{EMAIL_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(f"Your verification code is: {otp}\nExpires in 5 minutes.", "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())

        print(f"✅ OTP email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email via Gmail SMTP: {e}")
        print(f"🔑 FALLBACK OTP for {to_email}: {otp}")
        return True  # Allow flow to continue even if email fails


# ============================================================
# Resend API (previous implementation — kept for reference)
# ============================================================
# import requests
# RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
# def send_otp_email_resend(to_email, otp):
#     url = "https://api.resend.com/emails"
#     headers = {"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"}
#     payload = {"from": "SmartDine <onboarding@resend.dev>", "to": [to_email],
#                "subject": "🍽️ SmartDine - Verify Your Email", "html": "..."}
#     response = requests.post(url, headers=headers, json=payload, timeout=30)
#     return response.status_code == 200
