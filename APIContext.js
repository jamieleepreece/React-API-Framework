export const getTokens = () => {
  return {
    access_token: (window.localStorage.getItem('access_token') === 'undefined') ? null : window.localStorage.getItem('access_token'),
    token_type: (window.localStorage.getItem('token_type') === 'undefined') ? null : window.localStorage.getItem('token_type'),
    expires_in: (window.localStorage.getItem('expires_in') === 'undefined') ? null : window.localStorage.getItem('expires_in'),
    refresh_token: (window.localStorage.getItem('refresh_token') === 'undefined') ? null : window.localStorage.getItem('refresh_token'),
    expire_timestamp: (window.localStorage.getItem('expire_timestamp') === 'undefined') ? null : window.localStorage.getItem('expire_timestamp'),
  };
};

export const clearTokens = () => {
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('token_type');
  window.localStorage.removeItem('expires_in');
  window.localStorage.removeItem('refresh_token');
  window.localStorage.removeItem('expire_timestamp');
};

export const setLocal = (params: Object, callback: () => {} = null) => {
  for (let key in params) {
    window.localStorage.setItem(key, params[key]);
  }
  if (callback != null) {
    callback();
  }
};

export const setObject = (key, object, callback: () => {} = null) => {
  window.localStorage.setItem(key, JSON.stringify(object));

  if (callback != null) {
    callback();
  }
};

export const setMultipleObjects = (associationObject, callback: () => {} = null) => {

  for (var key in associationObject) {
    window.localStorage.setItem(key, JSON.stringify(associationObject[key]));
  }

  if (callback != null) {
    callback();
  }
};

export const getObject = (key) => {
    return JSON.parse(window.localStorage.getItem(key) || '{}');
};

export const removeKey = (key) => {
  return window.localStorage.removeItem(key);
}

export const clearLocal = () => {
  window.localStorage.clear();
};

export const generateStateString = (target) => {
  return (typeof target === 'undefined') ? '' : target;
};

export const generateStateNull = (target) => {
  return (typeof target === 'undefined') ? null : target;
};

export const checkValueExists = (target) => {
  let bool = true;
  if (typeof target === 'undefined') {
    bool = false;
  }
  else if (target === null) {
    bool = false;
  }
  return bool;
};

export const checkValueExistsAndIs = (targetObject, key, value) => {
  let objectExists = false;
  let valueExists = false;
  objectExists = checkValueExists(targetObject);

  if (objectExists === true){
    if (targetObject[key] == value) {
      valueExists = true;
    }
  }
  return valueExists;
};

export const checkToggleValueCustom = (target, value) => {
  return (typeof target === 'undefined') ? value : target;
};


/* 
  Localstorage keys 

  - access_token
  - token_type
  - expires_in
  - refresh_token
  - expire_timestamp

  - user
  - delivery_addresses
  - billing_address
  - subscription

*/ 