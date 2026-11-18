"""Starter code for the match leaderboard exercise."""

from typing import Iterable, TypedDict


class MatchEvent(TypedDict):
    match_id: str
    winner: str
    loser: str


class PlayerStats(TypedDict):
    player_id: str
    games: int
    wins: int
    win_rate_bps: int


def build_leaderboard(events: Iterable[MatchEvent]) -> list[PlayerStats]:
    """Build a sorted leaderboard from a stream of match results."""
    raise NotImplementedError("Implement build_leaderboard")
