"""Placeholder for User model (Month 2 — Supabase/PostgreSQL)."""

from pydantic import BaseModel, EmailStr
from typing import Optional


class User(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "student"
