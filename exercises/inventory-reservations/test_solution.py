import unittest
from copy import deepcopy
from types import MappingProxyType

from solution import reserve_orders


def order(order_id, *items):
    return {
        "order_id": order_id,
        "items": [{"sku": sku, "quantity": quantity} for sku, quantity in items],
    }


def report(stock, *results):
    return {
        "remaining_stock": stock,
        "results": [{"order_id": order_id, "status": status} for order_id, status in results],
    }


class ReservationTests(unittest.TestCase):
    def test_empty_orders(self):
        self.assertEqual(reserve_orders({"board": 3, "case": 0}, []), report({"board": 3, "case": 0}))

    def test_reserves_in_order_and_keeps_zero_quantity(self):
        orders = iter([order("A", ("board", 2)), order("B", ("board", 2)), order("C", ("board", 1))])
        self.assertEqual(
            reserve_orders({"board": 3}, orders),
            report({"board": 0}, ("A", "reserved"), ("B", "insufficient_stock"), ("C", "reserved")),
        )

    def test_rejects_entire_order_when_one_sku_is_short(self):
        orders = [order("A", ("board", 2), ("case", 2)), order("B", ("board", 3))]
        self.assertEqual(
            reserve_orders({"board": 3, "case": 1}, orders),
            report({"board": 0, "case": 1}, ("A", "insufficient_stock"), ("B", "reserved")),
        )

    def test_rejects_unknown_sku_without_consuming_known_stock(self):
        orders = [order("A", ("board", 1), ("missing", 1))]
        self.assertEqual(reserve_orders({"board": 2}, orders), report({"board": 2}, ("A", "insufficient_stock")))

    def test_aggregates_repeated_skus(self):
        orders = [order("A", ("board", 2), ("board", 2)), order("B", ("board", 1), ("board", 2))]
        self.assertEqual(
            reserve_orders({"board": 3}, orders),
            report({"board": 0}, ("A", "insufficient_stock"), ("B", "reserved")),
        )

    def test_replay_of_reserved_order_ignores_changed_payload(self):
        orders = [order("A", ("board", 1)), order("A", ("case", 1))]
        self.assertEqual(
            reserve_orders({"board": 2, "case": 1}, orders),
            report({"board": 1, "case": 1}, ("A", "reserved"), ("A", "duplicate")),
        )

    def test_replay_of_rejected_order_is_duplicate(self):
        orders = [order("A", ("board", 3)), order("A", ("board", 1))]
        self.assertEqual(
            reserve_orders({"board": 2}, orders),
            report({"board": 2}, ("A", "insufficient_stock"), ("A", "duplicate")),
        )

    def test_does_not_mutate_input(self):
        stock = MappingProxyType({"board": 2, "case": 1})
        orders = [order("A", ("board", 1), ("board", 1), ("case", 1))]
        original_orders = deepcopy(orders)
        self.assertEqual(
            reserve_orders(stock, orders),
            report({"board": 0, "case": 0}, ("A", "reserved")),
        )
        self.assertEqual(stock, {"board": 2, "case": 1})
        self.assertEqual(orders, original_orders)


if __name__ == "__main__":
    unittest.main()
