export const BASE_URL = import.meta.env.BASE_URL
export const AUTH_URL = encodeURI(`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=bl85f43cvyijabp6xwgu075twictrs&redirect_uri=${BASE_URL}/connect&scope=channel:manage:moderators moderator:read:banned_users moderator:read:blocked_terms moderator:read:chat_messages moderator:read:chat_settings moderator:read:moderators moderator:read:shield_mode moderator:read:suspicious_users moderator:read:unban_requests moderator:read:vips moderator:read:warnings user:bot user:read:chat user:read:moderated_channels`)

