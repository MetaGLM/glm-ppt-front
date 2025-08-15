// 公共模块
export default {
  please_input: 'Please input {0}',
  please_select: 'Please select {0}',
  please_upload: 'Please upload {0}',
  not_empty: '{0} cannot be empty',
  tooltip: {
    copy: 'Copy',
    view: 'View',
    del: 'Delete',
    preivew: 'Preview'
  },
  dialog: {
    preview: 'Preview',
    tips: 'Tips'
  },
  upload: {
    upload: 'Upload',
    preparing: 'Preparing',
    uploading: 'Uploading',
    verifying: 'Verifying',
    verify_failed: 'Validation failed',
    check_reason: 'Check reason',
    upload_success: 'File uploaded successfully!',
    file_type_error: 'The file format is incorrect, please upload {type} format file!',
    file_size_error: 'Upload image size cannot exceed {size} MB!',
    file_size_error_no_unit: 'Upload file size cannot exceed {size} !',
    file_ext_error:
      'The maximum length of the file name (including the suffix) cannot exceed 100 characters',
    file_nums_error: 'The number of uploaded files cannot exceed {limit}!',
    upload_error: 'Upload failed',
    uploadLimit: `Only {0} file types are supported, with a maximum size of {1} MB per file.`,
    upload_limit_no_unit: `Only {0} file types are supported, with a maximum size of {1} per file.`,
    uploadLimit1: `Only {0} file types are supported, with no size limit per file.`,
    re_upload: 'Re-upload',
    size_error: 'Upload file size cannot exceed {size} MB!',
    uploading_tip1:
      'Leaving the page will cause your uploaded information to be cleared. Please confirm before proceeding.',
    uploading_tip2:
      'Switching selection will cause your uploaded information to be cleared. Please confirm before proceeding.',
    version_tip:
      'Your browser version is outdated and may cause restrictions on file upload functionality. Please upgrade your browser or use the latest version of Google Chrome.'
  },
  download: {
    success: 'Download successful',
    fail: 'Download failed'
  },
  qrcode: {
    text1: 'WeChat Customer Service'
  },
  index_bar: {
    title: 'Select Country/Region',
    search: 'Search',
    placeholder: 'Search countries and regions',
    empty_msg: 'The content you entered does not match'
  },
  prompt: 'Prompt',
  cancel: 'Cancel',
  close: 'Close',
  shumei: {
    verify_text: 'captcha',
    loading: 'Loading...'
  },
  // 组件内容新增
  Components: {
    useAccount: 'View the remittance account after authentication',
    pay: 'Pay {0}',
    payStatus: 'Purchase completed. View the resource package details now?',
    confirmValue:
      'After confirming the payment, the corresponding amount will be directly deducted from the account balance.',
    notEnough: 'Your account balance is ¥{0}, which is insufficient for payment. Please recharge.',
    payFail: 'Insufficient balance',
    buy: 'Purchase Resource Pack',
    dataFail: 'API returns abnormal data',
    getSuccess: 'Congratulations, you have successfully received it',
    goto: 'View Now',
    titleMap: {
      dify: 'You can use the Free Tokens after returning to Dify page',
      hai: 'Go to BigModel Platform'
    },
    pageination: {
      go: 'Go to page {0}'
    },
    marked: {
      text: 'Mark',
      cancel: 'Cancel Mark'
    }
  },
  bills: {
    outOfAccount: 'In billing',
    outOfAccountSuccess: 'Settled',
    unAccount: 'Unsettled'
  },
  payment_type: {
    postpaid: 'Postpaid',
    postpaid_adjustment: 'Postpaid (Adjustment)',
    prepaid: 'Prepaid',
    credit: 'Credit',
    credit_adjustment: 'Credit (Adjustment)'
  },
  view_mode: {
    day: 'By Day',
    detail: 'By Detail'
  },
  credit_status: {
    unopen: 'Not yet opened',
    closed: 'Closed',
    opened: 'Opened'
  },
  no_data: 'No Data',
  table: 'Table',
  radar_map: 'Radar Map',
  bar_chart: 'Bar Chart',
  create_success: 'Created Success',
  create_failed: 'Created Failed',
  model_categorys: [
    { value: 'LANGUAGE', label: 'LANGUAGE' },
    { value: 'PICTURE', label: 'PICTURE' },
    { value: 'EMBEDDING', label: 'EMBEDDING' },
    { value: 'CODE', label: 'CODE' },
    { value: 'CHARACTER', label: 'CHARACTER' },
    { value: 'FINE_TUNING', label: 'FINE_TUNING' },
    { value: 'VIDEO', label: 'VIDEO' },
    { value: 'NEW_FINE_TUNE', label: 'FINE_TUNING' },
    { value: 'PRIVATE', label: 'PRIVATE' },
    { value: 'OTHER', label: 'OTHER' }
  ],
  null_tip_text: '{0} Cannot be empty.',
  model_name: 'Name',
  model_code: 'Model Code',
  model_type: 'Model Type',
  average: 'Average',
  dstdev: 'Dstdev',
  median: 'Median',
  save: 'Save',
  saving: 'In save',
  auotSaved: 'Saved automatically',
  autoSaveFailed: 'Autosave failure {0}',
  retry: 'Retry',
  start_dialog: 'Start Dialog',
  start_recording: 'Start recording',
  stop_recording: 'Stop recording',
  recording_fail: 'Recording failed',
  sure_del: 'Confirm deletion',
  sure_remove: 'Confirm Remove',
  back: 'Back',
  drag_file_text: 'Drag and drop the file here',
  upload_file_limit_tip: 'Only one image can be uploaded at a time',
  sync_point: 'Synch Position',
  model_price_unit: {
    tokens: 'per thousand tokens',
    times: 'per session'
  },
  next_time_no_alert: 'No alert needed next time',
  copy_code: 'Copy code',
  input_parameters: 'Input Parameters',
  output_parameters: 'Output Parameters',
  fail: 'Fail',
  reload_page: 'Reload Page'
}
