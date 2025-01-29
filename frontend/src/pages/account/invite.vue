<template>
  <div>
    <t-card>
      <t-form
        ref="inviteUserFormRef"
        :data="inviteUser"
        :rules="FORM_RULES"
        :label-width="100"
        style="width: 400px"
        @submit="handleInvite"
      >
        <t-form-item label="ChatGPT" name="username">
          <t-input v-model="inviteUser.chatgpt_username" disabled></t-input>
        </t-form-item>
        <t-form-item label="Expired Time" name="expires_time">
          <t-select v-model="inviteUser.expires_time" :options="ExpiresAtList" placeholder="Expired time"></t-select>
        </t-form-item>
        <t-form-item label="Invite count" name="invite_count">
          <t-input v-model="inviteUser.invite_count"></t-input>
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" type="submit">Submit</t-button>
        </t-form-item>
      </t-form>
    </t-card>
    <t-card>
      <t-table :data="tableData" :columns="columns" rowKey="chatgpt_username" :loading="tableLoading">
        <template #expires_at="{ row }">
          {{ TimestampToDate(row.created_at + row.expires_time * 1000) }}
        </template>

        <template #invite_url="{ row }">
          <!-- <t-icon name="file-copy"></t-icon> -->
          <t-tooltip content="已复制" theme="light">
            <t-link class="to" hover="color" @click="copyLink(getInviteUrl(row))">
              {{ getInviteUrl(row) }}
            </t-link>
          </t-tooltip>
        </template>

        <template #op="slotProps">
          <t-space>
            <t-link theme="danger" @click="handleClickDelete(slotProps.row)">Remove</t-link>
          </t-space>
        </template>
      </t-table>

      <!-- 确认删除 dialog -->
      <t-dialog
        v-model:visible="dialogVisibleDelete"
        header="Confirmation to remove this invitation link?"
        width="500"
        :on-confirm="handleDelete"
      >
      </t-dialog>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { FormInstanceFunctions, FormProps, MessagePlugin, TableProps } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import RequestApi from '@/api/request';
import { TimestampToDate } from '@/utils/date';

const route = useRoute();
const tableLoading = ref(false);
const INVITE_CODE_URI = '/api/admin/invite-user-code';
const dialogVisibleDelete = ref(false);
const idDelete = ref('');

const columns: TableProps['columns'] = [
  { colKey: 'id', title: 'ID' },
  { colKey: 'chatgpt_username', title: 'ChatGPT Username', width: 200 },
  { colKey: 'invite_count', title: 'Invite Count' },
  { colKey: 'used_count', title: 'Used Count' },
  { colKey: 'expires_at', title: 'Expired At', width: 200 },
  { colKey: 'invite_url', title: 'Invite URL', width: 300 },
  { width: 200, colKey: 'op', title: 'Action' },
];

onMounted(async () => {
  await getInviteCodeList();
});

const baseUrl = computed(() => {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
});

interface InviteUserForm {
  chatgpt_username: string;
  expires_time: number;
  invite_count: number;
}

interface TableData {}
const tableData = ref<TableData[]>([]);

const FORM_RULES: FormProps['rules'] = {
  chatgpt_username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  expires_time: [{ required: true, message: 'Please input expiration time', trigger: 'blur' }],
  invite_count: [{ required: true, message: 'Please input invite count', trigger: 'blur' }],
};
const ExpiresAtList = [
  { label: '5 Minute', value: 5 * 60 },
  { label: '10 Minute', value: 10 * 60 },
  { label: '30 Minute', value: 30 * 60 },
  { label: '1 Hour', value: 60 * 60 },
  { label: '6 Hour', value: 360 * 60 },
  { label: '1 Day', value: 1440 * 60 },
  { label: '3 Day', value: 2160 * 60 },
];
const inviteUserFormRef = ref<FormInstanceFunctions>(null);

const inviteUser = ref<InviteUserForm>({
  chatgpt_username: route.query.chatgpt_username as string,
  expires_time: 5 * 60,
  invite_count: 1,
});
const copyLink = (url: string) => {
  navigator.clipboard.writeText(url);
};

const getInviteUrl = (row: any) => {
  return `${baseUrl.value}/fe/#/invite_register?id=${row.id}&invite_token=${row.invite_token}`;
};

const getInviteCodeList = async () => {
  // 发送请求获取 Token 列表
  tableLoading.value = true;
  const response = await RequestApi(INVITE_CODE_URI);

  const data = await response.json();

  tableData.value = data.data;
  tableLoading.value = false;
};

const handleDelete = async () => {
  const response = await RequestApi(INVITE_CODE_URI, 'DELETE', { id: idDelete.value });

  const data = await response.json();
  dialogVisibleDelete.value = false;
  idDelete.value = '';

  if (response.status !== 200) {
    MessagePlugin.error(JSON.stringify(Object.values(data)[0]));
  } else {
    await getInviteCodeList();
    MessagePlugin.success('Deleted successfully');
  }
};

const addInviteCode = async () => {
  // 发送请求获取 Token 列表
  tableLoading.value = true;
  console.log(inviteUser.value);
  const response = await RequestApi(INVITE_CODE_URI, 'POST', inviteUser.value);
  const data = await response.json();
  tableLoading.value = false;
  if (response.status !== 200) {
    MessagePlugin.error(JSON.stringify(Object.values(data)[0]));
  } else {
    await getInviteCodeList();
    MessagePlugin.success('Deleted successfully');
  }
};

const handleInvite: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  console.log('validateResult', validateResult);
  if (validateResult === true) {
    console.log('inviteUser', inviteUser.value);
    await addInviteCode();
  } else {
    console.error('Form reference undefined', firstError);
  }
};

const handleClickDelete = (row: any) => {
  idDelete.value = row.id;
  dialogVisibleDelete.value = true;
};
</script>

<style scoped>
/* 单行文本溢出显示省略号「to ==> text-overflow」*/
.to {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
