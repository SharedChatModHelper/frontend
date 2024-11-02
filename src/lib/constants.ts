import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

export const BASE_URL = import.meta.env.BASE_URL
export const AUTH_URL = encodeURI(`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=bl85f43cvyijabp6xwgu075twictrs&redirect_uri=${BASE_URL}/connect&scope=channel:manage:moderators channel:manage:polls moderator:manage:banned_users moderator:read:banned_users moderator:read:blocked_terms moderator:read:chat_messages moderator:read:chat_settings moderator:read:followers moderator:read:moderators moderator:read:shield_mode moderator:read:suspicious_users moderator:read:unban_requests moderator:read:vips moderator:read:warnings user:bot user:read:chat user:read:moderated_channels`)
export const CLIENT_ID = "bl85f43cvyijabp6xwgu075twictrs"
export const BOT_ID = "1170196343"
export const TIME_AGO = new TimeAgo('en-US')

export const DEFAULT_PICTURES = [
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/13e5fa74-defa-11e9-809c-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/ce57700a-def9-11e9-842d-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/294c98b5-e34d-42cd-a8f0-140b72fba9b0-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/215b7342-def9-11e9-9a66-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/ebb84563-db81-4b9c-8940-64ed33ccfc7b-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/dbdc9198-def8-11e9-8681-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/998f01ae-def8-11e9-b95c-784f43822e80-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/ebe4cd89-b4f4-4cd9-adac-2f30151b4209-profile_image-50x50.png",
  "https://static-cdn.jtvnw.net/user-default-pictures-uv/de130ab0-def7-11e9-b668-784f43822e80-profile_image-50x50.png",
]
