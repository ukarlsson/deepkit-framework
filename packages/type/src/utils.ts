/*
 * Deepkit Framework
 * Copyright (C) 2020 Deepkit UG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 *
 * You should have received a copy of the MIT License along with this program.
 */

import {v4} from 'uuid';
import {ClassType} from '@deepkit/core';
import {ClassSchema} from './decorators';
import {TypedArrays} from './models';
import {ExtractPrimaryKeyOrReferenceType} from './types';

export function uuid(): string {
    return v4();
}

export function isArray(v: any): v is Array<any> {
    if (v && (v as any).length && 'function' === typeof (v as any).reduce) return true;
    return false;
}

export type JSONPartialSingle<T> = T extends Date ? string :
    T extends Array<infer K> ? Array<JSONPartialSingle<K>> :
        T extends TypedArrays ? string :
            T extends ArrayBuffer ? string :
                T extends object ? JSONPartial<T> :
                    T extends string ? number | T :
                        T extends boolean ? number | string | T :
                            T extends number ? T | string : T;

export type JSONPartial<T> = { [name in keyof T & string]?: JSONPartialSingle<ExtractPrimaryKeyOrReferenceType<T[name]>> };

export type JSONSingle<T> = T extends Date ? string | Date :
    T extends Array<infer K> ? Array<JSONSingle<K>> :
        T extends TypedArrays ? string :
            T extends ArrayBuffer ? string :
                T extends object ? JSONEntity<T> :
                    T extends string ? T :
                        T extends boolean ? T :
                            T extends number ? T : T;
export type JSONEntity<T> = { [name in keyof T & string]: JSONSingle<ExtractPrimaryKeyOrReferenceType<T[name]>> };

export type AnyEntitySingle<T> =
    T extends Array<infer K> ? Array<AnyEntitySingle<K>> :
        T extends TypedArrays ? any :
            T extends ArrayBuffer ? any :
                T extends object ? AnyEntity<T> :
                    T extends string ? any :
                        T extends boolean ? any :
                            T extends number ? any : any;
export type AnyEntity<T> = { [name in keyof T & string]: AnyEntitySingle<ExtractPrimaryKeyOrReferenceType<T[name]>> };

export type JSONPatch<T> = { [name in keyof T & string]: JSONSingle<T[name]> } | { [name: string]: any };

export type FlattenIfArray<T> = T extends Array<any> ? T[0] : T;

export type ExtractClassType<T, A = never> = T extends ClassType<infer K> ? K :
    T extends ClassSchema<infer K> ? K : A;

export type PlainOrFullEntityFromClassTypeOrSchema<T> = {[name: string]: any} | JSONPartial<ExtractClassType<T>> | ExtractClassType<T>;
