import { IHost, IOSResponse } from '@/IType';
import { invoke } from '@tauri-apps/api';

const isWindows = process.platform === 'win32';

export const HOSTS = isWindows
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts';

export const PERMISSION_CMD = isWindows
  ? 'icacls ' + HOSTS + ' /grant "Users":F'
  : 'chmod ugo+rw ' + HOSTS;

export async function getOSHosts(): Promise<IHost[]> {
  const response = await invoke<IOSResponse<string>>('read_hosts', {
    filePath: HOSTS,
  });
  
  if (!response.success) {
    throw new Error(response.message);
  }

  const lines = response.data.split('\n');

  return lines.map((line) => {
    if (line.startsWith('#') || line === '') {
      return {
        ip: line,
        domain: line,
        disabled: false,
        invalid: true,
        alias: '',
      };
    }
    const firstSpaceIndex = line.indexOf(' ');
    return {
      ip: line.slice(0, firstSpaceIndex),
      domain: line.slice(firstSpaceIndex).trim(),
      disabled: false,
      invalid: false,
      alias: '',
    };
  });
}

async function saveFile(hosts: IHost[]): Promise<IHost[]> {
  const content = hosts
    .map((h) => {
      if (h.invalid) {
        return h.ip;
      }
      return `${h.ip} ${h.domain}`;
    })
    .join('\n');

  const response = await invoke<IOSResponse<string>>('write_hosts', {
    filePath: HOSTS,
    content: content,
  });

  if (!response.success) {
    throw new Error(response.message);
  }

  return getOSHosts();
}

export async function deleteOSHosts(host: IHost): Promise<IHost[]> {
  const osHosts = await getOSHosts();
  const nextHosts = osHosts.filter(
    (h) => h.ip != host.ip || h.domain !== host.domain,
  );

  return saveFile(nextHosts);
}

export async function addNewOSHost(host: IHost): Promise<IHost[]> {
  const osHosts = await getOSHosts();
  const nextHosts = [...osHosts, host];

  return saveFile(nextHosts);
}

export async function modifyOSHost(
  fieldName: keyof IHost,
  value: string,
  from: IHost,
): Promise<IHost[]> {
  const osHosts = await getOSHosts();

  const nextHosts = osHosts.map((h) => {
    if (from.ip === h.ip && from.domain === h.domain) {
      return {
        ...from,
        [fieldName]: value,
      };
    }
    return h;
  });

  return saveFile(nextHosts);
}

export async function isHostFileReadonly() {
  const response = await invoke<IOSResponse<boolean>>('is_file_readonly', { filePath: HOSTS });

  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
}

export async function changeHostWritable(password: string): Promise<boolean> {
  const response = await invoke<IOSResponse<boolean>>('change_file_writable', {
    filePath: HOSTS,
    password,
    isWindows,
  });

  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
}
