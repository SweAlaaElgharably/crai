from djoser.email import ActivationEmail, PasswordResetEmail

class ActivationEmail(ActivationEmail):
    template_name = "emails/activation.html"

class ResetPasswordEmail(PasswordResetEmail):
    template_name = "emails/resetpassword.html"