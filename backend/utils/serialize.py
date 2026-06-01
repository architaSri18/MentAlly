from datetime import datetime

def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    out = dict(doc)
    if '_id' in out:
        out['_id'] = str(out['_id'])
    for key in ('timestamp', 'created_at', 'last_logged'):
        if key in out and isinstance(out[key], datetime):
            out[key] = out[key].isoformat()
    return out
