import { Router as _Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { Observable, Observer } from 'rxjs';

import { Router } from './router';
import { Packet } from './types';


function _isExpressRouter(handler: _Router | RequestHandler): handler is _Router {
  return (handler as any).handle && (typeof (handler as any).handle === 'function');
}


function _handler(og: Router | _Router | RequestHandler): RequestHandler {
  if (og instanceof Router) return _handler(og.core);
  if (_isExpressRouter(og)) 
    return (req: Request, res: Response, next: NextFunction) => (og as any).handle(req, res, next);
  return og;
}


export function use(handler: Router | _Router | RequestHandler) {
  const _handle = _handler(handler);
  return (source: Observable<Packet>) => {
    return new Observable<Packet>(observer => {
      source.subscribe(
        packet => _handle(packet.req, packet.res, (err: any) => observer.next(packet)),
        error => observer.error(error),
        () => observer.complete(),
      );
    });
  }
}