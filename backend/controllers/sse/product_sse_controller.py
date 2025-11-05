
from repositories.product_repository import ProductRepository
from flask import Blueprint, Response, request, abort, stream_with_context
from realtime.order_sse import sse_format
from queue import Empty
from realtime.product_sse import subscribe_inventory_global, subscribe_product, unsubscribe_product, unsubscribe_inventory_global

bp_inventory_sse = Blueprint("inventory_sse", __name__, url_prefix="/products/sse")

@bp_inventory_sse.get("")
def sse_inventory_global() :
    queue = subscribe_inventory_global()

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
                    event = queue.get(timeout = 15)
                    last_id += 1
                    yield sse_format(event["type"], event["data"], last_id)
                except Empty :
                    yield ": ping\n\n"
        finally :
            unsubscribe_inventory_global(queue)

    headers = {
        "Content-Type" : "text/event-stream",
        "Cache-Control" : "no-cache",
        "Connection" : "keep-alive",
    }
    return Response(stream_with_context(stream()), headers = headers)

@bp_inventory_sse.get("/<int:product_id>")
def sse_product_stock(product_id: int) :
    if not ProductRepository.get_by_id(product_id) :
        abort(404)

    queue = subscribe_product(product_id)

    last_id_hdr = request.headers.get("Last-Event-ID")
    try:
        last_id = int(last_id_hdr) if last_id_hdr else 0
    except ValueError :
        last_id = 0

    def stream() :
        try :
            prod = ProductRepository.get_by_id(product_id)
            if prod :
                yield sse_format("snapshot", {"product" : {"id" : prod.id, "stock" : prod.stock}}, None)

            nonlocal last_id
            while True :
                try :
                    event = queue.get(timeout = 15)
                    last_id += 1
                    yield sse_format(event["type"], event["data"], last_id)
                except Empty :
                    yield ": ping\n\n"
        finally :
            unsubscribe_product(product_id, queue)

    headers = {
        "Content-Type" : "text/event-stream",
        "Cache-Control" : "no-cache",
        "Connection" : "keep-alive",
    }
    return Response(stream_with_context(stream()), header = headers)
