export const BASE_URL = 'https://www.healthapp.online/'
// export const BASE_URL = 'http://192.168.86.23:9000/'

export const METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
}
export const URL = {
  LOGIN: 'token',
  PUSHTOKEN: 'update-push-token/',
  SIGNUP: 'users/',
  USER: 'users',
  FOOD: 'food/',
  FOODITEM: 'food-items/',
  FOODDETECT: 'food/detect/',
  MEAL: 'meals/',
  GETFOODIDS: 'food-id-strings/',
  BLOODGLUCOSE: 'blood-glucose/',
  PROFILE: 'profile/',
  HEALTHRECORD: 'health-records/',
  PASSWORDCHANGE: 'users/me/change-password',
  CLINICIAN: 'clinicians/',
  CLINICIAN_ASSIGNMENTS: 'clinician/assignments/',
  CLINICIAN_ASSIGNED_USERS: 'clinician/assigned-users/',
  CLINICIAN_VIEW_HEALTH_RECORD: 'clinician/view-health-record/',
  CLINICIAN_VIEW_MEAL_RECORD: 'clinician/view-meal/',
  ASSIGNED_CLINICIAN: 'users/clinicians/assigned/',
  TREND_ANALYSER: 'trend-analyzer/'
}
export const CONTENT_TYPE = {
  FORM: 'Content-Type: application/x-www-form-urlencoded',
  JSON: 'Content-Type: application/json'
}
