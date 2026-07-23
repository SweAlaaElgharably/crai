import ssl
from django.conf import settings
from django.core.mail.backends.smtp import EmailBackend
from django.utils.functional import cached_property

class UnverifiedEmailBackend(EmailBackend):
    @cached_property
    def ssl_context(self):
        # Bypass SSL verification if EMAIL_BYPASS_SSL_VERIFICATION is True,
        # defaulting to the value of DEBUG (i.e. True in development).
        bypass_verification = getattr(settings, 'EMAIL_BYPASS_SSL_VERIFICATION', settings.DEBUG)
        
        if bypass_verification:
            if self.ssl_certfile or self.ssl_keyfile:
                ssl_context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
                ssl_context.load_cert_chain(self.ssl_certfile, self.ssl_keyfile)
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                return ssl_context
            else:
                return ssl._create_unverified_context()
        
        # Default behavior:
        if self.ssl_certfile or self.ssl_keyfile:
            ssl_context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
            ssl_context.load_cert_chain(self.ssl_certfile, self.ssl_keyfile)
            return ssl_context
        else:
            return ssl.create_default_context()
