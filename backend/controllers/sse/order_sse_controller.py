from flask import Blueprint, Response, request, abort, stream_with_context
from realtime.order_sse import subscribe_order, unsubscribe_order, sse_format
from repositories.order_repository import OrderRepository
from mappers.order_mapper import order_to_dto
from queue import Empty
from realtime.order_sse import (
    sse_format,
    subscribe_order,
    unsubscribe_order,
    subscribe_orders_global,
    unsubscribe_orders_global,
)

bp_order_sse = Blueprint("order_sse", __name__, url_prefix = "/orders/sse")

@bp_order_sse.get("/<int:order_id>")
def sse_order(order_id : int) :
    order = OrderRepository.find_by_id(order_id)
    if not order :
        abort(404)

    snap = order_to_dto(order).model_dump(mode = "json")

    q = subscribe_order(order_id)

    def stream() :
        try :
            yield sse_format("snapshot", {"order" : snap}, None)

            last_id = 0
            while True :
                try :
                    ev = q.get(timeout=15)
                    last_id += 1
                    yield sse_format(ev["type"], ev["data"], last_id)
                except Empty :
                    yield ": ping\n\n"
        finally :
            unsubscribe_order(order_id, q)

    headers = {
        "Content-Type" : "text/event-stream",
        "Cache-Control" : "no-cache",
        "Connection" : "keep-alive",
    }
    return Response(stream_with_context(stream()), headers = headers)


@bp_order_sse.get("")
def sse_orders_global() :
    queue = subscribe_orders_global()

    last_id_hdr = request.headers.get("Last-Event-ID")
    try :
        last_id = int(last_id_hdr) if last_id_hdr else 0
    except ValueError :
        last_id = 0

    def stream() :
        nonlocal last_id
        try :
            while True :
                try :
                    ev = queue.get(timeout = 15)
                    last_id += 1
                    yield sse_format(ev["type"], ev["data"], last_id)
                except Empty :
                    yield ": ping\n\n"
        finally :
            unsubscribe_orders_global(queue)

    headers = {
        "Content-Type" : "text/event-stream",
        "Cache-Control" : "no-cache",
        "Connection" : "keep-alive",
    }
    return Response(stream_with_context(stream()), headers = headers)
