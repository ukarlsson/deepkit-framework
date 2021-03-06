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

import {ClassType} from '@deepkit/core';
import {injectable} from '../injector/injector';

// import {Exchange} from "./exchange";
// import {getEntityName} from "@deepkit/type";
// import {Observable, Subject, Subscription} from "rxjs";
// import {convertPlainQueryToMongo, convertQueryToMongo, Database, DatabaseQuery} from "@deepkit/mongo";
// import {
//     Collection,
//     CollectionSort,
//     ConnectionWriter,
//     EntitySubject,
//     ExchangeEntity,
//     FilterParameters,
//     FilterQuery,
//     IdInterface,
//     JSONObjectCollection,
//     ReactiveSubQuery
// } from "@deepkit/framework-shared";
// import {ClassType, each, eachKey, eachPair, getClassName, sleep} from "@deepkit/core";
// import {AsyncSubscription, Subscriptions} from "@deepkit/core-rxjs";
// import {findQuerySatisfied} from "./utils";
//
// interface SentState {
//     lastSentVersion?: number;
//     listeners: number;
// }
//
// export class FindOptions<T extends IdInterface> {
//     public _filter: ReactiveQuery<T>;
//     public _filterParameters: FilterParameters = {};
//
//     public _fields: (keyof T | string)[] = [];
//     public _pagination: boolean = false;
//     public _page: number = 1;
//     public _itemsPerPage: number = 50;
//     public _sorts: CollectionSort[] = [];
//
//     public _disableEntityChangeFeed = false;
//
//     constructor(
//         public readonly classType: ClassType<T>,
//         public readonly entityStorage: EntityStorage,
//     ) {
//         this._filter = ReactiveQuery.create(classType, {});
//     }
//
//     /**
//      * Filters the collection to a fix mongo query compatible filter.
//      */
//     public filter(filter: FilterQuery<T> | ReactiveQuery<T> = {}): FindOptions<T> {
//         this._filter = ReactiveQuery.create(this.classType, filter);
//         return this;
//     }
//
//     public isChangeFeedActive(): boolean {
//         return !this._disableEntityChangeFeed;
//     }
//
//     public isPartial(): boolean {
//         return this._fields.length > 0;
//     }
//
//     /**
//      * Disable automatic syncing of entity changes to the client.
//      */
//     public disableEntityChangeFeed(): FindOptions<T> {
//         this._disableEntityChangeFeed = true;
//         return this;
//     }
//
//     public parameter(name: string, value?: any): FindOptions<T> {
//         this._filterParameters[name] = value;
//         //why does setting a parameter enable pagination?
//         this._pagination = true;
//         return this;
//     }
//
//     public parameters(values: FilterParameters = {}): FindOptions<T> {
//         this._filterParameters = values;
//         //why does setting a parameter enable pagination?
//         this._pagination = true;
//         return this;
//     }
//
//     public hasSort() {
//         return this._sorts && this._sorts.length > 0;
//     }
//
//     /**
//      * Limits the returned entity to given fields.
//      */
//     public fields(fields: (keyof T | string)[]): FindOptions<T> {
//         this._fields = fields;
//         return this;
//     }
//
//     public enablePagination(): FindOptions<T> {
//         this._pagination = true;
//         return this;
//     }
//
//     public isPaginationEnabled(): boolean {
//         return this._pagination;
//     }
//
//     public page(page: number): FindOptions<T> {
//         this._page = page;
//         this._pagination = true;
//         return this;
//     }
//
//     public itemsPerPage(items: number): FindOptions<T> {
//         this._itemsPerPage = items;
//         this._pagination = true;
//         return this;
//     }
//
//     public orderBy(field: keyof T | string, direction: 'asc' | 'desc' = 'asc'): FindOptions<T> {
//         this._sorts.push({field: field as string, direction: direction});
//         this._pagination = true;
//         return this;
//     }
//
//     public find(): Promise<Collection<T>> {
//         return this.entityStorage.find(this);
//     }
// }
//
// export class ReactiveQuery<T> {
//     public providers: { name: string, classType: ClassType, filter: ReactiveQuery<any>, field: string }[] = [];
//     public providerCollections: { [name: string]: Collection<any> } = {};
//     public providersSet = new Set<string>();
//     public parameters: { [name: string]: any } = {};
//     public didSetup = false;
//     public fieldNames: string[] = [];
//     public lastUsedParameterValues: FilterParameters = {};
//
//     public readonly internalParameterChange = new Subject<any>();
//
//     protected subs = new Subscriptions();
//
//     constructor(
//         public classType: ClassType<T>,
//         public query: FilterQuery<T>
//     ) {
//         //read $sub
//         this.query = convertQueryToMongo(this.classType, this.query, (convertClassType, path, value) => {
//             return value;
//         }, {}, {
//             '$sub': (name, value: any) => {
//                 if (value instanceof ReactiveSubQuery) {
//                     const reactiveName = name + '_' + value.field;
//                     //we need to link parameters here
//                     this.provide(reactiveName, value.classType, value.query, value.field);
//                     return {'$parameter': reactiveName};
//                 }
//
//                 throw new Error('$sub needs to be ReactiveSubQuery.');
//             }
//         });
//     }
//
//     static create<U>(classType: ClassType<U>, query: FilterQuery<U> | ReactiveQuery<U>): ReactiveQuery<U> {
//         if (query instanceof ReactiveQuery) {
//             return query;
//         }
//
//         return new ReactiveQuery(classType, query);
//     }
//
//     public provide<T extends IdInterface, K extends keyof T & string>(name: string, classType: ClassType<T>, filter: any, field?: K | 'id') {
//         if (this.didSetup) {
//             throw new Error('Can not add provider while already activated.');
//         }
//
//         if (!field) field = 'id';
//
//         if (this.providersSet.has(name)) {
//             throw new Error(`Provider with name ${name} already exists.`);
//         }
//
//         this.providersSet.add(name);
//         this.providers.push({
//             name: name,
//             classType: classType,
//             filter: filter,
//             field: field,
//         });
//
//         return this;
//     }
//
//     /**
//      * Triggered when internal parameters changed (like join values)
//      */
//     public _changeParameter(name: string, value: any) {
//         //rebuild filter and re-query, to see what changed.
//         this.parameters[name] = value;
//
//         if (this.didSetup) {
//             //throttle?
//             this.internalParameterChange.next();
//         }
//     }
//
//     public unsubscribe() {
//         this.subs.unsubscribe();
//         for (const collection of each(this.providerCollections)) {
//             collection.unsubscribe();
//         }
//
//         this.internalParameterChange.unsubscribe();
//     }
//
//     public async setAndApplyParameters(parameters: FilterParameters) {
//         this.parameters = parameters;
//
//         //trigger deep
//         for (const collection of each(this.providerCollections)) {
//             collection.pagination.setParameters(this.parameters);
//             await collection.pagination.apply();
//         }
//     }
//
//     public async setupProviders(storage: EntityStorage) {
//         for (const provider of this.providers) {
//
//             const filter = ReactiveQuery.create(provider.classType, provider.filter);
//
//             const jsonCollection = await storage
//                 .collection(provider.classType)
//                 .filter(filter)
//                 .parameters(this.parameters)
//                 .fields([provider.field])
//                 .disableEntityChangeFeed()
//                 .find();
//
//             if (this.providerCollections[provider.name]) {
//                 throw new Error(`Provider for name ${provider.name} already exists.`);
//             }
//
//             this.providerCollections[provider.name] = jsonCollection;
//
//             // const result = await storage.find(provider.classType, provider.filter, {fields: [provider.field], disableEntityChangeFeed: true});
//             this.subs.add = jsonCollection.subscribe((v: any) => {
//                 // console.log('change', provider.name, provider.field, v.map((i: any) => i[provider.field]));
//
//                 //WARNING: usually `filter` is class parameters based, but we pass here json parameters (since find()
//                 // return json parameters). we should probably convert that here
//                 this._changeParameter(provider.name, {$in: v.map((i: any) => i[provider.field])});
//             });
//         }
//
//         this.didSetup = true;
//     }
//
//     public haveParametersChanged(): boolean {
//         for (const [i, v] of eachPair(this.lastUsedParameterValues)) {
//             //poor man's comparison check
//             if (JSON.stringify(this.parameters[i]) !== JSON.stringify(v)) {
//                 return true;
//             }
//         }
//
//         return false;
//     }
//
//     public getClassQuery(): { query: any, fieldNames: string[] } {
//         const fieldNames = {};
//         const query = convertQueryToMongo(this.classType, this.query, (convertClassType: ClassType, path: string, value: any) => {
//             return value;
//         }, fieldNames, {
//             '$parameter': (name, value) => {
//                 this.lastUsedParameterValues[value] = this.parameters[value];
//                 return this.parameters[value];
//             }
//         });
//
//         this.fieldNames = Object.keys(fieldNames);
//
//         return {
//             query: query,
//             fieldNames: Object.keys(fieldNames)
//         };
//     }
// }
//
// /**
//  * This is instantiated per connection.
//  */
@injectable()
export class EntityStorage {
//     protected sentEntities = new Map<ClassType, { [id: string]: SentState }>();
//
//     protected entitySubscription = new Map<ClassType, Subscription>();
//     protected entitySubscribed = new Set<ClassType>();
//
//     constructor(
//         protected readonly writer: ConnectionWriter,
//         protected readonly exchange: Exchange,
//         protected readonly database: Database,
//     ) {
//     }
//
    public destroy() {
//         for (const sub of this.entitySubscription.values()) {
//             sub.unsubscribe();
//         }
//         this.entitySubscribed.clear();
    }
//
//     public getSentStateStore<T>(classType: ClassType<T>): { [id: string]: SentState } {
//         let store = this.sentEntities.get(classType);
//         if (!store) {
//             store = {};
//             this.sentEntities.set(classType, store);
//         }
//
//         return store;
//     }
//
//     protected hasSentState<T>(classType: ClassType<T>, id: string): boolean {
//         return !!this.getSentStateStore(classType)[id];
//     }
//
//     /**
//      * Necessary when the whole state of `id` should be deleted from memory, so it wont sync to client anymore.
//      */
//     protected rmSentState<T>(classType: ClassType<T>, id: string) {
//         const store = this.getSentStateStore(classType);
//
//         delete store[id];
//
//         if (Object.keys(store).length === 0) {
//             const entitySubscription = this.entitySubscription.get(classType);
//             if (entitySubscription) {
//                 entitySubscription.unsubscribe();
//                 this.entitySubscription.delete(classType);
//                 this.entitySubscribed.delete(classType);
//             }
//         }
//     }
//
//     protected getSentState<T>(classType: ClassType<T>, id: string): SentState {
//         const store = this.getSentStateStore(classType);
//
//         if (!store[id]) {
//             store[id] = {
//                 lastSentVersion: 0,
//                 listeners: 0,
//             };
//         }
//
//         return store[id];
//     }
//
//     protected setSent<T>(classType: ClassType<T>, id: string, version?: number) {
//         this.getSentState(classType, id).lastSentVersion = version;
//     }
//
//     public needsToBeSend<T>(classType: ClassType<T>, id: string, version: number): boolean {
//         if (!this.hasSentState(classType, id)) return false;
//
//         const state = this.getSentState(classType, id);
//         return state.listeners > 0 && (state.lastSentVersion === undefined || (version === 0 || version > state.lastSentVersion));
//     }
//
    public decreaseUsage<T>(classType: ClassType<T>, id: string) {
        // const state = this.getSentState(classType, id);
        // state.listeners--;
        //
        // if (state.listeners <= 0) {
        //     this.rmSentState(classType, id);
        // }
    }
//
//     private increaseUsage<T extends IdInterface>(classType: ClassType<T>, id: string) {
//         const state = this.getSentState(classType, id);
//         state.listeners++;
//
//         this.subscribeEntity(classType);
//     }
//
//     subscribeEntity<T extends IdInterface>(classType: ClassType<T>) {
//         if (this.entitySubscribed.has(classType)) {
//             //already subscribed, nothing to do here
//             return;
//         }
//         this.entitySubscribed.add(classType);
//
//         const entityName = getEntityName(classType);
//
//         const sub = this.exchange.subscribeEntity(classType, (message: ExchangeEntity) => {
//             if (message.type === 'removeMany') {
//                 for (const id of message.ids) {
//                     this.rmSentState(classType, id);
//                 }
//
//                 this.writer.write({
//                     type: 'entity/removeMany',
//                     entityName: entityName,
//                     ids: message.ids,
//                 });
//                 return;
//             }
//
//             // useful debugging lines
//             // const state = this.getSentState(classType, message.id);
//             // console.log('subscribeEntity message', entityName, this.needsToBeSend(classType, message.id, message.version), message);
//
//             if (this.needsToBeSend(classType, message.id, message.version)) {
//                 this.setSent(classType, message.id, message.version);
//
//                 if (message.type === 'patch') {
//                     this.writer.write({
//                         type: 'entity/patch',
//                         entityName: entityName,
//                         id: message.id,
//                         version: message.version,
//                         patch: message.patch
//                     });
//                 } else if (message.type === 'remove') {
//                     //we remove it from our sentState, so we stop syncing changes
//                     //this works, since subscribeEntity() and findOne() is always made
//                     //no the same connection. If a different connection calls findOne()
//                     //it also calls subscribeEntity.
//
//                     this.rmSentState(classType, message.id);
//
//                     this.writer.write({
//                         type: 'entity/remove',
//                         entityName: entityName,
//                         id: message.id,
//                         version: message.version,
//                     });
//                 } else if (message.type === 'update') {
//                     this.writer.write({
//                         type: 'entity/update',
//                         entityName: entityName,
//                         id: message.id,
//                         version: message.version,
//                         data: message.item
//                     });
//                 } else if (message.type === 'add') {
//                     //nothing to do.
//                 }
//             }
//         });
//
//         this.entitySubscription.set(classType, sub);
//     }
//
//     // multiCount<T extends IdInterface>(classType: ClassType<T>, filters: { [p: string]: any }[] = []): Observable<CountResult> {
//     //     return new Observable((observer) => {
//     //         let fieldSub: AsyncSubscription;
//     //         let sub: Subscription;
//     //         let running = true;
//     //
//     //         (async () => {
//     //             const filterFields: { [id: string]: boolean } = {};
//     //             const counters: number[] = [];
//     //             const ids: { [id: string]: boolean }[] = [];
//     //
//     //             for (const filter of filters) {
//     //                 counters.push(0);
//     //                 ids.push({});
//     //                 for (const field of Object.keys(filter)) {
//     //                     filterFields[field] = true;
//     //                 }
//     //
//     //             }
//     //
//     //             fieldSub = await this.exchange.subscribeEntityFields(classType, Object.keys(filterFields));
//     //
//     //             sub = this.exchange.subscribeEntity(classType, (message) => {
//     //                 if (message.type === 'add') {
//     //                     for (const [i, filter] of eachPair(filters)) {
//     //                         if (!ids[i][message.id] && findQuerySatisfied(message.item, filter)) {
//     //                             counters[i]++;
//     //                             ids[i][message.id] = true;
//     //                             observer.next({
//     //                                 type: 'count',
//     //                                 index: i,
//     //                                 count: counters[i]
//     //                             });
//     //                         }
//     //                     }
//     //                 }
//     //
//     //                 if (message.type === 'patch' || message.type === 'update') {
//     //                     for (const [i, filter] of eachPair(filters)) {
//     //                         if (ids[i][message.id] && !findQuerySatisfied(message.item, filter)) {
//     //                             counters[i]--;
//     //                             delete ids[i][message.id];
//     //                             observer.next({
//     //                                 type: 'count',
//     //                                 index: i,
//     //                                 count: counters[i]
//     //                             });
//     //                         } else if (!ids[i][message.id] && findQuerySatisfied(message.item, filter)) {
//     //                             counters[i]++;
//     //                             ids[i][message.id] = true;
//     //                             observer.next({
//     //                                 type: 'count',
//     //                                 index: i,
//     //                                 count: counters[i]
//     //                             });
//     //                         }
//     //                     }
//     //                 }
//     //
//     //                 if (message.type === 'remove') {
//     //                     for (const [i, filter] of eachPair(filters)) {
//     //                         if (ids[i][message.id]) {
//     //                             counters[i]--;
//     //                             delete ids[i][message.id];
//     //                             observer.next({
//     //                                 type: 'count',
//     //                                 index: i,
//     //                                 count: counters[i]
//     //                             });
//     //                         }
//     //                     }
//     //                 }
//     //             });
//     //
//     //             for (const [i, filter] of eachPair(filters)) {
//     //                 const rawPlainCursor = await this.exchangeDatabase.rawPlainCursor(classType, filter);
//     //                 rawPlainCursor.project({id: 1}).batchSize(64);
//     //
//     //                 while (running && await rawPlainCursor.hasNext()) {
//     //                     const next = await rawPlainCursor.next();
//     //                     if (!next) continue;
//     //                     const item = partialMongoToPlain(classType, next);
//     //                     counters[i]++;
//     //                     ids[i][item.id] = true;
//     //                 }
//     //
//     //                 observer.next({
//     //                     type: 'count',
//     //                     index: i,
//     //                     count: counters[i]
//     //                 });
//     //             }
//     //         })();
//     //
//     //
//     //         return {
//     //             unsubscribe: async () => {
//     //                 running = false;
//     //                 sub.unsubscribe();
//     //                 await fieldSub.unsubscribe();
//     //             }
//     //         };
//     //     });
//     // }
//
//     public count<T extends IdInterface>(classType: ClassType<T>, filter: FilterQuery<T>): Observable<number> {
//         return new Observable((observer) => {
//             let fieldSub: AsyncSubscription;
//             let sub: Subscription;
//             let running = true;
//
//             (async () => {
//                 const knownIDs: { [id: string]: boolean } = {};
//                 const filterFields: { [name: string]: boolean } = {};
//                 //todo, we expect filter to have class instance as parameters (Date, etc), so we need to convert it to JSON parameters first, or whatever findQuerySatisfied needs.
//                 convertPlainQueryToMongo(classType, filter, filterFields);
//                 let counter = 0;
//
//                 fieldSub = await this.exchange.subscribeEntityFields(classType, Object.keys(filterFields));
//
//                 sub = await this.exchange.subscribeEntity(classType, (message) => {
//                     if (message.type === 'add') {
//                         if (!knownIDs[message.id] && findQuerySatisfied(message.item, filter)) {
//                             counter++;
//                             knownIDs[message.id] = true;
//                             observer.next(counter);
//                         }
//                     }
//
//                     if (message.type === 'patch' || message.type === 'update') {
//                         if (knownIDs[message.id] && !findQuerySatisfied(message.item, filter)) {
//                             counter--;
//                             delete knownIDs[message.id];
//                             observer.next(counter);
//                         } else if (!knownIDs[message.id] && findQuerySatisfied(message.item, filter)) {
//                             counter++;
//                             knownIDs[message.id] = true;
//                             observer.next(counter);
//                         }
//                     }
//
//                     if (message.type === 'remove') {
//                         if (knownIDs[message.id]) {
//                             counter--;
//                             delete knownIDs[message.id];
//                             observer.next(counter);
//                         }
//                     }
//                 });
//
//
//                 const items = await this.database.query(classType).filter(filter).select(['id']).find();
//
//                 for (const item of items) {
//                     counter++;
//                     knownIDs[item.id] = true;
//                 }
//
//                 observer.next(counter);
//             })();
//
//
//             return {
//                 unsubscribe: async () => {
//                     running = false;
//                     sub.unsubscribe();
//                     await fieldSub.unsubscribe();
//                 }
//             };
//         });
//     }
//
//     public async findOneOrUndefined<T extends IdInterface>(classType: ClassType<T>, filter: FilterQuery<T> = {}): Promise<EntitySubject<T> | undefined> {
//         const item = await this.database.query(classType).filter(filter).findOneOrUndefined();
//
//         if (item) {
//             const foundId = item.id;
//
//             this.increaseUsage(classType, foundId);
//             //we must start with version 0, since exchange issues from 0
//             //we don't care about the item.version
//             this.setSent(classType, item.id, 0);
//             this.subscribeEntity(classType);
//
//             return new EntitySubject<T>(item, () => {
//                 this.decreaseUsage(classType, foundId);
//             });
//         }
//         return;
//     }
//
//     public async findOne<T extends IdInterface>(classType: ClassType<T>, filter: FilterQuery<T> = {}): Promise<EntitySubject<T>> {
//         const item = await this.database.query(classType).filter(filter).findOne();
//
//         const foundId = item.id;
//         this.increaseUsage(classType, foundId);
//
//         //we must start with version 0, since exchange issues from 0
//         //we don't care about the item.version
//         this.setSent(classType, item.id, 0);
//         this.subscribeEntity(classType);
//
//         return new EntitySubject(item, () => {
//             this.decreaseUsage(classType, foundId);
//         });
//     }
//
//     collection<T extends IdInterface>(classType: ClassType<T>) {
//         return new FindOptions(classType, this);
//     }
//
//     /**
//      * For performance reasons, this returns a JSONObjectCollection. Use plainToClass() if you want to work with the result. TODO add option to support regular Collection as well.
//      */
//     async find<T extends IdInterface, K extends keyof T & string>(
//         options: FindOptions<T>
//     ): Promise<JSONObjectCollection<T>> {
//         const jsonCollection = new JSONObjectCollection<T>(options.classType);
//
//         if (options.isPaginationEnabled()) {
//             jsonCollection.pagination._activate();
//             if (options._page) {
//                 jsonCollection.pagination.setPage(options._page);
//             }
//             if (options._itemsPerPage) {
//                 jsonCollection.pagination.setItemsPerPage(options._itemsPerPage);
//             }
//             if (options.hasSort()) {
//                 jsonCollection.pagination.setSort(options._sorts);
//             }
//
//             jsonCollection.pagination.setParameters(options._filterParameters);
//         }
//
//         //todo, that doesnt work with parameters
//         const reactiveQuery = options._filter;
//         reactiveQuery.parameters = options._filterParameters;
//
//         const knownIDs: { [id: string]: boolean } = {};
//
//         await reactiveQuery.setupProviders(this);
//
//         const initialClassQuery = reactiveQuery.getClassQuery();
//
//         let currentQuery = initialClassQuery.query;
//
//         const getCursor = (fields?: (keyof T | string)[]): DatabaseQuery<T> => {
//             if (!fields) {
//                 fields = options._fields;
//             }
//
//             if (fields && fields.length > 0) {
//                 return this.database.query(options.classType)
//                     .filter(currentQuery)
//                     .select([...fields, 'id', 'version'] as string[])
//                     .asJSON()
//                 ;
//             }
//
//             return this.database.query(options.classType).filter(currentQuery).asJSON();
//         };
//
//         const getJsonItem = async (id: string) => {
//             return this.database.query(options.classType)
//                 .filter({id: id})
//                 .select((options.isPartial() ? [...options._fields, 'id', 'version'] : []) as string[])
//                 .asJSON()
//                 .findOne();
//         };
//
//         const applyPagination = <T>(query: DatabaseQuery<T>) => {
//             if (jsonCollection.pagination.isActive()) {
//                 query.limit(jsonCollection.pagination.getItemsPerPage());
//                 query.skip((jsonCollection.pagination.getPage() * jsonCollection.pagination.getItemsPerPage()) - jsonCollection.pagination.getItemsPerPage());
//
//                 if (jsonCollection.pagination.hasSort()) {
//                     const sort: { [path: string]: 'asc' | 'desc' } = {};
//                     for (const order of jsonCollection.pagination.getSort()) {
//                         sort[order.field] = order.direction;
//                     }
//                     query.sort(sort);
//                 }
//             }
//         };
//
//         let updateCollectionPromise: Promise<void> | undefined;
//         let pagingHash = '';
//         let parametersHash = '';
//
//         //todo, throttle to max 1 times per second
//         const updateCollection = async (databaseChanged: boolean = false) => {
//             while (updateCollectionPromise) {
//                 await sleep(0.01);
//                 await updateCollectionPromise;
//             }
//
//             return updateCollectionPromise = new Promise<void>(async (resolve, reject) => {
//                 try {
//
//                     //when database is changed during entityFeed events, we don't check that stuff
//                     if (databaseChanged) {
//                         pagingHash = jsonCollection.pagination.getPagingHash();
//                         parametersHash = jsonCollection.pagination.getParametersHash();
//                     } else {
//                         const newPagingHash = jsonCollection.pagination.getPagingHash();
//                         const newParametersHash = jsonCollection.pagination.getParametersHash();
//                         let needUpdate = false;
//
//                         if (pagingHash !== newPagingHash) {
//                             pagingHash = newPagingHash;
//                             needUpdate = true;
//                         }
//
//                         if (parametersHash !== newParametersHash) {
//                             parametersHash = newParametersHash;
//                             if (reactiveQuery.haveParametersChanged()) {
//                                 needUpdate = true;
//                             }
//                         }
//
//                         if (!needUpdate) {
//                             // console.log('updateCollection needUpdate=false', getClassName(reactiveQuery.classType), newPagingHash, newParametersHash);
//                             return;
//                         }
//                     }
//
//                     currentQuery = reactiveQuery.getClassQuery().query;
//
//                     const cursor = await getCursor(['id']);
//                     const total = await cursor.clone().count();
//
//                     applyPagination(cursor);
//
//                     const items = await cursor.find();
//
//                     // console.log('updateCollection needUpdate=true', getClassName(reactiveQuery.classType), currentQuery, items);
//
//                     const copiedKnownIds = {...knownIDs};
//
//                     jsonCollection.batchStart();
//                     try {
//                         //todo, detect when whole page changed, so we can load&add all new items at once, instead of one-by-one.
//                         for (const item of items) {
//                             delete copiedKnownIds[item.id];
//
//                             if (!knownIDs[item.id]) {
//                                 knownIDs[item.id] = true;
//                                 if (options.isChangeFeedActive()) {
//                                     this.increaseUsage(options.classType, item.id);
//                                 }
//
//                                 const fullItem = await getJsonItem(item.id);
//
//                                 //we send on purpose the item as JSON object, so we don't double convert it back in ConnectionMiddleware.actionMessageOut
//                                 if (fullItem) {
//                                     jsonCollection.add(fullItem);
//                                 } else {
//                                     console.warn('ID not found anymore', item.id);
//                                 }
//                             }
//                         }
//
//                         //items left in copiedKnownIds have been deleted or filter doesn't match anymore.
//                         for (const id of eachKey(copiedKnownIds)) {
//                             delete knownIDs[id];
//                             if (options.isChangeFeedActive()) {
//                                 this.decreaseUsage(options.classType, id);
//                             }
//                         }
//
//                         const idsToRemove = Object.keys(copiedKnownIds);
//                         if (idsToRemove.length > 0) {
//                             jsonCollection.removeMany(idsToRemove);
//                         }
//
//                         //todo, call it only when really changed
//                         jsonCollection.setSort(items.map(v => v.id));
//
//                         if (jsonCollection.pagination.getTotal() !== total) {
//                             jsonCollection.pagination.setTotal(total);
//                             jsonCollection.pagination.event.next({type: 'internal_server_change'});
//                         }
//                     } finally {
//                         jsonCollection.batchEnd();
//                     }
//                 } catch (error) {
//                     console.error('updateCollection error', getClassName(reactiveQuery.classType), error);
//                     updateCollectionPromise = undefined;
//                     reject(error);
//                 } finally {
//                     updateCollectionPromise = undefined;
//                     resolve();
//                 }
//             });
//         };
//
//         jsonCollection.pagination.event.subscribe(async (event) => {
//             if (event.type === 'client:apply' || event.type === 'apply') {
//                 // console.log(event.type, getClassName(reactiveQuery.classType));
//
//                 await reactiveQuery.setAndApplyParameters(jsonCollection.pagination.getParameters());
//
//                 await updateCollection();
//
//                 if (event.type === 'client:apply') {
//                     jsonCollection.pagination.event.next({type: 'server:apply/finished'});
//                 }
//
//                 if (event.type === 'apply') {
//                     jsonCollection.pagination._applyFinished();
//                 }
//             }
//         });
//
//         //triggered when a sub query changed its values. It changed our parameters basically.
//         reactiveQuery.internalParameterChange.subscribe(async () => {
//             await updateCollection(true);
//         });
//
//         if (options.isChangeFeedActive()) {
//             this.subscribeEntity(options.classType);
//         }
//
//         const fieldSub: AsyncSubscription = await this.exchange.subscribeEntityFields(options.classType, initialClassQuery.fieldNames);
//
//         const sub: Subscription = await this.exchange.subscribeEntity(options.classType, async (message: ExchangeEntity) => {
//             // console.log(
//             //     'subscribeEntity message', getEntityName(options.classType), (message as any)['id'],
//             //     {
//             //         known: knownIDs[(message as any)['id']],
//             //         querySatisfied: (message as any).item ? findQuerySatisfied((message as any).item, currentQuery) : 'no .item',
//             //         paginationActive: jsonCollection.pagination.isActive()
//             //     },
//             //     currentQuery,
//             //     message
//             // );
//
//             if (message.type === 'removeMany') {
//                 if (jsonCollection.pagination.isActive()) {
//                     updateCollection(true);
//                 } else {
//                     for (const id of message.ids) {
//                         delete knownIDs[id];
//
//                         if (options.isChangeFeedActive()) {
//                             this.decreaseUsage(options.classType, id);
//                         }
//                     }
//
//                     jsonCollection.removeMany(message.ids);
//                 }
//
//                 return;
//             }
//
//             if (!knownIDs[message.id] && message.type === 'add' && findQuerySatisfied(message.item, currentQuery)) {
//                 if (jsonCollection.pagination.isActive()) {
//                     updateCollection(true);
//                 } else {
//                     knownIDs[message.id] = true;
//                     if (options.isChangeFeedActive()) {
//                         this.increaseUsage(options.classType, message.id);
//                     }
//                     //we send on purpose the item as JSON object, so we don't double convert it back in ConnectionMiddleware.actionMessageOut
//                     jsonCollection.add(message.item);
//                 }
//             }
//
//             if ((message.type === 'update' || message.type === 'patch') && message.item) {
//                 const querySatisfied = findQuerySatisfied(message.item, currentQuery);
//
//                 if (knownIDs[message.id] && !querySatisfied) {
//                     if (jsonCollection.pagination.isActive()) {
//                         updateCollection(true);
//                     } else {
//                         //got invalid after updates?
//                         delete knownIDs[message.id];
//                         if (options.isChangeFeedActive()) {
//                             this.decreaseUsage(options.classType, message.id);
//                         }
//                         jsonCollection.remove(message.id);
//                     }
//                 } else if (!knownIDs[message.id] && querySatisfied) {
//                     if (jsonCollection.pagination.isActive()) {
//                         updateCollection(true);
//                     } else {
//                         //got valid after updates?
//                         knownIDs[message.id] = true;
//                         if (options.isChangeFeedActive()) {
//                             this.increaseUsage(options.classType, message.id);
//                         }
//
//                         let itemToSend = message.item;
//                         if (message.type === 'patch') {
//                             //message.item is not complete when message.type === 'patch', so load it
//                             itemToSend = await getJsonItem(message.id);
//                         }
//
//                         //we send on purpose the item as JSON object, so we don't double convert it back in ConnectionMiddleware.actionMessageOut
//                         jsonCollection.add(itemToSend);
//                     }
//                 }
//             }
//
//             if (message.type === 'remove' && knownIDs[message.id]) {
//                 if (jsonCollection.pagination.isActive()) {
//                     //todo, we should probablt throttle that, so this is max every second called
//                     updateCollection(true);
//                 } else {
//                     delete knownIDs[message.id];
//                     if (options.isChangeFeedActive()) {
//                         this.decreaseUsage(options.classType, message.id);
//                     }
//                     jsonCollection.remove(message.id);
//                 }
//             }
//         });
//
//         jsonCollection.addTeardown(async () => {
//             reactiveQuery.unsubscribe();
//             for (const id of eachKey(knownIDs)) {
//                 this.decreaseUsage(options.classType, id);
//             }
//             sub.unsubscribe();
//             await fieldSub.unsubscribe();
//         });
//
//         const cursor = await getCursor();
//         const total = await cursor.clone().count();
//         jsonCollection.pagination.setTotal(total);
//         applyPagination(cursor);
//
//         const items = await cursor.find();
//
//         for (const item of items) {
//             knownIDs[item.id] = true;
//             if (options.isChangeFeedActive()) {
//                 this.increaseUsage(options.classType, item.id);
//             }
//         }
//
//         jsonCollection.set(items);
//
//         return jsonCollection;
//     }
}
