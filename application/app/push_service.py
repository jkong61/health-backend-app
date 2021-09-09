# Imports - Push Notification
from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushTicketError,
    PushServerError,
)
from requests.exceptions import ConnectionError, HTTPError
from requests import Session
import time
from dotenv import load_dotenv
import os
load_dotenv()

# Basic arguments. You should extend this function with the push features you
# want to use, or simply pass in a `PushMessage` object.

def send_push_message(token, title, message, extra=None, sound="default"):
    if not bool(token):
        raise TokenEmptyError("Token cannot be empty.")
    try:
        session = Session()
        session.headers.update({
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate',
            'content-type': 'application/json',
            'Authorization': f"Bearer {os.getenv('PUSH_ACCESS_TOKEN')}"
        })
        response = PushClient(session=session).publish(
            PushMessage(to=token,
                        title=title,
                        body=message,
                        data=extra,
                        sound=sound))
    except PushServerError:
        # Message likely malformed
        raise
    except (ConnectionError, HTTPError):
        # Try to publish message again
        time.sleep(0.5)
        return True

    try:
        response.validate_response()
    except DeviceNotRegisteredError:
        # Likely that message device is unregistered
        # Update the user token to None
        raise
    except PushTicketError:
        # Try to publish message again
        time.sleep(0.5)
        return True

    # Will reach here if no errors are encountered and break while loop in parent
    return False

# Raise error if the token is Falsy


class TokenEmptyError(Exception):
    pass
