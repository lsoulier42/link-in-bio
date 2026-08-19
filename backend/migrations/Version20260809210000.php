<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260809210000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add subtitle, icon_url and display_style to link + backfill legacy links';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE link ADD subtitle VARCHAR(128) DEFAULT NULL, ADD icon_url VARCHAR(512) DEFAULT NULL, ADD display_style VARCHAR(16) DEFAULT \'card\' NOT NULL');

        // Backfill : tous les liens existants s'affichent en "carte".
        // Les liens réseau reçoivent un sous-titre "@handle" et un titre
        // correspondant au label de la plateforme (nouvelle sémantique du champ title).
        $this->addSql("UPDATE link SET display_style = 'card'");
        $this->addSql("UPDATE link SET subtitle = CONCAT('@', handle) WHERE network_type IS NOT NULL AND handle IS NOT NULL");
        $this->addSql(<<<'SQL'
            UPDATE link
            SET title = CASE network_type
                WHEN 'x'         THEN 'X (Twitter)'
                WHEN 'instagram' THEN 'Instagram'
                WHEN 'bluesky'   THEN 'Bluesky'
                WHEN 'threads'   THEN 'Threads'
                WHEN 'mastodon'  THEN 'Mastodon'
                WHEN 'facebook'  THEN 'Facebook'
                WHEN 'tiktok'    THEN 'TikTok'
                WHEN 'snapchat'  THEN 'Snapchat'
                WHEN 'pinterest' THEN 'Pinterest'
                WHEN 'youtube'   THEN 'YouTube'
                WHEN 'tumblr'    THEN 'Tumblr'
                WHEN 'reddit'    THEN 'Reddit'
                WHEN 'linkedin'  THEN 'LinkedIn'
                WHEN 'telegram'  THEN 'Telegram'
                WHEN 'onlyfans'  THEN 'OnlyFans'
                WHEN 'mym'       THEN 'MYM'
                WHEN 'fansly'    THEN 'Fansly'
                WHEN 'throne'    THEN 'Throne'
                WHEN 'twitch'    THEN 'Twitch'
                WHEN 'spotify'   THEN 'Spotify'
                WHEN 'github'    THEN 'GitHub'
                WHEN 'etsy'      THEN 'Etsy'
                WHEN 'vinted'    THEN 'Vinted'
                ELSE title
            END
            WHERE network_type IS NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE link DROP subtitle, DROP icon_url, DROP display_style');
    }
}
