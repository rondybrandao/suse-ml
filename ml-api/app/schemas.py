from pydantic import BaseModel


class ChurnRequest(BaseModel):

    cliente_id: str