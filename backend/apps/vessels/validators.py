import re
from django.core.exceptions import ValidationError

class SpecialCharacterValidator:
    def validate(self, password, user=None):
        # This checks for symbols like @, #, $, etc.
        if not re.findall(r'[()[\]{}\!@#\$%\^&\*_\+-=\|\\:;\"\'<>,.?/]', password):
            raise ValidationError(
                "The password must contain at least one special character.",
                code='password_no_special',
            )

    def get_help_text(self):
        return "Your password must contain at least one special character."