import unittest

from solution import build_leaderboard


def match(match_id, winner, loser):
    return {"match_id": match_id, "winner": winner, "loser": loser}


def stats(player_id, games, wins, win_rate_bps):
    return {
        "player_id": player_id,
        "games": games,
        "wins": wins,
        "win_rate_bps": win_rate_bps,
    }


class LeaderboardTests(unittest.TestCase):
    def test_empty_stream(self):
        self.assertEqual(build_leaderboard([]), [])

    def test_includes_players_without_wins(self):
        self.assertEqual(
            build_leaderboard([match("m1", "jiu", "sol"), match("m2", "sol", "min")]),
            [stats("jiu", 1, 1, 10000), stats("sol", 2, 1, 5000), stats("min", 1, 0, 0)],
        )

    def test_ignores_exact_replays_in_an_iterator(self):
        event = match("m1", "jiu", "sol")
        self.assertEqual(
            build_leaderboard(iter([event, dict(event), dict(event)])),
            [stats("jiu", 1, 1, 10000), stats("sol", 1, 0, 0)],
        )

    def test_rejects_conflicting_match(self):
        with self.assertRaises(ValueError):
            build_leaderboard([match("m1", "jiu", "sol"), match("m1", "sol", "jiu")])

    def test_rounds_fractional_rates(self):
        events = [match("m1", "a", "b"), match("m2", "a", "b"), match("m3", "b", "a")]
        self.assertEqual(build_leaderboard(events), [stats("a", 3, 2, 6667), stats("b", 3, 1, 3333)])

    def test_rounds_exact_half_up(self):
        events = [match("m0", "a", "b")]
        events.extend(match(str(number), "b", "a") for number in range(1, 32))
        self.assertEqual(build_leaderboard(events), [stats("b", 32, 31, 9688), stats("a", 32, 1, 313)])

    def test_sorts_tied_rates_by_wins_and_player_id(self):
        events = [match("m1", "z", "x"), match("m2", "z", "y"), match("m3", "b", "x"), match("m4", "a", "x")]
        self.assertEqual(
            build_leaderboard(events),
            [
                stats("z", 2, 2, 10000),
                stats("a", 1, 1, 10000),
                stats("b", 1, 1, 10000),
                stats("x", 3, 0, 0),
                stats("y", 1, 0, 0),
            ],
        )

    def test_ids_are_case_sensitive(self):
        self.assertEqual(
            build_leaderboard([match("M", "A", "a"), match("m", "a", "A")]),
            [stats("A", 2, 1, 5000), stats("a", 2, 1, 5000)],
        )


if __name__ == "__main__":
    unittest.main()
