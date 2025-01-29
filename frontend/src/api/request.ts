// eslint-disable-next-line simple-import-sort/imports
import { MessagePlugin } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store';

const RequestApi = async (url: string, method = 'GET', body: any = undefined) => {
  const userStore = useUserStore();
  const { token } = userStore;

  const router = useRouter();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `token ${token}`,
  };

  const response = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    router.push({ name: 'login' });
    return new Response();
  }

  if (response.status === 403) {
    router.push({ name: 'login' });
    return new Response();
  }

  if (response.status === 500) {
    MessagePlugin.error('system anomaly');
    return new Response();
  }

  if (response.status === 502) {
    MessagePlugin.error('Service not starting properly');
    return new Response();
  }

  return response;
};

export default RequestApi;
