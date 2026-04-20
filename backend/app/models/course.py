"""Placeholder for Course/Lab models (Month 2)."""

from pydantic import BaseModel
from typing import List, Optional


class Lab(BaseModel):
    id: str
    title: str
    algorithm: str


class Course(BaseModel):
    id: str
    title: str
    labs: List[Lab] = []
