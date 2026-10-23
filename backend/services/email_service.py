"""
services/email_service.py – Enterprise-grade email service for PostureTrek.
Supports SMTP authentication, STARTTLS, HTML templates with inline styles,
plain-text fallbacks, and comprehensive logging.
"""

import os
import smtplib
import re
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("posturetrek.email")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def is_valid_email(email: str) -> bool:
    """Validate RFC-compliant email string format."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def mask_email(email: str) -> str:
    """Mask email for privacy in client responses (e.g., a***n@postretrek.io)."""
    if not email or "@" not in email:
        return email or ""
    parts = email.split("@")
    name = parts[0]
    domain = parts[1]
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + ("*" * (len(name) - 2)) + name[-1]
    return f"{masked_name}@{domain}"


def get_smtp_config():
    """Retrieve SMTP configuration from environment variables."""
    pwd = (
        os.getenv("SMTP_PASSWORD")
        or os.getenv("SENDER_PASSWORD")
        or os.getenv("MAIL_PASSWORD")
        or ""
    ).strip().replace(" ", "")

    user = (
        os.getenv("SMTP_USER")
        or os.getenv("SENDER_EMAIL")
        or os.getenv("MAIL_USERNAME")
        or ""
    ).strip()

    host = (
        os.getenv("SMTP_HOST")
        or os.getenv("SMTP_SERVER")
        or os.getenv("MAIL_SERVER")
        or "smtp.gmail.com"
    ).strip()

    port = int(os.getenv("SMTP_PORT") or os.getenv("MAIL_PORT") or 587)

    sender = os.getenv(
        "MAIL_DEFAULT_SENDER",
        user or "PostureTrek Security <admin.auratrek@gmail.com>"
    )

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": pwd,
        "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes"),
        "sender": sender,
    }


def send_otp_email(to_email: str, otp_code: str, user_name: str = "Valued User") -> tuple:
    """
    Send cryptographically generated OTP code to user's email.
    
    Args:
        to_email: Destination recipient email.
        otp_code: 6-digit OTP string.
        user_name: Recipient's display name.
        
    Returns:
        tuple (bool: success, str: status_message)
    """
    to_email = to_email.strip()
    if not is_valid_email(to_email):
        logger.warning(f"[EMAIL] Invalid recipient email address: {to_email}")
        return False, "Invalid recipient email address format."

    config = get_smtp_config()
    subject = f"Your PostureTrek Verification Code: {otp_code}"

    # Plain-text version for email clients that do not render HTML
    text_content = f"""Hello {user_name},

Your PostureTrek one-time verification code is:

    {otp_code}

This code is valid for 10 minutes. For your security, never share this code with anyone.

If you did not request this verification code, please ignore this email or review your account security.

Best regards,
The PostureTrek Security Team
"""

    # High-aesthetic responsive HTML email matching PostureTrek UI design system
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PostureTrek Verification Code</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #020617;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }}
    .wrapper {{
      max-width: 580px;
      margin: 40px auto;
      background: linear-gradient(180deg, #0b1329 0%, #030816 100%);
      border: 1px solid #1e293b;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }}
    .header {{
      padding: 36px 36px 20px 36px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}
    .brand-badge {{
      display: inline-block;
      padding: 8px 18px;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }}
    .header h1 {{
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }}
    .content {{
      padding: 36px;
      text-align: center;
    }}
    .greeting {{
      font-size: 16px;
      color: #94a3b8;
      margin-bottom: 24px;
    }}
    .otp-card {{
      background: rgba(15, 23, 42, 0.85);
      border: 2px dashed #0284c7;
      border-radius: 18px;
      padding: 24px 20px;
      margin: 28px 0;
      text-align: center;
    }}
    .otp-label {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 10px;
    }}
    .otp-number {{
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #38bdf8;
      margin: 6px 0;
      font-family: 'Courier New', Courier, monospace;
    }}
    .otp-expiry {{
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }}
    .security-notice {{
      background: rgba(239, 68, 68, 0.08);
      border-left: 3px solid #ef4444;
      border-radius: 8px;
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 24px;
      line-height: 1.5;
    }}
    .footer {{
      padding: 24px 36px;
      background: #020617;
      text-align: center;
      font-size: 11px;
      color: #475569;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-badge">⚡ PostureTrek Authentication</div>
      <h1>Verification Code</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi <strong>{user_name}</strong>,</p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;">
        Use the one-time code below to verify your identity and access your PostureTrek account.
      </p>
      
      <div class="otp-card">
        <div class="otp-label">One-Time Password</div>
        <div class="otp-number">{otp_code}</div>
        <div class="otp-expiry">⏱ Valid for 10 minutes (single use only)</div>
      </div>

      <div class="security-notice">
        <strong>🔒 Security Reminder:</strong> PostureTrek staff will never ask for your verification code. Never share this code with anyone.
      </div>
    </div>
    <div class="footer">
      This is an automated security email from PostureTrek.<br>
      © 2026 PostureTrek Inc. All rights reserved.
    </div>
  </div>
</body>
</html>"""

    # Assemble MIME multipart message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config["sender"]
    msg["To"] = to_email

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)

    # Check if SMTP credentials are provided
    if not config["user"] or not config["password"]:
        logger.warning(
            f"[EMAIL SERVICE] SMTP_USER or SMTP_PASSWORD not set in environment.\n"
            f"--> Live OTP for {to_email}: [{otp_code}]\n"
            f"--> Set SMTP_USER and SMTP_PASSWORD in backend/.env to deliver live emails."
        )
        return True, "OTP logged (configure SMTP credentials in .env to deliver real emails)"

    try:
        logger.info(f"[EMAIL SERVICE] Connecting to SMTP server {config['host']}:{config['port']}...")
        if config["port"] == 465:
            server = smtplib.SMTP_SSL(config["host"], config["port"], timeout=12)
        else:
            server = smtplib.SMTP(config["host"], config["port"], timeout=12)
            if config["use_tls"]:
                server.starttls()

        server.login(config["user"], config["password"])
        server.send_message(msg)
        server.quit()
        logger.info(f"[EMAIL SERVICE] Successfully delivered OTP email to {to_email}")
        return True, "Verification email sent successfully."
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"[EMAIL SERVICE] SMTP Authentication Failed: {e}")
        return False, "SMTP authentication failed. Please verify email credentials."
    except Exception as e:
        logger.error(f"[EMAIL SERVICE] Failed to send email to {to_email}: {e}")
        return False, f"Failed to send email: {str(e)}"
