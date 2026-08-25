<?php

namespace App\Service;

final class SocialNetworkService
{
    // The keys must stay in sync with the frontend icon registry
    // (frontend/src/icons/index.js) and with the admin-side registry
    // (AdminLinkController::ALLOWED_ICON_NAMES).
    public const NETWORKS = [
        'x'         => ['label' => 'X (Twitter)',  'iconName' => 'x',         'urlTemplate' => 'https://x.com/%s'],
        'instagram' => ['label' => 'Instagram',    'iconName' => 'instagram', 'urlTemplate' => 'https://instagram.com/%s'],
        'bluesky'   => ['label' => 'Bluesky',      'iconName' => 'bluesky',   'urlTemplate' => 'https://bsky.app/profile/%s'],
        'threads'   => ['label' => 'Threads',      'iconName' => 'threads',   'urlTemplate' => 'https://threads.net/@%s'],
        'mastodon'  => ['label' => 'Mastodon',     'iconName' => 'mastodon',  'urlTemplate' => 'https://%s'],
        'facebook'  => ['label' => 'Facebook',     'iconName' => 'facebook',  'urlTemplate' => 'https://facebook.com/%s'],
        'tiktok'    => ['label' => 'TikTok',       'iconName' => 'tiktok',    'urlTemplate' => 'https://tiktok.com/@%s'],
        'snapchat'  => ['label' => 'Snapchat',     'iconName' => 'snapchat',  'urlTemplate' => 'https://snapchat.com/add/%s'],
        'pinterest' => ['label' => 'Pinterest',    'iconName' => 'pinterest', 'urlTemplate' => 'https://pinterest.com/%s'],
        'youtube'   => ['label' => 'YouTube',      'iconName' => 'youtube',   'urlTemplate' => 'https://youtube.com/@%s'],
        'tumblr'    => ['label' => 'Tumblr',       'iconName' => 'tumblr',    'urlTemplate' => 'https://%s.tumblr.com'],
        'discord'   => ['label' => 'Discord',      'iconName' => 'discord',   'urlTemplate' => 'https://discord.com/users/%s'],
        'reddit'    => ['label' => 'Reddit',       'iconName' => 'reddit',    'urlTemplate' => 'https://reddit.com/user/%s'],
        'linkedin'  => ['label' => 'LinkedIn',     'iconName' => 'linkedin',  'urlTemplate' => 'https://linkedin.com/in/%s'],
        'whatsapp'  => ['label' => 'WhatsApp',     'iconName' => 'whatsapp',  'urlTemplate' => 'https://wa.me/%s'],
        'messenger' => ['label' => 'Messenger',    'iconName' => 'messenger', 'urlTemplate' => 'https://m.me/%s'],
        'slack'     => ['label' => 'Slack',        'iconName' => 'slack',     'urlTemplate' => 'https://%s.slack.com'],
        'telegram'  => ['label' => 'Telegram',     'iconName' => 'telegram',  'urlTemplate' => 'https://t.me/%s'],
        'onlyfans'  => ['label' => 'OnlyFans',     'iconName' => 'onlyfans',  'urlTemplate' => 'https://onlyfans.com/%s'],
        'mym'       => ['label' => 'MYM',          'iconName' => 'mym',       'urlTemplate' => 'https://mym.fans/@%s'],
        'fansly'    => ['label' => 'Fansly',       'iconName' => 'fansly',    'urlTemplate' => 'https://fansly.com/%s'],
        'throne'    => ['label' => 'Throne',       'iconName' => 'throne',    'urlTemplate' => 'https://throne.com/%s'],
        'twitch'    => ['label' => 'Twitch',       'iconName' => 'twitch',    'urlTemplate' => 'https://twitch.tv/%s'],
        'spotify'   => ['label' => 'Spotify',      'iconName' => 'spotify',   'urlTemplate' => 'https://open.spotify.com/user/%s'],
        'github'    => ['label' => 'GitHub',       'iconName' => 'github',    'urlTemplate' => 'https://github.com/%s'],
        'amazon'    => ['label' => 'Amazon (wishlist)', 'iconName' => 'amazon', 'urlTemplate' => 'https://www.amazon.fr/hz/wishlist/ls/%s'],
        'etsy'      => ['label' => 'Etsy',         'iconName' => 'etsy',      'urlTemplate' => 'https://etsy.com/shop/%s'],
        'vinted'    => ['label' => 'Vinted',       'iconName' => 'vinted',    'urlTemplate' => 'https://vinted.fr/member/%s'],
        'paypal'    => ['label' => 'PayPal',       'iconName' => 'paypal',    'urlTemplate' => 'https://paypal.me/%s'],
        'stripe'    => ['label' => 'Stripe',       'iconName' => 'stripe',    'urlTemplate' => 'https://buy.stripe.com/%s'],
    ];

    /** @return array<int, array{key: string, label: string, urlTemplate: string}> */
    public function getNetworks(): array
    {
        $networks = [];
        foreach (self::NETWORKS as $key => $network) {
            $networks[] = [
                'key' => $key,
                'label' => $network['label'],
                'urlTemplate' => $network['urlTemplate'],
            ];
        }

        return $networks;
    }

    public function isKnown(string $networkType): bool
    {
        return isset(self::NETWORKS[$networkType]);
    }

    public function getNetwork(string $networkType): ?array
    {
        return self::NETWORKS[$networkType] ?? null;
    }

    public function getIconName(string $networkType): ?string
    {
        return self::NETWORKS[$networkType]['iconName'] ?? null;
    }

    public function normalizeHandle(string $handle): string
    {
        return ltrim(trim($handle), '@');
    }

    public function buildUrl(string $networkType, string $handle): ?string
    {
        $network = $this->getNetwork($networkType);
        if ($network === null) {
            return null;
        }

        $normalized = $this->normalizeHandle($handle);
        if ($normalized === '') {
            return null;
        }

        if ($networkType === 'mastodon') {
            [$user, $instance] = array_pad(explode('@', $normalized, 2), 2, null);
            if ($user === null || $instance === null || $user === '' || $instance === '') {
                return null;
            }

            return 'https://' . $instance . '/@' . $user;
        }

        return sprintf($network['urlTemplate'], $normalized);
    }

    public function buildTitle(string $handle): string
    {
        return '@' . $this->normalizeHandle($handle);
    }
}
