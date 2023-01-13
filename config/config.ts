import { defineConfig } from '@umijs/max';
import { scripts, styles } from './splash';

export default defineConfig({
  history: {
    type: 'hash',
  },
  publicPath: 'auto',
  antd: {},
  access: false,
  model: {},
  initialState: false,
  request: false,
  layout: false,
  title: 'Hosts Manager',
  mfsu: {},
  routes: [
    {
      path: '/',
      redirect: '/hosts-manager',
    },
    {
      name: '首页',
      path: '/hosts-manager',
      component: './HostsManager',
    },
  ],
  npmClient: 'pnpm',
  scripts,
  styles
});
