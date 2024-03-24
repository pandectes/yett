import { COOKIE_NAME } from './constants';

// export const fixRegExp = (str) => new RegExp(str.replace(/[\\?.]/g, '\\$&'));

export function fixRegExp(rule) {
  return new RegExp(rule.replace(/[/\\.+?$()]/g, '\\$&').replace('*', '(.*)'));
}

export const toJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return false;
  }
};

export const getCookie = (name = COOKIE_NAME) => {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  let cookieValue;
  if (parts.length < 2) {
    cookieValue = {};
  } else {
    const popped = parts.pop();
    const splitted = popped.split(';');
    cookieValue = window.atob(splitted.shift());
  }
  const cookieValueParsed = toJson(cookieValue);
  if (cookieValueParsed !== false) {
    return cookieValueParsed;
  } else {
    return cookieValue;
  }
};

export const clog = (msg, fn = 'log') => {
  const p = new URLSearchParams(window.location.search);
  if (p.get('log')) {
    console[fn](`PandectesRules: ${msg}`);
  }
};

export function createScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}
