from pydantic import BaseModel,Field

class UserRegister(BaseModel):
    username:str = Field(min_length=3, max_length=30)
    password:str = Field(min_length=8, max_length=72)

class UserOut(BaseModel):
    id : int
    username:str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ActionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=200)

class ActionOut(BaseModel):
    id: int
    text: str
    owner_id: int

class MessageResponse(BaseModel):
    message: str