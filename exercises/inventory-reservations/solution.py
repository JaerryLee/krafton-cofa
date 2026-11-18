"""Starter code for the inventory reservations exercise."""

from typing import Iterable, Literal, Mapping, TypedDict


class OrderItem(TypedDict):
    sku: str
    quantity: int


class Order(TypedDict):
    order_id: str
    items: list[OrderItem]


class ReservationResult(TypedDict):
    order_id: str
    status: Literal["reserved", "insufficient_stock", "duplicate"]


class ReservationReport(TypedDict):
    remaining_stock: dict[str, int]
    results: list[ReservationResult]


def reserve_orders(stock: Mapping[str, int], orders: Iterable[Order]) -> ReservationReport:
    """Reserve stock for each eligible order in the input sequence."""
    raise NotImplementedError("Implement reserve_orders")
