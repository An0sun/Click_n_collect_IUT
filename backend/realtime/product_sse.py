from collections import defaultdict
from queue import Queue
import json
from typing import Dict, List

inventory_global_queues: List[Queue] = []

def subscribe_inventory_global() -> Queue :
    queue = Queue()
    inventory_global_queues.append(queue)
    return queue

def unsubscribe_inventory_global(queue : Queue) -> None :
    try :
        inventory_global_queues.remove(queue)
    except ValueError :
        pass

product_queues : Dict[int, list[Queue]] = defaultdict(list)

def subscribe_product(product_id : int) -> Queue :
    queue = Queue()
    product_queues[product_id].append(queue)
    return queue

def unsubscribe_product(product_id : int, queue : Queue) -> None :
    lst = product_queues.get(product_id, [])
    if queue in lst :
        lst.remove(queue)
    if not lst :
        product_queues.pop(product_id, None)

def push_stock_updated(product_id : int, payload : dict) -> None :
    event = {"type" : "stock_updated", "data": payload}

    for queue in list(inventory_global_queues) :
        queue.put(event)

    for queue in list(product_queues.get(product_id, [])) :
        queue.put(event)
