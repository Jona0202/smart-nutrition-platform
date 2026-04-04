from slowapi import Limiter
from slowapi.util import get_remote_address

# Global limiter instance to be imported across the app
limiter = Limiter(key_func=get_remote_address)
