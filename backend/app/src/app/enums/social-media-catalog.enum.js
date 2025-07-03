export const SocialMediCatalog = [
    {name: 'Twitter', domain: 'twitter', regex: /^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?twitter\.com\/(\w+)$/i, handle: /^@?(\w+)$/ },
    {name: 'Facebook', domain: 'facebook', regex: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i},
    {name: 'Linkedin', domain: 'linkedin', regex: /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm},
    {name: 'Telegram', domain: 'telegram', regex: /(https?:\/\/)?(www[.])?(telegram|t)\.me\/([a-zA-Z0-9!@#$%\^&*()={}:;<>+'-_]*)\/?$/},
    {name: 'Whatsapp', domain: 'whatsapp', regex: /^(https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]{22})$/},
    {name: 'Slack', domain: 'slack', regex: /https:\/\/[a-zA-Z0-9_\-]+.slack\.com\/+/g},
    {name: 'Discord', domain: 'discord', regex: /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g},
]