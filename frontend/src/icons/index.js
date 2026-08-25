import * as LucideIcons from 'lucide-react';
import {
  SiX, SiInstagram, SiBluesky, SiThreads, SiFacebook, SiTiktok, SiSnapchat,
  SiPinterest, SiYoutube, SiTumblr, SiDiscord, SiReddit, SiWhatsapp,
  SiMessenger, SiOnlyfans, SiTwitch, SiGithub, SiSpotify, SiTelegram,
  SiEtsy, SiMastodon, SiVinted, SiPaypal, SiStripe,
} from 'react-icons/si';
import { FaLinkedinIn, FaAmazon, FaSlack } from 'react-icons/fa6';
import { ExternalLink, Gift, Heart, Star, Globe, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { ThroneIcon, MymIcon, FanslyIcon } from './local';

export const CATEGORIES = [
  { key: 'social', label: 'Social networks' },
  { key: 'creator', label: 'Creators & streaming' },
  { key: 'tech', label: 'Tech & dev' },
  { key: 'shop', label: 'Shopping' },
  { key: 'generic', label: 'Generic' },
];

export const ICONS = {
  x: { label: 'X (Twitter)', Icon: SiX, category: 'social' },
  instagram: { label: 'Instagram', Icon: SiInstagram, category: 'social' },
  bluesky: { label: 'Bluesky', Icon: SiBluesky, category: 'social' },
  threads: { label: 'Threads', Icon: SiThreads, category: 'social' },
  facebook: { label: 'Facebook', Icon: SiFacebook, category: 'social' },
  tiktok: { label: 'TikTok', Icon: SiTiktok, category: 'social' },
  snapchat: { label: 'Snapchat', Icon: SiSnapchat, category: 'social' },
  pinterest: { label: 'Pinterest', Icon: SiPinterest, category: 'social' },
  youtube: { label: 'YouTube', Icon: SiYoutube, category: 'social' },
  tumblr: { label: 'Tumblr', Icon: SiTumblr, category: 'social' },
  discord: { label: 'Discord', Icon: SiDiscord, category: 'social' },
  reddit: { label: 'Reddit', Icon: SiReddit, category: 'social' },
  linkedin: { label: 'LinkedIn', Icon: FaLinkedinIn, category: 'social' },
  whatsapp: { label: 'WhatsApp', Icon: SiWhatsapp, category: 'social' },
  messenger: { label: 'Messenger', Icon: SiMessenger, category: 'social' },
  telegram: { label: 'Telegram', Icon: SiTelegram, category: 'social' },
  mastodon: { label: 'Mastodon', Icon: SiMastodon, category: 'social' },
  spotify: { label: 'Spotify', Icon: SiSpotify, category: 'creator' },
  slack: { label: 'Slack', Icon: FaSlack, category: 'social' },
  onlyfans: { label: 'OnlyFans', Icon: SiOnlyfans, category: 'creator' },
  mym: { label: 'MYM', Icon: MymIcon, category: 'creator' },
  fansly: { label: 'Fansly', Icon: FanslyIcon, category: 'creator' },
  throne: { label: 'Throne', Icon: ThroneIcon, category: 'creator' },
  twitch: { label: 'Twitch', Icon: SiTwitch, category: 'creator' },
  github: { label: 'GitHub', Icon: SiGithub, category: 'tech' },
  amazon: { label: 'Amazon (wishlist)', Icon: FaAmazon, category: 'shop' },
  etsy: { label: 'Etsy', Icon: SiEtsy, category: 'shop' },
  vinted: { label: 'Vinted', Icon: SiVinted, category: 'shop' },
  paypal: { label: 'PayPal', Icon: SiPaypal, category: 'shop' },
  stripe: { label: 'Stripe', Icon: SiStripe, category: 'shop' },
  'external-link': { label: 'External link', Icon: ExternalLink, category: 'generic' },
  link: { label: 'Link', Icon: LinkIcon, category: 'generic' },
  gift: { label: 'Gift', Icon: Gift, category: 'generic' },
  heart: { label: 'Heart', Icon: Heart, category: 'generic' },
  star: { label: 'Star', Icon: Star, category: 'generic' },
  globe: { label: 'Website', Icon: Globe, category: 'generic' },
  mail: { label: 'Email', Icon: Mail, category: 'generic' },
  phone: { label: 'Phone', Icon: Phone, category: 'generic' },
};

export const ALLOWED_ICON_NAMES = Object.keys(ICONS);

export function resolveIcon(iconName) {
  if (!iconName) return ExternalLink;
  const entry = ICONS[iconName];
  if (entry) return entry.Icon;
  // Compatibility with legacy free-text values (dynamic lucide lookup)
  const pascalCase = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return LucideIcons[pascalCase] || ExternalLink;
}
