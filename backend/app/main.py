import asyncio
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from hardstucks_debating.formats.british_parliamentary_ga import (
    BritishParliamentaryGroupAware,
)
from hardstucks_debating.formats.traditional_ga import (
    TraditionalGroupAware,
)

# Load environment variables
load_dotenv()

app = FastAPI()

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Participant(BaseModel):
    name: str
    preferences: List[int]
    group: Optional[List[str]] = []


class DebateRequest(BaseModel):
    participants: List[Participant]


class Assignment(BaseModel):
    name: str
    role: str
    preference: int
    group: str


class Room(BaseModel):
    name: str
    assignments: List[Assignment]


class DebateResponse(BaseModel):
    rooms: List[Room]
    total_preference: int
    average_preference: float


def convert_rooms_to_response(rooms, num_participants: int) -> DebateResponse:
    """
    Convert algorithm output rooms to API response format.

    Args:
        rooms: List of Room namedtuples from the algorithm
        num_participants: Total number of participants

    Returns:
        DebateResponse with formatted rooms and statistics
    """
    total_pref = 0
    response_rooms = []

    for room in rooms:
        assignments = []
        for assignment in room.assignments:
            assignments.append(
                Assignment(
                    name=assignment[0],
                    role=assignment[1],
                    preference=assignment[2],
                    group=assignment[3],
                )
            )
            total_pref += assignment[2]

        response_rooms.append(Room(name=room.name, assignments=assignments))

    avg_pref = round(total_pref / num_participants, 3) if num_participants else 0

    return DebateResponse(
        rooms=response_rooms,
        total_preference=total_pref,
        average_preference=avg_pref,
    )


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}


@app.post("/bp", response_model=DebateResponse)
async def run_bp_group_aware(request: DebateRequest):
    """
    Run British Parliamentary Group Aware algorithm.

    Expects JSON with participants array:
    {
        "participants": [
            {
                "name": "John Doe",
                "preferences": [1, 2, 3, 4, 5, 6, 7, 8],
                "group": ["GroupA"] // optional
            }
        ]
    }

    Returns: JSON with room assignments and statistics
    """
    try:
        # Convert Pydantic models to dict format expected by algorithm
        person_data = [
            {
                "name": p.name,
                "preferences": p.preferences,
                "group": p.group if p.group else [],
            }
            for p in request.participants
        ]

        # Run algorithm with timeout (60 seconds)
        def run_algorithm():
            strategy = BritishParliamentaryGroupAware()
            G = strategy.build_graph(person_data)
            resG = G.cycleCancel(0, len(G.graph) - 1)
            return strategy.generate_rooms(resG, len(person_data), person_data)

        loop = asyncio.get_event_loop()
        rooms = await asyncio.wait_for(
            loop.run_in_executor(None, run_algorithm), timeout=60.0
        )

        # Convert rooms to response format
        return convert_rooms_to_response(rooms, len(person_data))

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504, detail="Algorithm execution timed out after 60 seconds"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing request: {str(e)}"
        )


@app.post("/traditional", response_model=DebateResponse)
async def run_traditional_group_aware(request: DebateRequest):
    """
    Run Traditional Group Aware algorithm.

    Expects JSON with participants array:
    {
        "participants": [
            {
                "name": "John Doe",
                "preferences": [1, 2, 3, 4, 5, 6],
                "group": ["GroupA"] // optional
            }
        ]
    }

    Returns: JSON with room assignments and statistics
    """
    try:
        # Convert Pydantic models to dict format expected by algorithm
        person_data = [
            {
                "name": p.name,
                "preferences": p.preferences,
                "group": p.group if p.group else [],
            }
            for p in request.participants
        ]

        # Run algorithm with timeout (60 seconds)
        def run_algorithm():
            strategy = TraditionalGroupAware()
            G = strategy.build_graph(person_data)
            resG = G.cycleCancel(0, len(G.graph) - 1)
            return strategy.generate_rooms(resG, len(person_data), person_data)

        loop = asyncio.get_event_loop()
        rooms = await asyncio.wait_for(
            loop.run_in_executor(None, run_algorithm), timeout=60.0
        )

        # Convert rooms to response format
        return convert_rooms_to_response(rooms, len(person_data))

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504, detail="Algorithm execution timed out after 60 seconds"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing request: {str(e)}"
        )
