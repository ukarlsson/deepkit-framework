/*
 * Deepkit Framework
 * Copyright (C) 2020 Deepkit UG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Router} from './router';
import {ClassType, CustomError, getClassName} from '@deepkit/core';
import {injectable, Injector} from './injector/injector';
import {IncomingMessage, ServerResponse} from 'http';
import {Socket} from 'net';
import {Context, ServiceContainer} from './service-container';
import {Provider} from './injector/provider';
import {getClassTypeFromInstance, isClassInstance, isRegisteredEntity, jsonSerializer} from '@deepkit/type';
import {isElementStruct, render} from './template/template';
import {ApplicationConfig} from './application-config';
import {join} from 'path';
import {pathExists, stat} from 'fs-extra';
import {createReadStream} from 'fs';

const mime = require('mime-types');

export interface HttpError<T> {
    new(...args: any[]): Error;

    getHttpCode(): T;
}

export function HttpError<T extends number>(code: T, defaultMessage: string = ''): HttpError<T> {
    return class extends CustomError {
        constructor(message: string = defaultMessage) {
            super(message);
        }

        static getHttpCode() {
            return code;
        }
    };
}

export class HttpNotFoundError extends HttpError(404, 'Not found') {
}

export class HttpBadRequestError extends HttpError(400, 'Bad request') {
}

@injectable()
export class HttpHandler {
    constructor(
        protected router: Router,
        protected config: ApplicationConfig,
    ) {
    }

    async handleRequestFor(method: string, url: string): Promise<any> {
        const req = new IncomingMessage(new Socket());
        req.method = method;
        req.url = url;
        const res = new ServerResponse(req);
        const resolved = this.router.resolve(req.method || 'GET', req.url || '/');
        if (!resolved) throw new Error('Route not found');

        const injector = this.createInjector(resolved.controller, [
            {provide: IncomingMessage, useValue: req},
            {provide: ServerResponse, useValue: res},
        ]);
        injector.allowUnknown = true;

        const controllerInstance = injector.get(resolved.controller);
        return await controllerInstance[resolved.method](...resolved.parameters);
    }

    createInjector(classType: ClassType, providers: Provider[] = []) {
        const context = (classType as any)[ServiceContainer.contextSymbol] as Context;
        if (!context) {
            throw new Error(`Controller ${getClassName(classType)} has no injector context assigned.`);
        }

        return new Injector(providers, [context.getInjector(), context.getRequestInjector().fork()]);
    }

    async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        // //- resolve controller
        const resolved = this.router.resolve(req.method || 'GET', req.url || '/');
        if (!resolved) {
            //check if file exists in public
            if (req.url) {
                const path = join(this.config.publicDir, join('/', req.url || ''));
                if (await pathExists(path)) {
                    const info = await stat(path);
                    const mimeType = mime.lookup(path);

                    const header: { [name: string]: string } = {
                        'Content-Type': mimeType || 'application/octet-stream',
                        'Content-Length': info.size.toString(),
                    };

                    res.writeHead(200, header);
                    createReadStream(path).pipe(res);
                    return;
                }
            }


            res.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end('Not found');
            return;
        }

        const injector = this.createInjector(resolved.controller, [
            {provide: IncomingMessage, useValue: req},
            {provide: ServerResponse, useValue: res},
        ]);
        injector.allowUnknown = true;

        //- call PRE_REQUEST listener

        //- call controller
        const controllerInstance = injector.get(resolved.controller);
        const response = await controllerInstance[resolved.method](...resolved.parameters);

        //- call POST_REQUEST listener

        if (response === null || response === undefined) {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end();
            return;
        }
        if (response instanceof ServerResponse) return;

        if ('string' === typeof response) {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(response);
        } else if (isElementStruct(response)) {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(await render(injector, response));
        } else if (isClassInstance(response) && isRegisteredEntity(getClassTypeFromInstance(response))) {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(jsonSerializer.for(getClassTypeFromInstance(response)).serialize(response));
        }

        //- call RESPONSE listener
    }
}
