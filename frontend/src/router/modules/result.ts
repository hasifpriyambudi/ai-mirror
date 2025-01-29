import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/result',
    name: 'result',
    component: Layout,
    redirect: '/result/success',
    meta: {
      title: {
        zh_CN: 'Result',
        en_US: 'Result',
      },
      icon: 'check-circle',
    },
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: () => import('@/pages/result/success/index.vue'),
        meta: {
          title: {
            zh_CN: 'Success',
            en_US: 'Success',
          },
        },
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: () => import('@/pages/result/fail/index.vue'),
        meta: {
          title: {
            zh_CN: 'Fail',
            en_US: 'Fail',
          },
        },
      },
      {
        path: 'network-error',
        name: 'ResultNetworkError',
        component: () => import('@/pages/result/network-error/index.vue'),
        meta: {
          title: {
            zh_CN: 'Network Error',
            en_US: 'Network Error',
          },
        },
      },
      {
        path: '403',
        name: 'Result403',
        component: () => import('@/pages/result/403/index.vue'),
        meta: { title: { zh_CN: 'Forbidden', en_US: 'Forbidden' } },
      },
      {
        path: '404',
        name: 'Result404',
        component: () => import('@/pages/result/404/index.vue'),
        meta: { title: { zh_CN: 'Not Found', en_US: 'Not Found' } },
      },
      {
        path: '500',
        name: 'Result500',
        component: () => import('@/pages/result/500/index.vue'),
        meta: { title: { zh_CN: 'Server Error', en_US: 'Server Error' } },
      },
      {
        path: 'browser-incompatible',
        name: 'ResultBrowserIncompatible',
        component: () => import('@/pages/result/browser-incompatible/index.vue'),
        meta: { title: { zh_CN: 'BrowserIncompatible', en_US: 'BrowserIncompatible' } },
      },
      {
        path: 'maintenance',
        name: 'ResultMaintenance',
        component: () => import('@/pages/result/maintenance/index.vue'),
        meta: { title: { zh_CN: 'Maintenance', en_US: 'Maintenance' } },
      },
    ],
  },
];
