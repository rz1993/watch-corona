from werkzeug.exceptions import HTTPException


class BaseException(HTTPException):
    def __init__(self, message, payload=None):
        self.description = message
        self.payload = payload

class Http400Exception(BaseException):
    code = 400
    description = "Invalid parameters."

class Http422Exception(BaseException):
    code = 422
    description = "Invalid parameter value."
