from collections import defaultdict
from queue import Queue
from typing import Dict, List, Optional
import json

order_queues : Dict[int, List[Queue]] = defaultdict(list)

def sse_format(event_type : Optional[str], data : dict, id : Optional[int] = None) -> str :
    chunks = []
    if id is not None :
        chunks.append(f"id:{id}")
    if event_type :
        chunks.append(f"event:{event_type}")
    chunks.append("data:" + json.dumps(data, separators = (",", ":")))
    return "\n".join(chunks) + "\n\n"



def subscribe_order(order_id : int) -> Queue :
    queue = Queue()
    order_queues[order_id].append(queue)
    return queue

def unsubscribe_order(order_id : int, queue : Queue) -> None :
    lst = order_queues.get(order_id)
    if not lst :
        return
    try :
        lst.remove(queue)
    except ValueError :
        pass
    if not lst :
        order_queues.pop(order_id, None)

def push_order_event(order_id : int, event_type : str, data : dict) -> None :
    for queue in list(order_queues.get(order_id, [])) :
        queue.put({"type": event_type, "data": data})


orders_global_queues : List[Queue] = []

def subscribe_orders_global() -> Queue :
    queue = Queue()
    orders_global_queues.append(queue)
    return queue

def unsubscribe_orders_global(queue: Queue) -> None :
    try :
        orders_global_queues.remove(queue)
    except ValueError :
        pass

def push_order_created(order_payload : dict) -> None :
    event = {"type" : "order_created", "data" : order_payload}
    for queue in list(orders_global_queues) :
        queue.put(event)
