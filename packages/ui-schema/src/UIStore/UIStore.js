import React from 'react';
import {Record, Map, List} from 'immutable';
import {getDisplayName} from '../Utils/memo/getDisplayName';
import {createMap} from '../Utils/createMap';
import {relT} from '../Translate/relT';

const UIStoreContext = React.createContext({});
const UIMetaContext = React.createContext({});

// with store, onChange, schema
export const UIStoreProvider = ({children, ...props}) => <UIStoreContext.Provider value={props} children={children}/>;

// with widgets, t, showValidity
export const UIMetaProvider = ({children, ...props}) => <UIMetaContext.Provider value={props} children={children}/>;

// only to enable better minification, DO NOT EXPORT
const STR_INTERNALS = 'internals'
const STR_VALUES = 'values'
const STR_VALIDITY = 'validity'

export const UIStore = Record({
    values: undefined,
    internals: Map({}),
    validity: Map({}),
    valuesToJS: function() {
        const values = this.get(STR_VALUES)
        if(Map.isMap(values) || List.isList(values)) return values.toJS()

        return values
    },
    getValues: function() {
        return this.get(STR_VALUES)
    },
    getInternals: function() {
        return this.get(STR_INTERNALS)
    },
    getValidity: function() {
        return this.get(STR_VALIDITY)
    },
});

export const createStore = (values) => {
    return new UIStore({
        values,
        internals: Map({}),
        validity: Map({}),
    })
};

export const createEmptyStore = (type = 'object') => createStore(
    type === 'array' ?
        List([]) :
        type === 'string' ?
            '' :
            type === 'number' ?
                0 :
                type === 'boolean' ?
                    false :
                    Map({}),
);

export const useUI = () => {
    const {store, onChange, onChangeNext, schema} = React.useContext(UIStoreContext);

    return {store, onChange, onChangeNext, schema};
};

// todo: remove relT here, so Trans is fully optional
const tDefault = (text, context = {}, schema) =>
    relT(schema, context);

export const useUIMeta = () => {
    let context = React.useContext(UIMetaContext);
    if(!context.t) {
        context.t = tDefault;
    }
    return context;
};

/**
 * HOC to extract the value with the storeKeys, pushing only the component's value and onChange to it, not the whole store
 */
export const extractValue = (Component) => {
    const ExtractValue = p => {
        const {store, onChange, onChangeNext} = useUI();

        return <Component
            {...p} onChange={onChange} onChangeNext={onChangeNext}
            value={p.storeKeys.size ?
                (Map.isMap(store.getValues()) || List.isList(store.getValues()) ? store.getValues().getIn(p.storeKeys) : undefined)
                : store.getValues()}
            internalValue={p.storeKeys.size ? store.getInternals() ? store.getInternals().getIn(p.storeKeys) : createMap() : store.getInternals()}
        />
    };
    ExtractValue.displayName = `ExtractValue(${getDisplayName(Component)})`;
    return ExtractValue;
};

export const extractValidity = (Component) => {
    const ExtractValidity = p => {
        const {store, onChange} = useUI();
        return <Component {...p} validity={p.storeKeys.size ? store.getValidity().getIn(p.storeKeys) : store.getValidity()} onChange={onChange}/>
    };
    ExtractValidity.displayName = `ExtractValidity(${getDisplayName(Component)})`;
    return ExtractValidity;
};

export const withUIMeta = (Component) => {
    const WithUIMeta = p => {
        const meta = useUIMeta();
        return <Component {...p} {...meta}/>
    };
    WithUIMeta.displayName = `WithUIMeta(${getDisplayName(Component)})`;
    return WithUIMeta;
};

export const prependKey = (storeKeys, key) =>
    Array.isArray(storeKeys) ?
        [key, ...storeKeys] :
        storeKeys.splice(0, 0, key);

const shouldHandleRequired = (value, force, type) => {
    // todo: why is the type number check here
    if(!force && type !== 'number') return false

    switch(type) {
        case 'string':
        case 'number':
        case 'integer':
            return value === '' || typeof value === 'undefined' || (typeof value === 'string' && 0 === value.trim().length)
        case 'boolean':
            return !value
        case 'array':
            return (List.isList(value) && value.size === 0) || (Array.isArray(value) && value.length === 0)
        case 'object':
            return (Map.isMap(value) && value.keySeq().size === 0) || (typeof value === 'object' && Object.keys(value).length === 0)
    }

    return false;
};

export const shouldDeleteOnEmpty = shouldHandleRequired

const updateRawValue = (store, storeKeys, key, value, required = undefined, type = undefined) => {
    if(shouldHandleRequired(value, required, type)) {
        return store.deleteIn(storeKeys.size ? prependKey(storeKeys, key) : [key]);
    }
    return store.setIn(
        storeKeys.size ? prependKey(storeKeys, key) : [key],
        value,
    );
}
const deleteRawValue = (store, storeKeys, key) =>
    storeKeys.size ?
        store.deleteIn(prependKey(storeKeys, key)) :
        store.delete(key);

export const updateInternalValue = (storeKeys, internalValue) => store => {
    return updateRawValue(store, storeKeys, STR_INTERNALS, internalValue);
};

/**
 * Function capable of either updating a deep value in the `store`, or when in e.g. root-level directly the store (string as root-schema)
 */
export const updateValue = (storeKeys, value, required = undefined, type = undefined) => store => {
    return updateRawValue(store, storeKeys, STR_VALUES, value, required, type)
};

export const updateValues = (storeKeys, value, internalValue, required = undefined, type = undefined) => store => {
    store = updateRawValue(store, storeKeys, STR_INTERNALS, internalValue, required, type);
    return updateRawValue(store, storeKeys, STR_VALUES, value, required, type)
};

/**
 * Function capable of either updating a deep value in the `store`, or when in e.g. root-level directly the store (string as root-schema)
 */
export const updateValidity = (storeKeys, valid) => store => (
    updateRawValue(store, storeKeys.push('__valid'), STR_VALIDITY, valid)
);

export const cleanUp = (storeKeys, key) => store => (
    deleteRawValue(store, storeKeys, key)
);
