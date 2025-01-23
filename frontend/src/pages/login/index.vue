<template>
  <div style="display: flex; flex-direction: column">
    <div style="display: flex; justify-content: space-between">
      <div style="width: 400px; float: left">
        <div v-if="cfg.notice" v-html="cfg.notice"></div>
      </div>
    </div>
    <div class="login-container">
      <t-card class="login-card">
        <h2 class="login-title">
          <component :is="LogoOpenai" style="margin-bottom: 50px"></component>

          <div v-if="IsRegister">Register</div>
          <div v-else>Please Sign In</div>
        </h2>
        <t-loading :loading="loading">
          <t-form :data="loginForm" :label-width="0" :rules="rules" ref="loginFormRef" @submit="onSubmit">
            <t-form-item name="username">
              <t-input v-model="loginForm.username" placeholder="Email"></t-input>
            </t-form-item>
            <t-form-item name="password">
              <t-input v-model="loginForm.password" type="password" autocomplete="on" placeholder="Password"></t-input>
            </t-form-item>

            <t-form-item v-if="loginType === 'register'" name="chatgpt_token">
              <div style="display: flex; flex-direction: column; width: 100%">
                <t-textarea
                  v-model="loginForm.chatgpt_token"
                  placeholder="ChatGPT Cookies Token"
                  size="large"
                ></t-textarea>
                <span style="font-size: 12px; color: #888">
                  Session Token 获取说明：
                  <t-link target="_blank" theme="primary" size="small" :href="ChatgptTokenTutorialUrl">手动获取</t-link>
                  <!-- or
                  <t-link target="_blank" theme="primary" size="small" :href="ChatgptTokenAuthUrl">自动获取</t-link> -->
                </span>
              </div>
            </t-form-item>

            <t-form-item>
              <t-button theme="success" type="submit" size="large" class="login-button">
                Sign In
              </t-button>
            </t-form-item>
          </t-form>
        </t-loading>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormInstanceFunctions, FormProps, FormRule } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LogoOpenai from '@/assets/openai-logo.svg';
import { ChatgptTokenTutorialUrl } from '@/constants/index';
import { useUserStore } from '@/store';

const userStore = useUserStore();
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const cfg = ref({ show_github: false, notice: '' });
const loginForm = reactive({
  username: '',
  password: '',
  chatgpt_token: undefined,
  invite_token: undefined,
  invite_id: undefined,
});

onMounted(async () => {
  await getVersionCfg();
});

const rules: Record<string, FormRule[]> = {
  username: [{ required: true, message: 'must be filled', trigger: 'blur' }],
  password: [{ required: true, message: 'must be filled', trigger: 'blur' }],
  chatgpt_token: [
    { required: true, message: 'Please contact admin for update', trigger: 'blur' },
  ],
};

const loginFormRef = ref<FormInstanceFunctions>(null);

const IsRegister = computed(() => {
  // console.log('route.path', route.path, route.path.endsWith('/register'));
  return !route.path.endsWith('/login');
});

const loginType = computed(() => {
  if (route.path.endsWith('/register')) {
    return 'register';
  }
  if (route.path.endsWith('/invite_register')) {
    return 'invite_register';
  }
  return 'login';
});

const onSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    loading.value = true;
    let url;

    switch (loginType.value) {
      case 'register':
        url = '/0x/user/register';
        break;
      // case 'invite_register':
      //   url = '/api/invite-register';
      //   break;
      default:
        url = '/0x/user/login';
    }
    if (loginType.value === 'invite_register') {
      const { hash } = window.location;
      const paramsString = hash.split('?')[1];
      const params = new URLSearchParams(paramsString);
      loginForm.invite_token = params.get('invite_token');
      loginForm.invite_id = params.get('id');
    }

    // console.log(loginForm)
    const data = await userStore.login(url, loginForm);
    if (data.admin_token && data.is_admin) {
      router.push({ name: 'User' });
    } else if (data.admin_token) {
      return router.push({ name: 'LoginChatgpt' });
    }

    loading.value = false;
  } else {
    console.error('表单引用未定义', firstError);
  }
};

const getVersionCfg = async () => {
  const response = await fetch('/0x/user/version-cfg');
  const data = await response.json();
  Object.assign(cfg.value, { ...data });
};

const goFree = async () => {
  loading.value = true;
  const data = await userStore.login('/0x/user/login-free', {});
  if (data.admin_token) {
    return router.push({ name: 'LoginChatgpt' });
  }

  loading.value = false;
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.logo {
  width: 64px;
  margin-bottom: 20px;
}

.login-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
  height: 50px;
  background-color: #10a37f;
  border-color: #10a37f;
}

.login-button:hover {
  background-color: #0e8a6d;
  border-color: #0e8a6d;
}

:deep(.t-input) {
  height: 50px;
}
</style>
