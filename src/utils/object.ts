export function isString(obj: any) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isIp(ipaddress: string) {
  if (
    // eslint-disable-next-line max-len
    /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/.test(
      ipaddress,
    )
  ) {
    return true;
  }
  return false;
}

export function isDomains(domains: string) {
  const reg = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  const vals = domains.split(' ').map((val) => val.trim());

  return vals.every((val) => reg.test(val) || val === 'localhost');
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return defaultValue;
  }
  return JSON.parse(raw);
}

export function saveToStorage<T>(key: string, data: T): T {
  const dataStr = JSON.stringify(data);
  window.localStorage.setItem(key, dataStr);

  return data;
}
